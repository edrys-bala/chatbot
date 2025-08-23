<?php
namespace App\Utils;

use App\Utils\DB;
use PDO;

class Auth
{
    public static function user(): ?array
    {
        $headers = function_exists('apache_request_headers') ? apache_request_headers() : [];
        $authHeader = $headers['Authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
        if (str_starts_with($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
            $payload = Jwt::decode($token);
            if (!$payload || !isset($payload['uid'])) return null;
            $stmt = DB::conn()->prepare('SELECT id, name, email, role, approved, created_at FROM users WHERE id = ?');
            $stmt->execute([$payload['uid']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            return $user ?: null;
        }
        return null;
    }

    public static function requireAuth(): array
    {
        $user = self::user();
        if (!$user) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        return $user;
    }

    public static function requireApprovedStudent(): array
    {
        $user = self::requireAuth();
        if ($user['role'] !== 'student' || (int)$user['approved'] !== 1) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }
        return $user;
    }

    public static function requireAdmin(): array
    {
        $user = self::requireAuth();
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Admins only']);
            exit;
        }
        return $user;
    }
}

