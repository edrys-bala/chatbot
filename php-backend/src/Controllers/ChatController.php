<?php
namespace App\Controllers;

use App\Utils\Auth as AuthUtil;
use App\Utils\DB;
use App\Utils\Request;
use App\Utils\Response;
use PDO;

class ChatController
{
    private function searchKb(string $query): ?string
    {
        $stmt = DB::conn()->prepare('SELECT title, content FROM kb_articles WHERE MATCH(title, content) AGAINST(? IN NATURAL LANGUAGE MODE) LIMIT 1');
        try {
            $stmt->execute([$query]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                return $row['title'] . ": " . mb_substr($row['content'], 0, 700);
            }
        } catch (\Throwable $e) {
            // Fallback to LIKE if fulltext not set
            $like = '%' . $query . '%';
            $stmt = DB::conn()->prepare('SELECT title, content FROM kb_articles WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC LIMIT 1');
            $stmt->execute([$like, $like]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                return $row['title'] . ": " . mb_substr($row['content'], 0, 700);
            }
        }
        return null;
    }

    private function openAiReply(string $prompt): string
    {
        if (OPENAI_API_KEY === '') {
            return 'I do not have an answer in the knowledge base and the external AI API is not configured.';
        }
        // Simple fetch via curl
        $ch = curl_init('https://api.openai.com/v1/chat/completions');
        $payload = json_encode([
            'model' => OPENAI_MODEL,
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful Computer Science student support assistant.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'temperature' => 0.2,
        ]);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . OPENAI_API_KEY,
            ],
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_TIMEOUT => 20,
        ]);
        $resp = curl_exec($ch);
        if ($resp === false) {
            return 'External AI request failed.';
        }
        $data = json_decode($resp, true);
        $text = $data['choices'][0]['message']['content'] ?? 'No response.';
        return (string)$text;
    }

    public function startConversation(): void
    {
        $user = AuthUtil::requireApprovedStudent();
        DB::conn()->prepare('INSERT INTO conversations(user_id) VALUES(?)')->execute([$user['id']]);
        $id = (int)DB::conn()->lastInsertId();
        Response::json(['conversation_id' => $id]);
    }

    public function postMessage(): void
    {
        $user = AuthUtil::requireApprovedStudent();
        $data = Request::json();
        $conversationId = (int)($data['conversation_id'] ?? 0);
        $message = trim((string)($data['message'] ?? ''));
        if ($conversationId <= 0 || $message === '') {
            Response::json(['error' => 'Invalid request'], 400);
            return;
        }
        // Verify conversation belongs to user
        $stmt = DB::conn()->prepare('SELECT id FROM conversations WHERE id = ? AND user_id = ?');
        $stmt->execute([$conversationId, $user['id']]);
        if (!$stmt->fetch()) {
            Response::json(['error' => 'Conversation not found'], 404);
            return;
        }
        DB::conn()->prepare('INSERT INTO messages(conversation_id, sender, content) VALUES(?,?,?)')
            ->execute([$conversationId, 'student', $message]);

        // Try KB first
        $kbAnswer = $this->searchKb($message);
        $botReply = $kbAnswer ?? $this->openAiReply($message);
        DB::conn()->prepare('INSERT INTO messages(conversation_id, sender, content) VALUES(?,?,?)')
            ->execute([$conversationId, 'bot', $botReply]);
        Response::json(['reply' => $botReply]);
    }

    public function history(): void
    {
        $user = AuthUtil::requireApprovedStudent();
        $conversationId = (int)($_GET['conversation_id'] ?? 0);
        if ($conversationId <= 0) {
            Response::json(['error' => 'Invalid conversation_id'], 400);
            return;
        }
        // Verify
        $stmt = DB::conn()->prepare('SELECT id FROM conversations WHERE id = ? AND user_id = ?');
        $stmt->execute([$conversationId, $user['id']]);
        if (!$stmt->fetch()) {
            Response::json(['error' => 'Not found'], 404);
            return;
        }
        $stmt = DB::conn()->prepare('SELECT sender, content, created_at FROM messages WHERE conversation_id = ? ORDER BY id ASC');
        $stmt->execute([$conversationId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        Response::json(['messages' => $rows]);
    }
}

