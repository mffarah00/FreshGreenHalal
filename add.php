<?php
include 'db_config.php';

$name = $_POST['name'];
$price = $_POST['price'];

$sql = "INSERT INTO products (name, price, halalCertified) VALUES (?, ?, TRUE)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sd", $name, $price);

if ($stmt->execute()) {
  echo "Product added!";
} else {
  echo "Error: " . $stmt->error;
}
?>
