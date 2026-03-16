<?php
$host = 'sql3.freesqldatabase.com';
$user = 'sql3820170';
$pass = '2heqKFvGs1';
$db   = 'sql3820170';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}
?>
