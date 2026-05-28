<?php
// Only process POST requests
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Sanitize and capture the form data
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $message = trim($_POST["message"]);

    // The official domain email hosted on IONOS
    $susan_email = "info@soundyogawithsusan.com"; 

    // Basic validation
    if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: index.html?status=error#contact");
        exit;
    }

    // ==========================================
    // EMAIL 1: Notification to Susan
    // ==========================================
    $subject_susan = "New Website Inquiry from $name";
    
    $body_susan = "You have received a new inquiry from your website.\n\n";
    $body_susan .= "Name: $name\n";
    $body_susan .= "Email: $email\n\n";
    $body_susan .= "Message:\n$message\n";

    // 'From' MUST be the hosted domain email for IONOS
    $headers_susan = "From: $susan_email\r\n";
    // 'Reply-To' allows Susan to directly reply to the customer's email address
    $headers_susan .= "Reply-To: $email\r\n"; 

    // ==========================================
    // EMAIL 2: Auto-reply to the Customer
    // ==========================================
    $subject_customer = "Thank you for reaching out to Sound Yoga with Susan";
    
    $body_customer = "Hi $name,\n\n";
    $body_customer .= "Thank you for getting in touch! This is an automated message to let you know I have received your inquiry.\n\n";
    $body_customer .= "I will review your message and get back to you as soon as possible to answer your questions or arrange your session.\n\n";
    $body_customer .= "Warmly,\nSusan\nSound Yoga with Susan\ninfo@soundyogawithsusan.com";

    $headers_customer = "From: $susan_email\r\n";
    $headers_customer .= "Reply-To: $susan_email\r\n";

    // Send the emails using PHP's built-in mail() function
    $send_to_susan = mail($susan_email, $subject_susan, $body_susan, $headers_susan);
    $send_to_customer = mail($email, $subject_customer, $body_customer, $headers_customer);

    // Redirect back to the website with a success or error flag
    if ($send_to_susan && $send_to_customer) {
        header("Location: index.html?status=success#contact");
    } else {
        header("Location: index.html?status=error#contact");
    }
} else {
    // If accessed directly without submitting the form, send them back
    header("Location: index.html");
}
?>