<?php
require 'vendor/autoload.php';
require 'db.php';

$client = new Google_Client();
$client->setClientId('YOUR_GOOGLE_CLIENT_ID');
$client->setClientSecret('YOUR_GOOGLE_CLIENT_SECRET');
$client->setRedirectUri('http://localhost/google-callback.php');

$service = new Google_Service_Oauth2($client);

if (isset($_GET['code'])) {
  $client->authenticate($_GET['code']);
  $token = $client->getAccessToken();
  $client->setAccessToken($token);

  $user = $service->userinfo->get();
  $email = $user->email;
  $googleId = $user->id;
  $name = $user->name;

  // Check if user exists
  $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
  $stmt->execute([$email]);
  $existing = $stmt->fetch();

  if (!$existing) {
    $pdo->prepare("INSERT INTO users (name, email, google_id) VALUES (?, ?, ?)")->execute([$name, $email, $googleId]);
    $userId = $pdo->lastInsertId();
  } else {
    $userId = $existing['id'];
  }

  session_start();
  $_SESSION['user_id'] = $userId;
  header("Location: dashboard.php");
}
?>
