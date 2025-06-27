<?php
require 'db.php';

$email = $_POST['email'];
$password = $_POST['password'];

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
  // Simulate 2FA for now
  session_start();
  $_SESSION['user_id'] = $user['id'];

  if ($user['two_factor_enabled']) {
    // Generate a 2FA code
    $code = rand(100000, 999999);
    $pdo->prepare("UPDATE users SET two_factor_code = ? WHERE id = ?")->execute([$code, $user['id']]);
    // Normally you'd email the code here
    echo "2FA Code: $code"; // DEBUG only
    header("Location: 2fa.html");
    exit;
  }

  header("Location: dashboard.php");
} else {
  echo "Invalid credentials.";
}
?>
