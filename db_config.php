<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'sql3.freesqldatabase.com';
$user = 'sql3820170';
$pass = 'YOUR_ACTUAL_PASSWORD';
$db   = 'sql3820170';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(['error' => $conn->connect_error]));
}
?>