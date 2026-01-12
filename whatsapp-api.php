<?php
require_once 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['message']) || !isset($data['number'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }
    
    $message = $data['message'];
    $number = $data['number'];
    
    // WhatsApp API কল (ডেমো)
    // বাস্তবে আপনি WhatsApp Business API বা তৃতীয় পক্ষের সার্ভিস ব্যবহার করবেন
    
    $response = [
        'success' => true,
        'message' => 'WhatsApp notification sent',
        'data' => [
            'to' => $number,
            'message' => substr($message, 0, 100) . '...'
        ]
    ];
    
    // লগ সেভ করুন
    $logMessage = "WhatsApp to $number: " . substr($message, 0, 200);
    error_log(date('Y-m-d H:i:s') . " - $logMessage\n", 3, __DIR__ . '/whatsapp.log');
    
    echo json_encode($response);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>