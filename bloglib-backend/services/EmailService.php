<?php
class EmailService
{

  public function send($to, $subject, $body, $isHtml = true)
  {
    $headers = [
      'MIME-Version: 1.0',
      'Content-type: ' . ($isHtml ? 'text/html' : 'text/plain') . '; charset=UTF-8',
      'From: ' . SMTP_FROM,
      'Reply-To: ' . SMTP_FROM,
      'X-Mailer: PHP/' . phpversion()
    ];

    return mail($to, $subject, $body, implode("\r\n", $headers));
  }

  public function sendVerificationEmail($email, $name, $token)
  {
    $verificationLink = APP_URL . '/verify-email?token=' . $token;
    $subject = 'Verify Your Email - BlogLib';
    $body = "
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .button { background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2>Welcome to BlogLib, $name!</h2>
                    <p>Please verify your email address by clicking the button below:</p>
                    <p><a href='$verificationLink' class='button'>Verify Email</a></p>
                    <p>Or copy and paste this link: $verificationLink</p>
                    <p>This link expires in 24 hours.</p>
                </div>
            </body>
            </html>
        ";

    return $this->send($email, $subject, $body);
  }

  public function sendPasswordResetEmail($email, $name, $token)
  {
    $resetLink = APP_URL . '/reset-password?token=' . $token;
    $subject = 'Reset Your Password - BlogLib';
    $body = "
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .button { background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2>Hello $name,</h2>
                    <p>We received a request to reset your password. Click the button below to set a new password:</p>
                    <p><a href='$resetLink' class='button'>Reset Password</a></p>
                    <p>Or copy and paste this link: $resetLink</p>
                    <p>This link expires in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            </body>
            </html>
        ";

    return $this->send($email, $subject, $body);
  }

  public function sendRoleApprovalEmail($email, $name, $role)
  {
    $subject = 'Role Application Approved - BlogLib';
    $body = "
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2>Congratulations, $name!</h2>
                    <p>Your application to become a $role has been approved.</p>
                    <p>You can now access $role features on BlogLib.</p>
                    <p><a href='" . APP_URL . "' style='background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;'>Go to Dashboard</a></p>
                </div>
            </body>
            </html>
        ";

    return $this->send($email, $subject, $body);
  }

  public function sendWelcomeEmail($email, $name)
  {
    $subject = 'Welcome to BlogLib!';
    $body = "
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2>Welcome to BlogLib, $name!</h2>
                    <p>We're excited to have you on board.</p>
                    <p>Start exploring amazing content from creators around the world.</p>
                    <p><a href='" . APP_URL . "' style='background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;'>Start Reading</a></p>
                </div>
            </body>
            </html>
        ";

    return $this->send($email, $subject, $body);
  }
}
