-- ডাটাবেস তৈরি করুন
CREATE DATABASE IF NOT EXISTS amikinbo_db;
USE amikinbo_db;

-- অর্ডার টেবিল
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    package_id INT NOT NULL,
    package_name VARCHAR(100) NOT NULL,
    diamonds VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    uid VARCHAR(20) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    payment_method ENUM('bkash', 'nagad') NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    status ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending',
    payment_status ENUM('checking', 'verified', 'failed') DEFAULT 'checking',
    failed_reason TEXT,
    verified_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- ট্রানজেকশন লগ টেবিল
CREATE TABLE transaction_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    api_response TEXT,
    status VARCHAR(20) NOT NULL,
    verified_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    INDEX idx_transaction_id (transaction_id)
);

-- প্যাকেজ টেবিল
CREATE TABLE packages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    diamonds VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category ENUM('diamond', 'weekly', 'airdrop', 'evo') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- প্রি-ডিফাইন্ড প্যাকেজ ডাটা ইনসার্ট করুন
INSERT INTO packages (name, diamonds, price, original_price, category) VALUES
-- Diamond Packages
('25 Diamond', '25', 24.00, 30.00, 'diamond'),
('50 Diamond', '50', 45.00, 60.00, 'diamond'),
('115 Diamond', '115', 78.00, 100.00, 'diamond'),
('240 Diamond', '240', 160.00, 200.00, 'diamond'),
('480 Diamond', '480', 310.00, 390.00, 'diamond'),
('610 Diamond', '610', 390.00, 490.00, 'diamond'),
('1240 Diamond', '1240', 795.00, 999.00, 'diamond'),
('2530 Diamond', '2530', 1679.00, 2100.00, 'diamond'),
('5060 Diamond', '5060', 3358.00, 4200.00, 'diamond'),
('10120 Diamond', '10120', 6716.00, 8400.00, 'diamond'),

-- Weekly/Monthly Packages
('Weekly', 'Weekly', 160.00, 200.00, 'weekly'),
('Weekly Lite', 'Weekly Lite', 45.00, 60.00, 'weekly'),
('Monthly', 'Monthly', 780.00, 999.00, 'weekly'),

-- Airdrop Packages
('0.99$ Airdrop', '0.99$ (90 BDT)', 145.00, 180.00, 'airdrop'),
('1.99$ Airdrop', '1.99$ (190 BDT)', 289.00, 360.00, 'airdrop'),
('3.99$ Airdrop', '3.99$ (390 BDT)', 449.00, 560.00, 'airdrop'),

-- Evo Access Packages
('3 Day Evo Access', '3 Days', 60.00, 75.00, 'evo'),
('7 Days Evo Access', '7 Days', 100.00, 130.00, 'evo'),
('30 Days Evo Access', '30 Days', 250.00, 320.00, 'evo');

-- অ্যাডমিন ইউজার টেবিল
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('superadmin', 'admin', 'moderator') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ডিফল্ট অ্যাডমিন ইউজার (পাসওয়ার্ড: Admin@123)
INSERT INTO admin_users (username, password_hash, full_name, role) VALUES
('admin', '$2y$10$YourHashedPasswordHere', 'System Administrator', 'superadmin');