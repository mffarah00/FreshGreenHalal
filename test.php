<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "PHP is working<br>";

$host = 'sql3.freesqldatabase.com';
$user = 'sql3820170';
$pass = 'YOUR_ACTUAL_PASSWORD';
$db = 'sql3820170';

echo "Trying to connect...<br>";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo "FAILED: " . $conn->connect_error;
} else {
    echo "SUCCESS! Connected to database!";
}
