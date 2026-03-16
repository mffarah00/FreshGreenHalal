<?php
$host = getenv('DB_HOST') ?: 'localhost';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';
$db   = getenv('DB_NAME') ?: 'halal_market';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
  die('Connection failed: ' . $conn->connect_error);
}
?>
