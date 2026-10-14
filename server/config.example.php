<?php
declare(strict_types=1);

return [
    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'ballistic_front',
        'user' => 'ballistic_front_user',
        'pass' => 'replace-with-database-password',
        'charset' => 'utf8mb4',
    ],
    'api' => [
        'base_path' => '/ballistic-front/api',
        'route_aliases' => ['/api'],
        'max_payload_bytes' => 262144,
        'allowed_origins' => [
            'https://delawer.hu',
            'http://localhost:5173',
            'http://localhost:4173',
        ],
        'allowed_methods' => ['GET', 'POST', 'OPTIONS'],
        'allowed_headers' => ['Content-Type', 'Authorization'],
    ],
];