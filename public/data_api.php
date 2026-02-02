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

// Helper to safely read/write JSON
function updateData($filename, $item, $idKey = 'id', $isDelete = false) {
    global $storageDir;
    $filepath = $storageDir . $filename;
    
    $fp = fopen($filepath, 'c+'); // Open for reading and writing
    if (!$fp) return false;

    if (flock($fp, LOCK_EX)) { // Acquire exclusive lock
        $size = filesize($filepath);
        $content = $size > 0 ? fread($fp, $size) : '[]';
        $data = json_decode($content, true);
        if (!is_array($data)) $data = [];

        $found = false;
        $newItemId = $item[$idKey] ?? null;

        // Process list
        $newData = [];
        if ($isDelete) {
            foreach ($data as $existing) {
                if (isset($existing[$idKey]) && $existing[$idKey] == $newItemId) {
                    continue; // Skip (delete)
                }
                $newData[] = $existing;
            }
        } else {
            foreach ($data as $k => $existing) {
                if (isset($existing[$idKey]) && $existing[$idKey] == $newItemId) {
                    // Update existing
                    $newData[] = array_merge($existing, $item);
                    $found = true;
                } else {
                    $newData[] = $existing;
                }
            }
            if (!$found) {
                $newData[] = $item; // Add new
            }
        }

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($newData, JSON_PRETTY_PRINT));
        fflush($fp);
        flock($fp, LOCK_UN); // Release lock
    }
    fclose($fp);
    return true;
}

// Function specifically for overwrite (settings, or legacy full sync if needed)
function overwriteData($filename, $fullData) {
    global $storageDir;
    $filepath = $storageDir . $filename;
    file_put_contents($filepath, json_encode($fullData, JSON_PRETTY_PRINT));
}

// --- GET Request: Load All ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $load = function($f) use ($storageDir) {
        if (file_exists($storageDir . $f)) {
            $c = file_get_contents($storageDir . $f);
            return json_decode($c, true) ?: [];
        }
        return [];
    };
    
    // Settings is an object, not array
    $loadSettings = function($f) use ($storageDir) {
        if (file_exists($storageDir . $f)) {
            return json_decode(file_get_contents($storageDir . $f), true) ?: null;
        }
        return null;
    };

    echo json_encode([
        'users' => $load('users.json'),
        'missions' => $load('missions.json'),
        'settings' => $loadSettings('settings.json'),
        'messages' => $load('messages.json')
    ]);
    exit;
}

// --- POST Request: Actions ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Legacy support or Specific Action
    $action = $_GET['action'] ?? $input['action'] ?? null;
    $type = $input['type'] ?? null; // For legacy full sync

    if ($action) {
        // GRANULAR ACTIONS (Safe)
        $success = false;
        
        if ($action === 'save_mission') {
            $success = updateData('missions.json', $input['data'], 'id');
        }
        elseif ($action === 'delete_mission') {
            $success = updateData('missions.json', ['id' => $input['id']], 'id', true);
        }
        elseif ($action === 'save_user') {
            $success = updateData('users.json', $input['data'], 'id');
        }
        elseif ($action === 'delete_user') {
            $success = updateData('users.json', ['id' => $input['id']], 'id', true);
        }
        elseif ($action === 'delete_message') {
            $success = updateData('messages.json', ['id' => $input['id']], 'id', true);
        }
        elseif ($action === 'save_message') {
            $success = updateData('messages.json', $input['data'], 'id');
        }
        elseif ($action === 'save_settings') {
            // Settings is usually global object, safer to overwrite or merge
            // Assuming settings is single object
            $current = json_decode(file_get_contents($storageDir . 'settings.json') ?: '{}', true);
            $new = array_merge($current, $input['data']);
            file_put_contents($storageDir . 'settings.json', json_encode($new, JSON_PRETTY_PRINT));
            $success = true;
        }

        echo json_encode(['success' => $success]);
    } 
    elseif ($type) {
        // LEGACY FULL OVERWRITE (Fallback)
        // Only use if we really mean to replace everything
        $filePath = $storageDir . $type . '.json';
        if (file_put_contents($filePath, json_encode($input['data'], JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Write failed']);
        }
    }
    exit;
}
?>
