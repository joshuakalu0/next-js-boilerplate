<?php
require 'db.php';
session_start();

$userId = $_SESSION['user_id'];
$code = $_POST['code'];

$stmt = $pdo->prepare("SELECT two_factor_code FROM users WHERE id = ?");
$stmt->execute([$userId]);
$realCode = $stmt->fetchColumn();

if ($code == $realCode) {
  // Clear code
  $pdo->prepare("UPDATE users SET two_factor_code = NULL WHERE id = ?")->execute([$userId]);
  header("Location: dashboard.php");
} else {
  echo "Invalid 2FA code.";
}
?>
