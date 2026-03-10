<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'error' => 'No input']);
    exit;
}

$to = $input['to'];
$subject = $input['subject'];
$messageBody = $input['message'];
$fromName = $input['fromName'] ?? 'ESCLAB Missions';

// Configuration
$smtpHost = 'mail.esclab-academy.com';
$smtpPort = 465;
$username = 'alerte-mission@esclab-academy.com';
$password = 'INS123bej456/*';

function sendSmtpEmail($host, $port, $username, $password, $to, $subject, $body, $fromName) {
    $crlf = "\r\n";
    $socket = fsockopen("ssl://" . $host, $port, $errno, $errstr, 20);
    
    if (!$socket) {
        return ['success' => false, 'error' => "Connection failed: $errstr"];
    }

    $log = [];
    
    function serverCmd($socket, $cmd, &$log) {
        if ($cmd) fwrite($socket, $cmd . "\r\n");
        $response = '';
        while (($line = fgets($socket, 515)) !== false) {
            $response .= $line;
            if (substr($line, 3, 1) == ' ') break;
        }
        $log[] = "C: $cmd";
        $log[] = "S: $response";
        return $response;
    }

    serverCmd($socket, "", $log); // Greet
    serverCmd($socket, "EHLO " . $host, $log);
    serverCmd($socket, "AUTH LOGIN", $log);
    serverCmd($socket, base64_encode($username), $log);
    serverCmd($socket, base64_encode($password), $log);
    
    serverCmd($socket, "MAIL FROM: <$username>", $log);
    serverCmd($socket, "RCPT TO: <$to>", $log);
    
    serverCmd($socket, "DATA", $log);
    
    $headers = "MIME-Version: 1.0" . $crlf;
    $headers .= "Content-type: text/html; charset=utf-8" . $crlf;
    $headers .= "From: $fromName <$username>" . $crlf;
    $headers .= "To: $to" . $crlf;
    $headers .= "Subject: $subject" . $crlf;
    
    $data = $headers . $crlf . $body . $crlf . ".";
    $result = serverCmd($socket, $data, $log);
    
    serverCmd($socket, "QUIT", $log);
    fclose($socket);
    
    if (strpos($result, '250') !== false) {
        return ['success' => true];
    } else {
        return ['success' => false, 'error' => 'SMTP Error', 'log' => $log];
    }
}

$result = sendSmtpEmail($smtpHost, $smtpPort, $username, $password, $to, $subject, $messageBody, $fromName);
echo json_encode($result);
?>
