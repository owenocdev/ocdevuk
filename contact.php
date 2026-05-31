<?php
// Only process POST requests
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Sanitize and capture the form data
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $project_type = strip_tags(trim($_POST["projectType"]));
    $message = trim($_POST["message"]);

    // The official domain email hosted on Hostinger
    $owen_email = "owen@ocdev.uk"; 

    // Basic validation
    if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo "Please complete all required fields.";
        exit;
    }

    // ==========================================
    // EMAIL 1: Notification to Owen
    // ==========================================
    $subject_owen = "New Project Inquiry: $project_type from $name";
    
    $body_owen = "You have received a new inquiry from your website.\n\n";
    $body_owen .= "Name: $name\n";
    $body_owen .= "Email: $email\n";
    $body_owen .= "Project Type: $project_type\n\n";
    $body_owen .= "Message:\n$message\n";

    $headers_owen = "From: $owen_email\r\n";
    $headers_owen .= "Reply-To: $email\r\n"; 

    // ==========================================
    // EMAIL 2: Auto-reply to the Client
    // ==========================================
    $subject_customer = "Thanks for reaching out to ocdev.uk";
    
    $body_customer = "Hi $name,\n\n";
    $body_customer .= "Thanks for getting in touch! Just letting you know I've received your message regarding your $project_type.\n\n";
    $body_customer .= "I'll take a read through your project details and get back to you within 24 hours so we can chat about the next steps.\n\n";
    $body_customer .= "Cheers,\n\nOwen\nocdev.uk\nowen@ocdev.uk";

    $headers_customer = "From: $owen_email\r\n";
    $headers_customer .= "Reply-To: $owen_email\r\n";

    // Send the emails using PHP's built-in mail() function
    $send_to_owen = mail($owen_email, $subject_owen, $body_owen, $headers_owen);
    $send_to_customer = mail($email, $subject_customer, $body_customer, $headers_customer);

    // Return a success or error response to the JavaScript
    if ($send_to_owen && $send_to_customer) {
        http_response_code(200);
        echo "Success";
    } else {
        http_response_code(500);
        echo "Error sending email.";
    }
} else {
    // If accessed directly without submitting the form
    http_response_code(403);
    echo "Forbidden";
}
?>