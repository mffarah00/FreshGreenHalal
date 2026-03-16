<?php
ob_start(); // Buffer ALL output so stray warnings never corrupt JSON

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// ── CONFIG ──────────────────────────────────────────────────────────────────
$anthropicKey =
$DEBUG        = false;
// ── READ INPUT ───────────────────────────────────────────────────────────────
$raw     = file_get_contents('php://input');
$data    = json_decode($raw, true);
$message = isset($data['message']) ? trim($data['message']) : '';

if (!$message) {
    ob_end_clean();
    echo json_encode(['reply' => 'Please type a message.', 'recipes' => [], 'hasRecipes' => false]);
    exit;
}

// ── FETCH INVENTORY FROM DB ──────────────────────────────────────────────────
$inventoryContext = '';
try {
    require_once 'db_config.php'; // provides $conn (mysqli)
    $result = $conn->query("SELECT name, price FROM products ORDER BY name LIMIT 80");
    if ($result && $result->num_rows > 0) {
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row['name'] . ' ($' . number_format($row['price'], 2) . ')';
        }
        $inventoryContext = "Current inventory at Fresh & Green: " . implode(', ', $items) . ".";
    }
} catch (Exception $e) {
    if ($DEBUG) error_log('DB error: ' . $e->getMessage());
    $inventoryContext = 'Inventory currently unavailable.';
}

// ── DETECT RECIPE QUERY & CALL EDAMAM ───────────────────────────────────────
$recipeKeywords = ['recipe', 'cook', 'make', 'dish', 'meal', 'food', 'prepare', 'biryani',
    'kabab', 'curry', 'halal', 'lamb', 'chicken', 'beef', 'mutton'];
$isRecipeQuery  = false;
$messageLower   = strtolower($message);
foreach ($recipeKeywords as $kw) {
    if (strpos($messageLower, $kw) !== false) { $isRecipeQuery = true; break; }
}

$recipes     = [];
$recipeBlock = '';
if ($isRecipeQuery) {
    preg_match('/(?:with|using|for|make)\s+([a-z\s]+?)(?:\?|$|recipe)/i', $message, $m);
    $searchTerm = !empty($m[1]) ? trim($m[1]) : $message;
    $searchTerm = urlencode(substr($searchTerm, 0, 40));

    $edamamUrl = "https://api.edamam.com/search?q={$searchTerm}&app_id=a2bf1b06&app_key=3f47ddcb3d8980b0d3fd6129d46f9557&to=3&health=halal";

    $ch = curl_init($edamamUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 6,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
    ]);
    $edamamRaw = curl_exec($ch);
    curl_close($ch);

    if ($edamamRaw) {
        $edamamData = json_decode($edamamRaw, true);
        if (!empty($edamamData['hits'])) {
            foreach (array_slice($edamamData['hits'], 0, 3) as $hit) {
                $r = $hit['recipe'];
                $recipes[] = [
                    'title'    => $r['label'],
                    'image'    => $r['image'],
                    'url'      => $r['url'],
                    'calories' => round($r['calories'] / max(1, $r['yield'])),
                ];
            }
            $titles      = array_column($recipes, 'title');
            $recipeBlock = "\n\nI found these matching recipes: " . implode(', ', $titles) . ". Recipe cards shown below.";
        }
    }
}

// ── BUILD SYSTEM PROMPT ──────────────────────────────────────────────────────
$systemPrompt = "You are a friendly halal cooking assistant for Fresh & Green Halal Market in Tukwila, WA. "
    . "Keep responses under 200 words unless a full recipe is requested. "
    . "Always recommend halal-certified ingredients. Mention store inventory when relevant. "
    . "Be warm and helpful, use food emojis occasionally. "
    . "Store: 3425 S 146th St Tukwila WA, (206) 241-1511. Hours: Sun-Fri 6am-10:30pm, Sat 9am-11pm. "
    . $inventoryContext;

// ── CALL ANTHROPIC API ───────────────────────────────────────────────────────
$anthropicPayload = json_encode([
    'model'      => 'claude-haiku-4-5-20251001',
    'max_tokens' => 600,
    'system'     => $systemPrompt,
    'messages'   => [
        ['role' => 'user', 'content' => $message]
    ]
]);

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_TIMEOUT        => 20,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'x-api-key: ' . $anthropicKey,
        'anthropic-version: 2023-06-01',
    ],
    CURLOPT_POSTFIELDS     => $anthropicPayload,
]);

$anthropicRaw = curl_exec($ch);
$curlError    = curl_error($ch);
curl_close($ch);

// ── PARSE RESPONSE ───────────────────────────────────────────────────────────
$reply = '';
if ($curlError) {
    $reply = 'Connection error. Please try again.';
    if ($DEBUG) $reply .= ' (' . $curlError . ')';
} else {
    $parsed = json_decode($anthropicRaw, true);
    if (isset($parsed['content'][0]['text'])) {
        $reply = $parsed['content'][0]['text'];
        if (!empty($recipeBlock)) $reply .= $recipeBlock;
    } elseif (isset($parsed['error']['message'])) {
        $reply = 'API error: ' . $parsed['error']['message'];
    } else {
        $reply = 'Sorry, could not get a response right now.';
        if ($DEBUG) $reply .= ' Raw: ' . substr($anthropicRaw, 0, 300);
    }
}

// ── SEND RESPONSE ────────────────────────────────────────────────────────────
ob_end_clean();
echo json_encode([
    'reply'      => $reply,
    'recipes'    => $recipes,
    'hasRecipes' => !empty($recipes),
]);