<?php
declare(strict_types=1);

// Basic configuration for DB and JWT

// CORS origin for local dev (React Vite default port)
define('ALLOWED_ORIGIN', getenv('ALLOWED_ORIGIN') ?: 'http://localhost:5173');

// Database
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', (int)(getenv('DB_PORT') ?: 3306));
define('DB_NAME', getenv('DB_NAME') ?: 'student_support');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// JWT
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'dev_super_secret_change_me');
define('JWT_EXPIRES_IN', (int)(getenv('JWT_EXPIRES_IN') ?: 86400));

// File storage
define('UPLOAD_DIR', realpath(__DIR__ . '/../public') . '/uploads');
if (!is_dir(UPLOAD_DIR)) {
    @mkdir(UPLOAD_DIR, 0775, true);
}

// OpenAI
define('OPENAI_API_KEY', getenv('OPENAI_API_KEY') ?: '');
define('OPENAI_MODEL', getenv('OPENAI_MODEL') ?: 'gpt-4o-mini');

