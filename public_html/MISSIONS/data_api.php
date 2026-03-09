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

// Helper to log actions
function logAction($action, $item = null) {
    global $storageDir;
    $logFile = $storageDir . 'actions_log.json';
    $entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'user_ip' => $_SERVER['REMOTE_ADDR'],
        'action' => $action,
        'item_id' => $item['id'] ?? null,
        'details' => $item
    ];

    $fp = fopen($logFile, 'c+');
    if ($fp) {
        if (flock($fp, LOCK_EX)) {
            $size = filesize($logFile);
            $content = $size > 0 ? fread($fp, $size) : '[]';
            $logs = json_decode($content, true) ?: [];
            $logs[] = $entry;
            // Keep last 500 actions
            if (count($logs) > 500) array_shift($logs);
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, json_encode($logs, JSON_PRETTY_PRINT));
            fflush($fp);
            flock($fp, LOCK_UN);
        }
        fclose($fp);
    }
}

function updateData($filename, $item, $idKey = 'id', $isDelete = false) {
    global $storageDir;
    $filepath = $storageDir . $filename;

    // Log the update
    logAction($isDelete ? "delete_$filename" : "save_$filename", $item);

    $fp = fopen($filepath, 'c+');
    if (!$fp) return false;

    if (flock($fp, LOCK_EX)) {
        $size = filesize($filepath);
        $content = $size > 0 ? fread($fp, $size) : '[]';
        $data = json_decode($content, true);
        if (!is_array($data)) $data = [];

        $found = false;
        $newItemId = $item[$idKey] ?? null;

        $newData = [];
        if ($isDelete) {
            foreach ($data as $existing) {
                if (isset($existing[$idKey]) && $existing[$idKey] == $newItemId) continue;
                $newData[] = $existing;
            }
        } else {
            foreach ($data as $existing) {
                if (isset($existing[$idKey]) && $existing[$idKey] == $newItemId) {
                    $newData[] = array_merge($existing, $item);
                    $found = true;
                } else {
                    $newData[] = $existing;
                }
            }
            if (!$found) $newData[] = $item;
        }

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($newData, JSON_PRETTY_PRINT));
        fflush($fp);
        flock($fp, LOCK_UN);
    }
    fclose($fp);
    return true;
}

// ROUTING
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $response = [
        'users' => json_decode(@file_get_contents($storageDir . 'users.json'), true) ?: [],
        'missions' => json_decode(@file_get_contents($storageDir . 'missions.json'), true) ?: [],
        'messages' => json_decode(@file_get_contents($storageDir . 'messages.json'), true) ?: [],
        'settings' => json_decode(@file_get_contents($storageDir . 'settings.json'), true) ?: (object)[],
        'expenses' => json_decode(@file_get_contents($storageDir . 'expenses.json'), true) ?: [],
        'logs' => json_decode(@file_get_contents($storageDir . 'actions_log.json'), true) ?: []
    ];
    echo json_encode($response);
    exit;
} 

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file'])) {
        $uploadDir = __DIR__ . '/uploads/';
        if (!file_exists($uploadDir)) @mkdir($uploadDir, 0755, true);
        
        $file = $_FILES['file'];
        $fileName = time() . '_' . basename($file['name']);
        $targetPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            logAction('upload_file', ['filename' => $fileName]);
            echo json_encode(['success' => true, 'url' => 'uploads/' . $fileName, 'name' => $file['name']]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Upload failed']);
        }
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? $input['action'] ?? null;

    if (!$action) {
        echo json_encode(['success' => false, 'error' => 'No action specified']);
        exit;
    }

    $success = false;
    $data = $input['data'] ?? $input; // Support both structures

    switch ($action) {
        case 'save_mission':
            $success = updateData('missions.json', $data);
            break;
        case 'delete_mission':
            $success = updateData('missions.json', ['id' => $input['id'] ?? $data['id']], 'id', true);
            break;
        case 'save_user':
            $success = updateData('users.json', $data);
            break;
        case 'delete_user':
            $success = updateData('users.json', ['id' => $input['id'] ?? $data['id']], 'id', true);
            break;
        case 'save_message':
            $success = updateData('messages.json', $data);
            break;
        case 'delete_message':
            $success = updateData('messages.json', ['id' => $input['id'] ?? $data['id']], 'id', true);
            break;
        case 'save_settings':
            $success = file_put_contents($storageDir . 'settings.json', json_encode($data, JSON_PRETTY_PRINT));
            logAction('save_settings', $data);
            break;
        case 'save_expense':
            $success = updateData('expenses.json', $data);
            break;
        case 'delete_expense':
            $success = updateData('expenses.json', ['id' => $input['id'] ?? $data['id']], 'id', true);
            break;
    }

    echo json_encode(['success' => (bool)$success]);
    exit;
}
?>
