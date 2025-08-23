<?php
namespace App\Utils;

class Jwt
{
    public static function encode(array $payload): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $segments = [
            self::urlsafeB64(json_encode($header)),
            self::urlsafeB64(json_encode($payload)),
        ];
        $signingInput = implode('.', $segments);
        $signature = hash_hmac('sha256', $signingInput, JWT_SECRET, true);
        $segments[] = self::urlsafeB64($signature);
        return implode('.', $segments);
    }

    public static function decode(string $jwt): ?array
    {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) return null;
        [$h64, $p64, $s64] = $parts;
        $signingInput = $h64 . '.' . $p64;
        $expected = self::urlsafeB64(hash_hmac('sha256', $signingInput, JWT_SECRET, true));
        if (!hash_equals($expected, $s64)) return null;
        $payload = json_decode(self::urlsafeB64Decode($p64), true);
        if (!is_array($payload)) return null;
        if (isset($payload['exp']) && time() >= (int)$payload['exp']) return null;
        return $payload;
    }

    private static function urlsafeB64(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function urlsafeB64Decode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $padLen = 4 - $remainder;
            $data .= str_repeat('=', $padLen);
        }
        return base64_decode(strtr($data, '-_', '+/')) ?: '';
    }
}

