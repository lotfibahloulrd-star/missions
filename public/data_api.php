<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$storageDir = __DIR__ . '/data_storage/';
if (!file_exists($storageDir)) {
    @mkdir($storageDir, 0755, true);
}

// Initialise avec des tableaux vides pour éviter les erreurs JS (.length)
function loadJson($file, $isCollection = true) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $data = json_decode($content, true);
        if ($data !== null) return $data;
    }
    return $isCollection ? [] : null;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'users' => loadJson($storageDir . 'users.json'),
        'missions' => loadJson($storageDir . 'missions.json'),
        'settings' => loadJson($storageDir . 'settings.json', false),
        'messages' => loadJson($storageDir . 'messages.json')
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['type'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }

    $type = $input['type'];
    $data = $input['data'] ?? null;

    if ($data !== null) {
        $filePath = $storageDir . $type . '.json';
        if (file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Write failed']);
        }
    }
    exit;
}
?>
