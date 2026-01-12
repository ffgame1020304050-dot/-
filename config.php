<?php
// ডাটাবেস কনফিগারেশন
define('DB_HOST', 'localhost');
define('DB_NAME', 'amikinbo_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// বিকাশ API কনফিগারেশন
define('BKAHS_APP_KEY', 'your_bkash_app_key');
define('BKAHS_APP_SECRET', 'your_bkash_app_secret');
define('BKAHS_USERNAME', 'your_bkash_username');
define('BKAHS_PASSWORD', 'your_bkash_password');
define('BKAHS_MERCHANT_NUMBER', '01540651159');

// নগদ API কনফিগারেশন
define('NAGAD_MERCHANT_ID', 'your_nagad_merchant_id');
define('NAGAD_MERCHANT_NUMBER', '01540651159');
define('NAGAD_PG_PUBLIC_KEY', 'your_nagad_public_key');
define('NAGAD_MERCHANT_PRIVATE_KEY', 'your_nagad_private_key');

// WhatsApp API কনফিগারেশন
define('WHATSAPP_API_KEY', 'your_whatsapp_api_key');
define('WHATSAPP_NUMBER', '01748320647');
define('WHATSAPP_BUSINESS_ID', 'your_whatsapp_business_id');

// সিকিউরিটি
define('SECRET_KEY', 'your_secret_key_here');
define('ENCRYPTION_KEY', 'your_encryption_key_here');

// সাইট URL
define('SITE_URL', 'https://yourdomain.com');

// সময়জোন
date_default_timezone_set('Asia/Dhaka');

// এরর রিপোর্টিং
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/errors.log');
?>