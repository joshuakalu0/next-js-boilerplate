CREATE DATABASE IF NOT EXISTS auth_demo;
USE auth_demo;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255)
);
