<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean(); http_response_code(200); exit;
}

function fail($msg) {
    ob_end_clean();
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
}

// ── DB ────────────────────────────────────────────────────────────────────────
@include 'db_config.php';
ob_clean();

// ── INPUT ─────────────────────────────────────────────────────────────────────
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) fail('Invalid request data.');

$name     = trim($data['name']     ?? '');
$email    = trim($data['email']    ?? '');
$phone    = trim($data['phone']    ?? '');
$pickup   = trim($data['pickup']   ?? '');
$notes    = trim($data['notes']    ?? '');
$cart     = $data['cart']          ?? [];
$subtotal = floatval($data['subtotal'] ?? 0);
$tax      = floatval($data['tax']      ?? 0);
$total    = floatval($data['total']    ?? 0);

if (!$name || !$email || !$pickup || empty($cart)) fail('Missing required fields.');

// ── ORDER NUMBER ──────────────────────────────────────────────────────────────
$orderNumber = 'FG-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5));
$cartJson    = json_encode($cart);

// ── SAVE TO DB ────────────────────────────────────────────────────────────────
if (!empty($conn)) {
    try {
        $stmt = $conn->prepare(
            "INSERT INTO orders
             (customer_name, customer_email, pickup_time, order_data, total,
              order_number, customer_phone, notes, subtotal, tax)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        if ($stmt) {
            $stmt->bind_param("ssssdsssdd",
                $name, $email, $pickup, $cartJson, $total,
                $orderNumber, $phone, $notes, $subtotal, $tax
            );
            $stmt->execute();
            $stmt->close();
        }
    } catch (Exception $e) {
        try {
            $stmt = $conn->prepare(
                "INSERT INTO orders (customer_name, customer_email, pickup_time, order_data, total)
                 VALUES (?, ?, ?, ?, ?)"
            );
            if ($stmt) {
                $stmt->bind_param("ssssd", $name, $email, $pickup, $cartJson, $total);
                $stmt->execute();
                $stmt->close();
            }
        } catch (Exception $e2) {
            error_log('place_order DB fallback: ' . $e2->getMessage());
        }
    }
}

// ── BUILD CART SUMMARY ────────────────────────────────────────────────────────
$cartText = '';
foreach ($cart as $item) {
    $line      = floatval($item['price']) * intval($item['quantity']);
    $cartText .= "• {$item['name']} x{$item['quantity']} = $" . number_format($line, 2) . "\n";
}

$summary = "Order Number: {$orderNumber}\n"
    . "Customer: {$name}\n"
    . "Email: {$email}\n"
    . "Phone: " . ($phone ?: 'Not provided') . "\n"
    . "Pickup Time: {$pickup}\n"
    . ($notes ? "Notes: {$notes}\n" : '')
    . "\nItems:\n{$cartText}"
    . "\nSubtotal: $" . number_format($subtotal, 2)
    . "\nTax:      $" . number_format($tax, 2)
    . "\nTOTAL:    $" . number_format($total, 2);

// ── SEND VIA FORMSUBMIT (same endpoint your contact page uses) ────────────────
function sendFormSubmit($toEmail, $fromName, $subject, $message, $replyTo = '') {
    $fields = [
        'name'          => $fromName,
        'email'         => $replyTo ?: $toEmail,
        '_subject'      => $subject,
        'message'       => $message,
        '_captcha'      => 'false',
        '_template'     => 'table',
    ];

    $postData = http_build_query($fields);

    $ch = curl_init('https://formsubmit.co/' . $toEmail);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $postData,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
    ]);
    $result = curl_exec($ch);
    curl_close($ch);
    return $result;
}

// Email to store owner
sendFormSubmit(
    'mffarah0@gmail.com',
    'Fresh & Green Order System',
    "New Order {$orderNumber} — {$name}",
    $summary,
    $email
);

// Email to customer
$custMessage = "Assalamu Alaikum {$name},\n\n"
    . "Your order is confirmed!\n\n"
    . $summary
    . "\n\nPickup Location: 3425 S 146th St, Tukwila, WA 98168"
    . "\nPayment collected in-store — cash or card accepted."
    . "\n\nQuestions? Call (206) 241-1511"
    . "\n\nFresh & Green Halal Market";

sendFormSubmit(
    $email,
    'Fresh & Green Halal Market',
    "Your Order {$orderNumber} is Confirmed!",
    $custMessage,
    'mffarah0@gmail.com'
);

// ── RESPOND ───────────────────────────────────────────────────────────────────
ob_end_clean();
echo json_encode([
    'success'     => true,
    'orderNumber' => $orderNumber,
    'name'        => $name,
    'pickup'      => $pickup,
    'total'       => number_format($total, 2),
]);
?>