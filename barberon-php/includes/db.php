<?php
/**
 * Barberon — Database helper (PDO / MySQL)
 * Provides a singleton PDO connection and query helpers.
 */

require_once __DIR__ . '/config.php';

class DB {
    private static ?PDO $pdo = null;

    /** Get the singleton PDO connection */
    public static function connection(): PDO {
        if (self::$pdo === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                DB_HOST, DB_PORT, DB_NAME, DB_CHARSET
            );
            try {
                self::$pdo = new PDO($dsn, DB_USER, DB_PASS, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } catch (PDOException $e) {
                throw new \RuntimeException('Database unavailable: ' . $e->getMessage(), 503, $e);
            }
        }
        return self::$pdo;
    }

    /** Execute a query and return a PDOStatement */
    public static function query(string $sql, array $params = []): PDOStatement {
        $stmt = self::connection()->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /** Fetch a single row */
    public static function fetchOne(string $sql, array $params = []): ?array {
        $row = self::query($sql, $params)->fetch();
        return $row !== false ? $row : null;
    }

    /** Fetch all rows */
    public static function fetchAll(string $sql, array $params = []): array {
        return self::query($sql, $params)->fetchAll();
    }

    /** Insert and return last insert ID */
    public static function insert(string $table, array $data): string {
        $cols = implode(', ', array_map(fn($k) => "`$k`", array_keys($data)));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        $sql = "INSERT INTO `$table` ($cols) VALUES ($placeholders)";
        self::query($sql, array_values($data));
        return self::connection()->lastInsertId();
    }

    /** Update rows matching $where conditions */
    public static function update(string $table, array $data, array $where): int {
        $set   = implode(', ', array_map(fn($k) => "`$k` = ?", array_keys($data)));
        $cond  = implode(' AND ', array_map(fn($k) => "`$k` = ?", array_keys($where)));
        $sql   = "UPDATE `$table` SET $set WHERE $cond";
        $stmt  = self::query($sql, [...array_values($data), ...array_values($where)]);
        return $stmt->rowCount();
    }

    /** Delete rows matching $where conditions */
    public static function delete(string $table, array $where): int {
        $cond = implode(' AND ', array_map(fn($k) => "`$k` = ?", array_keys($where)));
        $sql  = "DELETE FROM `$table` WHERE $cond";
        return self::query($sql, array_values($where))->rowCount();
    }

    /** Generate a UUID v4 */
    public static function uuid(): string {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /** Generate a CUID-like short unique ID */
    public static function cuid(): string {
        return 'c' . bin2hex(random_bytes(12));
    }
}
