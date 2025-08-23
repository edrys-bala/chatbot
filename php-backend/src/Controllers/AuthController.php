<?php
namespace App\Controllers;

use App\Utils\DB;
use App\Utils\Jwt;
use App\Utils\Request;
use App\Utils\Response;
use App\Utils\Auth as AuthUtil;
use PDO;

class AuthController
{
    public function register(): void
    {
        $data = Request::json();
        $name = trim((string)($data['name'] ?? ''));
        $email = strtolower(trim((string)($data['email'] ?? '')));
        $password = (string)($data['password'] ?? '');
        $role = ($data['role'] ?? 'student') === 'admin' ? 'admin' : 'student';
        if ($name === '' || $email === '' || $password === '') {
            Response::json(['error' => 'Missing fields'], 400);
            return;
        }
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $approved = $role === 'student' ? 1 : 1; // change to 0 if admin approval needed
        try {
            $stmt = DB::conn()->prepare('INSERT INTO users(name, email, password_hash, role, approved) VALUES(?,?,?,?,?)');
            $stmt->execute([$name, $email, $hash, $role, $approved]);
            Response::json(['message' => 'Registered']);
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000') {
                Response::json(['error' => 'Email already exists'], 409);
            } else {
                Response::json(['error' => 'Registration failed'], 500);
            }
        }
    }

    public function login(): void
    {
        $data = Request::json();
        $email = strtolower(trim((string)($data['email'] ?? '')));
        $password = (string)($data['password'] ?? '');
        $stmt = DB::conn()->prepare('SELECT id, name, email, role, approved, password_hash FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user || !password_verify($password, $user['password_hash'])) {
            Response::json(['error' => 'Invalid credentials'], 401);
            return;
        }
        $payload = [
            'uid' => (int)$user['id'],
            'role' => $user['role'],
            'exp' => time() + JWT_EXPIRES_IN,
        ];
        $token = Jwt::encode($payload);
        Response::json([
            'token' => $token,
            'user' => [
                'id' => (int)$user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'approved' => (int)$user['approved'],
            ],
        ]);
    }

    public function logout(): void
    {
        // Stateless JWT: client deletes token
        Response::json(['message' => 'Logged out']);
    }

    public function me(): void
    {
        $user = AuthUtil::requireAuth();
        Response::json(['user' => $user]);
    }
}

