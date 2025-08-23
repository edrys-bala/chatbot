<?php
namespace App\Utils;

class Request
{
    public static function json(): array
    {
        $input = file_get_contents('php://input') ?: '';
        $data = json_decode($input, true);
        if (is_array($data)) return $data;
        return [];
    }

    public static function param(string $key, $default = null)
    {
        if (isset($_GET[$key])) return $_GET[$key];
        if (isset($_POST[$key])) return $_POST[$key];
        $json = self::json();
        return $json[$key] ?? $default;
    }
}

