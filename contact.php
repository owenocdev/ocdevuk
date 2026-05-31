<?php
// Only process POST requests
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Sanitize and capture the form data
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $project_type = strip_tags(trim($_POST["projectType"]));
    $message = trim($_POST["message"]);

    // The official domain email hosted on IONOS
    $owen_email = "owen@ocdev.uk"; 

    // Basic validation
    if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: index.html?status=error#contact");
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

    // 'From' MUST be the hosted domain email for IONOS
    $headers_owen = "From: $owen_email\r\n";
    // 'Reply-To' allows you to directly reply to the client's email address
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

    // Redirect back to the website with a success or error flag
    if ($send_to_owen && $send_to_customer) {
        header("Location: index.html?status=success#contact");
    } else {
        header("Location: index.html?status=error#contact");
    }
} else {
    // If accessed directly without submitting the form, send them back
    header("Location: index.html");
}
?>