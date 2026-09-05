<?php
header('Content-Type: application/json');

$file = 'reviews.json';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Read existing reviews or start an empty array if the file is blank
    $current_data = file_exists($file) ? file_get_contents($file) : '[]';
    $reviews = json_decode($current_data, true) ?? [];

    // Create the new review entry
    $new_review = [
        'client_name' => htmlspecialchars($_POST['name'] ?? 'Anonymous'),
        'rating' => (int)($_POST['rating'] ?? 5),
        'review_text' => htmlspecialchars($_POST['review_text'] ?? ''),
        'date' => date('F j, Y') // e.g., August 24, 2026
    ];

    // Add to the beginning of the array and save
    array_unshift($reviews, $new_review);
    
    if (file_put_contents($file, json_encode($reviews, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Could not save to file. Check folder permissions.']);
    }
} elseif ($method === 'GET') {
    // Output the contents of the JSON file to display on the site
    echo file_exists($file) ? file_get_contents($file) : '[]';
}
?>