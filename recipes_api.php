<?php
header("Content-Type: application/json");

$app_id  = "a2bf1b06";
$app_key = "3f47ddcb3d8980b0d3fd6129d46f9557";

$query = isset($_GET['q']) && !empty($_GET['q']) ? $_GET['q'] : "chicken";

$url = "https://api.edamam.com/api/recipes/v2?type=public&q="
    . urlencode($query)
    . "&app_id={$app_id}&app_key={$app_key}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode(["error" => curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

$data = json_decode($response, true);

if (!isset($data["hits"])) {
    echo json_encode([]);
    exit;
}

$recipes = [];

foreach ($data["hits"] as $hit) {
    $r = $hit["recipe"];
    $recipes[] = [
        "title" => $r["label"],
        "image" => $r["image"],
        "url" => $r["url"],
        "ingredients" => $r["ingredientLines"]
    ];
}

echo json_encode($recipes);