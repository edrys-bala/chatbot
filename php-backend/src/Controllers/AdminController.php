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

    public function analytics(): void
    {
        AuthUtil::requireAdmin();
        $pdo = DB::conn();
        $numStudents = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role='student'")->fetchColumn();
        $numApproved = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role='student' AND approved=1")->fetchColumn();
        $numResources = (int)$pdo->query("SELECT COUNT(*) FROM resources")->fetchColumn();
        $totalDownloads = (int)$pdo->query("SELECT COALESCE(SUM(downloads),0) FROM resources")->fetchColumn();
        $numConversations = (int)$pdo->query("SELECT COUNT(*) FROM conversations")->fetchColumn();
        $numMessages = (int)$pdo->query("SELECT COUNT(*) FROM messages")->fetchColumn();

        $topQuestions = $pdo->query("SELECT LOWER(TRIM(SUBSTRING(content,1,200))) AS q, COUNT(*) AS c FROM messages WHERE sender='student' GROUP BY q ORDER BY c DESC LIMIT 5")->fetchAll(\PDO::FETCH_ASSOC);
        $downloadsByCategory = $pdo->query("SELECT category, SUM(downloads) AS downloads FROM resources GROUP BY category ORDER BY downloads DESC")->fetchAll(\PDO::FETCH_ASSOC);

        Response::json([
            'metrics' => [
                'students' => $numStudents,
                'approvedStudents' => $numApproved,
                'resources' => $numResources,
                'downloads' => $totalDownloads,
                'conversations' => $numConversations,
                'messages' => $numMessages,
            ],
            'topQuestions' => $topQuestions,
            'downloadsByCategory' => $downloadsByCategory,
        ]);
    }

    public function searchChats(): void
    {
        AuthUtil::requireAdmin();
        $q = trim((string)($_GET['q'] ?? ''));
        if ($q === '') { Response::json(['items' => []]); return; }
        $like = '%' . $q . '%';
        $stmt = DB::conn()->prepare('SELECT m.id, m.content, m.created_at, u.email FROM messages m JOIN conversations c ON m.conversation_id=c.id JOIN users u ON c.user_id=u.id WHERE m.sender="student" AND m.content LIKE ? ORDER BY m.created_at DESC LIMIT 100');
        $stmt->execute([$like]);
        Response::json(['items' => $stmt->fetchAll(\PDO::FETCH_ASSOC)]);
    }
}

