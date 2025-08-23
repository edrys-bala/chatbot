<?php
namespace App\Controllers;

use App\Utils\Auth as AuthUtil;
use App\Utils\DB;
use App\Utils\Response;
use PDO;

class ResourceController
{
    public function list(): void
    {
        AuthUtil::requireAuth();
        $q = trim((string)($_GET['q'] ?? ''));
        $sql = 'SELECT id, title, description, category, file_type, file_size, created_at FROM resources';
        $params = [];
        if ($q !== '') {
            $sql .= ' WHERE title LIKE ? OR description LIKE ? OR category LIKE ?';
            $like = '%' . $q . '%';
            $params = [$like, $like, $like];
        }
        $sql .= ' ORDER BY created_at DESC LIMIT 200';
        $stmt = DB::conn()->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        Response::json(['items' => $rows]);
    }

    public function upload(): void
    {
        $user = AuthUtil::requireAdmin();
        if (!isset($_FILES['file'])) {
            Response::json(['error' => 'No file'], 400);
            return;
        }
        $title = trim((string)($_POST['title'] ?? ''));
        $description = trim((string)($_POST['description'] ?? ''));
        $category = trim((string)($_POST['category'] ?? 'General'));

        $file = $_FILES['file'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            Response::json(['error' => 'Upload error'], 400);
            return;
        }
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $safeName = bin2hex(random_bytes(8)) . '.' . $ext;
        $dest = UPLOAD_DIR . '/' . $safeName;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            Response::json(['error' => 'Failed to save file'], 500);
            return;
        }
        $stmt = DB::conn()->prepare('INSERT INTO resources(title, description, category, file_path, file_type, file_size, created_by) VALUES(?,?,?,?,?,?,?)');
        $stmt->execute([
            $title ?: $file['name'],
            $description,
            $category,
            'uploads/' . $safeName,
            $file['type'] ?? '',
            (int)($file['size'] ?? 0),
            $user['id'],
        ]);
        Response::json(['message' => 'Uploaded']);
    }

    public function delete(int $id): void
    {
        AuthUtil::requireAdmin();
        $stmt = DB::conn()->prepare('SELECT file_path FROM resources WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $path = dirname(__DIR__, 2) . '/public/' . $row['file_path'];
            @unlink($path);
        }
        $stmt = DB::conn()->prepare('DELETE FROM resources WHERE id = ?');
        $stmt->execute([$id]);
        Response::json(['message' => 'Deleted']);
    }

    public function download(int $id): void
    {
        // Any authenticated user can download
        AuthUtil::requireAuth();
        $stmt = DB::conn()->prepare('SELECT title, file_path, file_type FROM resources WHERE id = ?');
        $stmt->execute([$id]);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$res) {
            Response::json(['error' => 'Not found'], 404);
            return;
        }
        $fullPath = dirname(__DIR__, 2) . '/public/' . $res['file_path'];
        if (!is_file($fullPath)) {
            Response::json(['error' => 'File missing'], 404);
            return;
        }
        // Increment downloads
        DB::conn()->prepare('UPDATE resources SET downloads = downloads + 1 WHERE id = ?')->execute([$id]);
        $mime = $res['file_type'] ?: 'application/octet-stream';
        header('Content-Type: ' . $mime);
        header('Content-Disposition: attachment; filename="' . basename($res['title']) . '"');
        header('Content-Length: ' . filesize($fullPath));
        readfile($fullPath);
        exit;
    }
}

