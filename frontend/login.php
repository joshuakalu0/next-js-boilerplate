<?php
session_start();
$conn = new mysqli("localhost", "root", "", "auth_demo");

$email = $_POST['email'];
$password = $_POST['password'];

$stmt = $conn->prepare("SELECT id, password FROM users WHERE email=?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($id, $hashed);

if ($stmt->num_rows > 0) {
    $stmt->fetch();
    if (password_verify($password, $hashed)) {
        $_SESSION['user_id'] = $id;
        header("Location: ../2fa.html");
    } else {
        echo "Incorrect password.";
    }
} else {
    echo "Email not found.";
}