-- SmartDoc AI — MySQL schema (matches server/config/db.js initDb).
-- Run as a user with enough privileges (often root for CREATE DATABASE).
-- If the database already exists, skip the first two lines and run from USE onward.

-- CREATE DATABASE IF NOT EXISTS smartdoc_ai
--   CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartdoc_ai;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
