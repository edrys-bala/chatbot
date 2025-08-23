<?php
namespace App\Controllers;

use App\Utils\Auth as AuthUtil;
use App\Utils\DB;
use App\Utils\Response;
use PDO;

class AdminController
{
    public function listStudents(): void
    {
        AuthUtil::requireAdmin();
        $stmt = DB::conn()->query('SELECT id, name, email, approved, created_at FROM users WHERE role = "student" ORDER BY created_at DESC LIMIT 500');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        Response::json(['items' => $rows]);
    }

    public function setStudentApproval(int $id, string $action): void
    {
        AuthUtil::requireAdmin();
        $approved = $action === 'approve' ? 1 : 0;
        $stmt = DB::conn()->prepare('UPDATE users SET approved = ? WHERE id = ? AND role = "student"');
        $stmt->execute([$approved, $id]);
        Response::json(['message' => 'Updated']);
    }
}

