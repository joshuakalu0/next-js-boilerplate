<?php
// Use Composer: `composer require google/apiclient`
require_once 'vendor/autoload.php';

$client = new Google_Client();
$client->setClientId("YOUR_GOOGLE_CLIENT_ID");
$client->setClientSecret("YOUR_GOOGLE_CLIENT_SECRET");
$client->setRedirectUri("http://localhost/auth/oauth_google.php");
$client->addScope("email");
$client->addScope("profile");

if (!isset($_GET['code'])) {
    header('Location: ' . $client->createAuthUrl());
    exit;
} else {
    $client->authenticate($_GET['code']);
    $token = $client->getAccessToken();
    $oauth = new Google_Service_Oauth2($client);
    $user = $oauth->userinfo->get();
    echo "Logged in as: " . $user->email;
}
