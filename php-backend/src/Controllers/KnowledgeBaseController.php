<?php
namespace App\Controllers;

use App\Utils\Auth as AuthUtil;
use App\Utils\DB;
use App\Utils\Request;
use App\Utils\Response;
use PDO;

class KnowledgeBaseController
{
    public function list(): void
    {
        AuthUtil::requireAuth();
        $q = trim((string)($_GET['q'] ?? ''));
        if ($q !== '') {
            $stmt = DB::conn()->prepare('SELECT * FROM kb_articles WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC LIMIT 100');
            $like = '%' . $q . '%';
            $stmt->execute([$like, $like]);
        } else {
            $stmt = DB::conn()->query('SELECT * FROM kb_articles ORDER BY created_at DESC LIMIT 100');
        }
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        Response::json(['items' => $rows]);
    }

    public function create(): void
    {
        $user = AuthUtil::requireAdmin();
        $data = Request::json();
        $title = trim((string)($data['title'] ?? ''));
        $content = trim((string)($data['content'] ?? ''));
        $tags = trim((string)($data['tags'] ?? ''));
        if ($title === '' || $content === '') {
            Response::json(['error' => 'Missing fields'], 400);
            return;
        }
        $stmt = DB::conn()->prepare('INSERT INTO kb_articles(title, content, tags, created_by) VALUES(?,?,?,?)');
        $stmt->execute([$title, $content, $tags, $user['id']]);
        Response::json(['message' => 'Created']);
    }

    public function createFromUrl(): void
    {
        $user = AuthUtil::requireAdmin();
        $data = Request::json();
        $url = trim((string)($data['url'] ?? ''));
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            Response::json(['error' => 'Invalid URL'], 400);
            return;
        }
        // naive fetch; for WAMP allow file_get_contents
        $html = @file_get_contents($url);
        if (!$html) {
            Response::json(['error' => 'Failed to fetch URL'], 502);
            return;
        }
        $title = $data['title'] ?? (parse_url($url, PHP_URL_HOST) . ' page');
        // Strip tags for content
        $content = trim(strip_tags($html));
        $stmt = DB::conn()->prepare('INSERT INTO kb_articles(title, content, tags, source_url, created_by) VALUES(?,?,?,?,?)');
        $stmt->execute([$title, $content, '', $url, $user['id']]);
        Response::json(['message' => 'Imported']);
    }

    public function delete(int $id): void
    {
        AuthUtil::requireAdmin();
        $stmt = DB::conn()->prepare('DELETE FROM kb_articles WHERE id = ?');
        $stmt->execute([$id]);
        Response::json(['message' => 'Deleted']);
    }
}

