<?php
require 'db.php';

$name = $_POST['name'];
$email = $_POST['email'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT);

$stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
try {
  $stmt->execute([$name, $email, $password]);
  header("Location: index.html");
} catch (PDOException $e) {
  echo "Error: " . $e->getMessage();
}
?>
