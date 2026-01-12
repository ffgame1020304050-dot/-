<?php
require_once 'config.php';
header('Content-Type: application/json');

// CORS হেডার
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

function connectDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        die(json_encode(['success' => false, 'message' => 'Database connection failed']));
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}

function verifyBkashTransaction($transactionId, $amount) {
    // ডেমো ফাংশন - বাস্তবে বিকাশ API ব্যবহার করুন
    $success = rand(0, 100) > 20; // 80% success rate
    
    if ($success) {
        return [
            'success' => true,
            'transaction' => [
                'id' => $transactionId,
                'amount' => $amount,
                'sender' => '017' . rand(10000000, 99999999),
                'receiver' => BKAHS_MERCHANT_NUMBER,
                'time' => date('Y-m-d H:i:s'),
                'status' => 'completed'
            ]
        ];
    } else {
        return [
            'success' => false,
            'message' => 'Transaction not found or amount mismatch'
        ];
    }
}

function verifyNagadTransaction($transactionId, $amount) {
    // ডেমো ফাংশন - বাস্তবে নগদ API ব্যবহার করুন
    $success = rand(0, 100) > 20; // 80% success rate
    
    if ($success) {
        return [
            'success' => true,
            'transaction' => [
                'trxId' => $transactionId,
                'amount' => $amount,
                'customerMsisdn' => '017' . rand(10000000, 99999999),
                'merchantMsisdn' => NAGAD_MERCHANT_NUMBER,
                'dateTime' => date('Y-m-d H:i:s'),
                'transactionStatus' => 'SUCCESS'
            ]
        ];
    } else {
        return [
            'success' => false,
            'message' => 'Transaction verification failed'
        ];
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['transactionId'], $data['paymentMethod'], $data['amount'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }
    
    $transactionId = $conn->real_escape_string($data['transactionId']);
    $paymentMethod = $conn->real_escape_string($data['paymentMethod']);
    $amount = floatval($data['amount']);
    $orderId = isset($data['orderId']) ? $conn->real_escape_string($data['orderId']) : null;
    
    $conn = connectDB();
    
    // চেক করুন যদি এই ট্রানজেকশন আগেই ভেরিফাই করা হয়ে থাকে
    $checkSql = "SELECT * FROM transaction_logs WHERE transaction_id = '$transactionId'";
    $checkResult = $conn->query($checkSql);
    
    if ($checkResult->num_rows > 0) {
        $existing = $checkResult->fetch_assoc();
        echo json_encode([
            'success' => true,
            'verified' => true,
            'message' => 'Transaction already verified',
            'data' => json_decode($existing['api_response'], true)
        ]);
        $conn->close();
        exit;
    }
    
    // পেমেন্ট মেথড অনুযায়ী API কল করুন
    if ($paymentMethod === 'bkash') {
        $verificationResult = verifyBkashTransaction($transactionId, $amount);
    } else {
        $verificationResult = verifyNagadTransaction($transactionId, $amount);
    }
    
    // লগ সেভ করুন
    $apiResponse = json_encode($verificationResult);
    $status = $verificationResult['success'] ? 'verified' : 'failed';
    
    $logSql = "INSERT INTO transaction_logs (order_id, transaction_id, payment_method, api_response, status, verified_amount, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, NOW())";
    $stmt = $conn->prepare($logSql);
    $verifiedAmount = $verificationResult['success'] && isset($verificationResult['transaction']['amount']) 
        ? $verificationResult['transaction']['amount'] : null;
    $stmt->bind_param('sssssd', $orderId, $transactionId, $paymentMethod, $apiResponse, $status, $verifiedAmount);
    $stmt->execute();
    
    // যদি অর্ডার আইডি থাকে, তাহলে অর্ডার আপডেট করুন
    if ($orderId && $verificationResult['success']) {
        $updateSql = "UPDATE orders SET 
                      status = 'confirmed', 
                      payment_status = 'verified',
                      verified_at = NOW()
                      WHERE order_id = ?";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bind_param('s', $orderId);
        $updateStmt->execute();
    }
    
    echo json_encode([
        'success' => true,
        'verified' => $verificationResult['success'],
        'data' => $verificationResult
    ]);
    
    $stmt->close();
    if (isset($updateStmt)) $updateStmt->close();
    $conn->close();
    
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>