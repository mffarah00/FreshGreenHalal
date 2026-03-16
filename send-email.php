<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $first = htmlspecialchars($_POST["name-first"]);
    $last = htmlspecialchars($_POST["name-last"]);
    $email = htmlspecialchars($_POST["email"]);
    $phone = htmlspecialchars($_POST["phone"]);
    $message = htmlspecialchars($_POST["message"]);

    $to = "yourrealemail@gmail.com";  //
    $subject = "New Contact Form Message - Fresh & Green Halal Market";

    $body = "You received a new message:\n\n";
    $body .= "Name: $first $last\n";
    $body .= "Email: $email\n";
    $body .= "Phone: $phone\n\n";
    $body .= "Message:\n$message\n";

    $headers = "From: $email";

    if (mail($to, $subject, $body, $headers)) {
        echo "<h2>Message Sent Successfully!</h2>";
        echo "<p><a href='contact.html'>Go Back</a></p>";
    } else {
        echo "<h2>Error sending message.</h2>";
    }
}
?>