<?php
// Basic API front controller and router
declare(strict_types=1);

require_once __DIR__ . '/../src/config.php';
require_once __DIR__ . '/../src/utils/Response.php';

use App\Utils\Response;

// CORS
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Autoload minimal
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/../src/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    if (file_exists($file)) {
        require $file;
    }
});

// Simple router
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Normalize base path if the app is not at domain root
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
if ($scriptName !== '/' && str_starts_with($uri, $scriptName)) {
    $uri = substr($uri, strlen($scriptName));
}

// Only handle /api/*
if (!str_starts_with($uri, '/api/')) {
    Response::json(['message' => 'Student Support Chatbot API'], 200);
    exit;
}

use App\Controllers\AuthController;
use App\Controllers\KnowledgeBaseController;
use App\Controllers\ResourceController;
use App\Controllers\ChatController;
use App\Controllers\AdminController;

// Route table
$routes = [
    // Auth
    ['POST', '#^/api/auth/register$#', [AuthController::class, 'register']],
    ['POST', '#^/api/auth/login$#', [AuthController::class, 'login']],
];

// Add more routes
$moreRoutes = [
    ['POST', '#^/api/auth/logout$#', [AuthController::class, 'logout']],
    ['GET',  '#^/api/auth/me$#', [AuthController::class, 'me']],

    // KB
    ['GET',  '#^/api/kb$#', [KnowledgeBaseController::class, 'list']],
    ['POST', '#^/api/kb$#', [KnowledgeBaseController::class, 'create']],
    ['POST', '#^/api/kb/from_url$#', [KnowledgeBaseController::class, 'createFromUrl']],
    ['DELETE', '#^/api/kb/(\\d+)$#', [KnowledgeBaseController::class, 'delete']],

    // Resources
    ['GET',  '#^/api/resources$#', [ResourceController::class, 'list']],
    ['POST', '#^/api/resources/upload$#', [ResourceController::class, 'upload']],
    ['DELETE', '#^/api/resources/(\\d+)$#', [ResourceController::class, 'delete']],

    // Chat
    ['POST', '#^/api/chat/start$#', [ChatController::class, 'startConversation']],
    ['POST', '#^/api/chat/message$#', [ChatController::class, 'postMessage']],
    ['GET',  '#^/api/chat/history$#', [ChatController::class, 'history']],

    // Admin
    ['GET',  '#^/api/admin/students$#', [AdminController::class, 'listStudents']],
    ['PATCH','#^/api/admin/students/(\\d+)/(approve|reject)$#', [AdminController::class, 'setStudentApproval']],
];

$routes = array_merge($routes, $moreRoutes);

foreach ($routes as [$httpMethod, $pattern, $handler]) {
    if ($method === $httpMethod && preg_match($pattern, $uri, $matches)) {
        array_shift($matches);
        try {
            [$class, $action] = $handler;
            $controller = new $class();
            $controller->$action(...$matches);
        } catch (Throwable $e) {
            error_log('API error: ' . $e->getMessage());
            Response::json(['error' => 'Server error'], 500);
        }
        exit;
    }
}

Response::json(['error' => 'Not Found'], 404);

