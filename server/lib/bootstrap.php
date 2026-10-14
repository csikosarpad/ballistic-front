<?php
declare(strict_types=1);

final class ApiException extends RuntimeException
{
    public function __construct(public readonly int $status, string $message)
    {
        parent::__construct($message);
    }
}

function appConfig(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $configPath = getenv('BALLISTIC_CONFIG_PATH') ?: dirname(__DIR__) . '/config.php';
    if (!is_file($configPath)) {
        throw new RuntimeException('Missing server/config.php. Copy server/config.example.php and configure it.');
    }
    $loaded = require $configPath;
    if (!is_array($loaded)) {
        throw new RuntimeException('server/config.php must return an array.');
    }

    $config = $loaded;
    return $config;
}

function respond(int $status, array $body): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
    exit;
}

function jsonBody(): array
{
    try {
        $decoded = json_decode(file_get_contents('php://input') ?: '', false, 32, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        throw new ApiException(400, 'Malformed JSON body.');
    }
    if (!$decoded instanceof stdClass) {
        throw new ApiException(400, 'Expected a JSON object.');
    }
    return get_object_vars($decoded);
}

function database(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $db = appConfig()['db'] ?? [];
    $host = $db['host'] ?? null;
    $port = filter_var($db['port'] ?? null, FILTER_VALIDATE_INT);
    $name = $db['name'] ?? null;
    $charset = $db['charset'] ?? 'utf8mb4';
    if (!is_string($host) || $host === '' || $port === false || $port < 1 || $port > 65535 || !is_string($name) || $name === '') {
        throw new RuntimeException('Database host, port, and name must be configured in server/config.php.');
    }
    if (!is_string($charset) || !preg_match('/^[a-zA-Z0-9_]+$/', $charset)) {
        throw new RuntimeException('Database charset is invalid in server/config.php.');
    }
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $host, $port, $name, $charset);
    $pdo = new PDO($dsn, (string) ($db['user'] ?? ''), (string) ($db['pass'] ?? ''), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

function apiRequestPath(): string
{
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $api = appConfig()['api'] ?? [];
    $prefixes = array_filter(array_merge(
        [(string) ($api['base_path'] ?? '')],
        is_array($api['route_aliases'] ?? null) ? $api['route_aliases'] : [],
    ));
    usort($prefixes, static fn(string $left, string $right): int => strlen($right) <=> strlen($left));

    foreach ($prefixes as $prefix) {
        $prefix = '/' . trim((string) $prefix, '/');
        if ($path === $prefix) {
            return '/';
        }
        if (str_starts_with($path, $prefix . '/')) {
            return substr($path, strlen($prefix));
        }
    }

    throw new ApiException(404, 'API path does not match the configured base path.');
}

function bearerToken(): string
{
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if ($authorization === '' && function_exists('getallheaders')) {
        $headers = getallheaders();
        $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    if (!preg_match('/^Bearer ([a-f0-9]{64})$/', $authorization, $matches)) {
        throw new ApiException(401, 'A valid room token is required.');
    }
    return $matches[1];
}

function roomByCode(PDO $pdo, string $code, bool $lock = false): array
{
    if (!preg_match('/^[A-Z0-9]{6}$/', $code)) {
        throw new ApiException(404, 'Room not found.');
    }
    $query = 'SELECT * FROM rooms WHERE code = :code AND expires_at > CURRENT_TIMESTAMP';
    if ($lock) {
        $query .= ' FOR UPDATE';
    }
    $statement = $pdo->prepare($query);
    $statement->execute(['code' => $code]);
    $room = $statement->fetch();
    if (!$room) {
        throw new ApiException(404, 'Room not found or expired.');
    }
    return $room;
}

function authenticateRoom(array $room, string $token): string
{
    $hash = hash('sha256', $token);
    if (hash_equals($room['host_token_hash'], $hash)) {
        return 'P1';
    }
    if ($room['guest_token_hash'] !== null && hash_equals($room['guest_token_hash'], $hash)) {
        return 'P2';
    }
    throw new ApiException(401, 'Invalid room token.');
}

function roomSession(array $room): array
{
    return [
        'code' => $room['code'],
        'status' => $room['status'],
        'revision' => (int) $room['revision'],
        'setup' => json_decode($room['setup'], true, 32, JSON_THROW_ON_ERROR),
        'players' => ['P1' => $room['host_name'], 'P2' => $room['guest_name']],
    ];
}

function roomEvents(PDO $pdo, int $roomId, int $since): array
{
    $statement = $pdo->prepare(
        'SELECT revision, player_id, event_type, payload, created_at FROM room_events WHERE room_id = :room AND revision > :since ORDER BY revision'
    );
    $statement->execute(['room' => $roomId, 'since' => $since]);
    return array_map(static fn(array $event): array => [
        'revision' => (int) $event['revision'],
        'playerId' => $event['player_id'],
        'type' => $event['event_type'],
        'payload' => json_decode($event['payload'], false, 32, JSON_THROW_ON_ERROR),
        'createdAt' => $event['created_at'],
    ], $statement->fetchAll());
}

function roomUpdate(PDO $pdo, array $room, int $since): array
{
    return ['session' => roomSession($room), 'events' => roomEvents($pdo, (int) $room['id'], $since)];
}

function positiveRevision(mixed $value): int
{
    if (!is_int($value) || $value < 0) {
        throw new ApiException(400, 'Revision must be a non-negative integer.');
    }
    return $value;
}

function playerName(mixed $value): string
{
    if (!is_string($value)) {
        throw new ApiException(400, 'Player name is required.');
    }
    $name = trim($value);
    if ($name === '' || mb_strlen($name) > 24) {
        throw new ApiException(400, 'Player name must be 1 to 24 characters.');
    }
    return $name;
}

function apiError(Throwable $error): never
{
    if ($error instanceof ApiException) {
        respond($error->status, ['error' => $error->getMessage()]);
    }
    error_log((string) $error);
    respond(500, ['error' => 'Internal server error.']);
}

function newRoomCode(): string
{
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = '';
    for ($index = 0; $index < 6; $index++) {
        $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }
    return $code;
}