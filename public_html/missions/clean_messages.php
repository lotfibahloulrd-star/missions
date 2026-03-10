<?php
$storageDir = __DIR__ . '/data_storage/';
$messagesFile = $storageDir . 'messages.json';

if (file_exists($messagesFile)) {
    $content = file_get_contents($messagesFile);
    $messages = json_decode($content, true);
    if (is_array($messages)) {
        $count = count($messages);
        // On ne garde que les 50 derniers messages
        $keep = array_slice($messages, -50);
        file_put_contents($messagesFile, json_encode($keep, JSON_PRETTY_PRINT));
        echo "Nettoyage réussi : $count messages trouvés, 50 conservés.";
    } else {
        echo "Erreur : Impossible de décoder le fichier messages.json.";
    }
} else {
    echo "Fichier messages.json introuvable.";
}
?>
