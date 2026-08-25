<?php

return [
    // Base URL of the Python AI service (internal network only).
    'base_url' => env('AI_SERVICE_URL', 'http://ai-service:8000'),

    // Shared secret sent as X-Service-Token. Must match the AI service's token.
    'token' => env('AI_SERVICE_TOKEN', ''),

    // Per-request timeout (seconds). Transcription can be slow — jobs are queued,
    // so a generous timeout is fine.
    'timeout' => (int) env('AI_SERVICE_TIMEOUT', 300),

    // Queue that AI pipeline jobs run on.
    'queue' => env('AI_QUEUE', 'ai'),

    'embedding' => [
        'model' => env('AI_EMBEDDING_MODEL', 'text-embedding-3-small'),
        'dimensions' => (int) env('AI_EMBEDDING_DIMENSIONS', 1536),
    ],
];
