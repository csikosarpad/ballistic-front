<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/bootstrap.php';

try {
    $apiConfig = appConfig()['api'] ?? [];
} catch (Throwable $error) {
    apiError($error);
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = $apiConfig['allowed_origins'] ?? [];
if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
    http_response_code(403);
    exit;
}
if ($origin !== '') {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: ' . implode(', ', $apiConfig['allowed_methods'] ?? ['GET', 'POST', 'OPTIONS']));
header('Access-Control-Allow-Headers: ' . implode(', ', $apiConfig['allowed_headers'] ?? ['Authorization', 'Content-Type']));

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $pdo = database();
    $method = $_SERVER['REQUEST_METHOD'];
    $path = apiRequestPath();

    if ($method === 'POST' && $path === '/rooms') {
        $body = jsonBody();
        $name = playerName($body['playerName'] ?? null);
        $token = bin2hex(random_bytes(32));
        $setup = json_encode(['seed' => random_int(1, 999999999), 'starterIndex' => 0], JSON_THROW_ON_ERROR);
        $code = '';
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $code = newRoomCode();
            try {
                $statement = $pdo->prepare(
                    'INSERT INTO rooms (code, host_name, host_token_hash, setup, expires_at) VALUES (:code, :name, :token, :setup, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 24 HOUR))'
                );
                $statement->execute([
                    'code' => $code,
                    'name' => $name,
                    'token' => hash('sha256', $token),
                    'setup' => $setup,
                ]);
                break;
            } catch (PDOException $error) {
                if ($attempt === 4 || $error->getCode() !== '23000') {
                    throw $error;
                }
            }
        }
        $room = roomByCode($pdo, $code);
        respond(201, [
            'credentials' => ['roomCode' => $code, 'playerId' => 'P1', 'token' => $token],
            'update' => roomUpdate($pdo, $room, 0),
        ]);
    }

    if (preg_match('#^/rooms/([A-Z0-9]{6})/join$#', $path, $matches) && $method === 'POST') {
        $body = jsonBody();
        $name = playerName($body['playerName'] ?? null);
        $token = bin2hex(random_bytes(32));
        $pdo->beginTransaction();
        $room = roomByCode($pdo, $matches[1], true);
        if ($room['status'] !== 'waiting') {
            throw new ApiException(409, 'Room is no longer waiting for a player.');
        }
        $revision = (int) $room['revision'] + 1;
        $pdo->prepare('UPDATE rooms SET guest_name = :name, guest_token_hash = :token, status = \'ready\', revision = :revision WHERE id = :id')
            ->execute(['name' => $name, 'token' => hash('sha256', $token), 'revision' => $revision, 'id' => $room['id']]);
        $pdo->prepare('INSERT INTO room_events (room_id, revision, player_id, event_type, payload) VALUES (:room, :revision, \'P2\', \'player_joined\', :payload)')
            ->execute(['room' => $room['id'], 'revision' => $revision, 'payload' => json_encode(['name' => $name], JSON_THROW_ON_ERROR)]);
        $pdo->commit();
        $room = roomByCode($pdo, $matches[1]);
        respond(200, [
            'credentials' => ['roomCode' => $matches[1], 'playerId' => 'P2', 'token' => $token],
            'update' => roomUpdate($pdo, $room, 0),
        ]);
    }

    if (preg_match('#^/rooms/([A-Z0-9]{6})$#', $path, $matches) && $method === 'GET') {
        $room = roomByCode($pdo, $matches[1]);
        authenticateRoom($room, bearerToken());
        $since = filter_var($_GET['since'] ?? '0', FILTER_VALIDATE_INT);
        if ($since === false || $since < 0) {
            throw new ApiException(400, 'since must be a non-negative integer.');
        }
        respond(200, roomUpdate($pdo, $room, $since));
    }

    if (preg_match('#^/rooms/([A-Z0-9]{6})/events$#', $path, $matches) && $method === 'POST') {
        $body = jsonBody();
        $expected = positiveRevision($body['expectedRevision'] ?? null);
        $type = $body['type'] ?? null;
        $payload = $body['payload'] ?? null;
        if (!is_string($type) || !preg_match('/^[a-z][a-z0-9_]{0,31}$/', $type) || !($payload instanceof stdClass)) {
            throw new ApiException(400, 'Event type or payload is invalid.');
        }
        $payloadJson = json_encode($payload, JSON_THROW_ON_ERROR);
        if (strlen($payloadJson) > (int) ($apiConfig['max_payload_bytes'] ?? 262144)) {
            throw new ApiException(413, 'Event payload is too large.');
        }

        $pdo->beginTransaction();
        $room = roomByCode($pdo, $matches[1], true);
        $playerId = authenticateRoom($room, bearerToken());
        if (!in_array($room['status'], ['ready', 'playing'], true)) {
            throw new ApiException(409, 'Room is not accepting game events.');
        }
        if ((int) $room['revision'] !== $expected) {
            throw new ApiException(409, 'Room revision conflict. Refresh before retrying.');
        }
        $revision = $expected + 1;
        $status = match ($type) {
            'match_started' => 'playing',
            'match_finished' => 'finished',
            default => $room['status'],
        };
        $pdo->prepare('UPDATE rooms SET revision = :revision, status = :status WHERE id = :id')
            ->execute(['revision' => $revision, 'status' => $status, 'id' => $room['id']]);
        $pdo->prepare('INSERT INTO room_events (room_id, revision, player_id, event_type, payload) VALUES (:room, :revision, :player, :type, :payload)')
            ->execute(['room' => $room['id'], 'revision' => $revision, 'player' => $playerId, 'type' => $type, 'payload' => $payloadJson]);
        $pdo->commit();
        $room = roomByCode($pdo, $matches[1]);
        respond(200, roomUpdate($pdo, $room, $expected));
    }

    throw new ApiException(404, 'Endpoint not found.');
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    apiError($error);
}