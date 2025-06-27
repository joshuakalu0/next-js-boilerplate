<?php
require 'db.php';

$email = $_POST['email'];

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);

if ($stmt->fetch()) {
  // Simulate reset email
  echo "Password reset link sent to $email (not really, simulate only)";
} else {
  echo "Email not found.";
}
?>
