<?php
// PHPMailer classes
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Load Composer's autoloader
require __DIR__ . '/../vendor/autoload.php';

/**
 * Send an email using PHPMailer
 * 
 * @param string $to Recipient email
 * @param string $subject Email subject
 * @param string $message Email message body
 * @param string $fromName Sender name
 * @param string $fromEmail Sender email
 * @param bool $isHtml Whether the message is HTML
 * @return array Status and message
 */
function sendMail($to, $subject, $message, $fromName = 'LCC Naročilo razreza', $fromEmail = 'info@lcc.si', $isHtml = false) {
    try {
        // Create a new PHPMailer instance
        $mail = new PHPMailer(true);
        
        // Server settings
        $mail->CharSet = "UTF-8";
        
        // Check if SMTP settings are defined
        $smtpHost = getenv('SMTP_HOST');
        $smtpUser = getenv('SMTP_USER');
        $smtpPass = getenv('SMTP_PASS');
        $smtpPort = getenv('SMTP_PORT') ?: 587;
        
        // If SMTP credentials are available, use SMTP, otherwise use PHP mail()
        if ($smtpHost && $smtpUser && $smtpPass) {
            $mail->isSMTP();
            $mail->Host = $smtpHost;
            $mail->SMTPAuth = true;
            $mail->Username = $smtpUser;
            $mail->Password = $smtpPass;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $smtpPort;
            
            // Log SMTP usage
            error_log("Using SMTP configuration with host: {$smtpHost}");
        } else {
            // Fallback to PHP mail() function
            $mail->isMail();
            error_log("SMTP settings not found. Using PHP mail() function");
        }
        
        // Recipients
        $mail->setFrom($fromEmail, $fromName);
        $mail->addAddress($to);       // Add a recipient
        
        // Content
        $mail->isHTML($isHtml);       // Set email format to HTML or plain text
        $mail->Subject = $subject;
        $mail->Body    = $message;
        
        if ($isHtml) {
            // Set plain text alternative body if HTML
            $mail->AltBody = strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $message));
        }
        
        // Log the attempt
        error_log("Attempting to send email to {$to} with subject '{$subject}'");
        
        // Send the email
        $mail->send();
        
        // Log success
        error_log("Email successfully sent to {$to}");
        
        return [
            'success' => true,
            'message' => "Email sent successfully to {$to}"
        ];
    } catch (Exception $e) {
        // Log detailed error
        error_log("Failed to send email to {$to}: {$mail->ErrorInfo}");
        error_log("Error details: " . print_r($e, true));
        
        return [
            'success' => false,
            'message' => "Failed to send email: {$mail->ErrorInfo}"
        ];
    }
}

/**
 * Send an HTML email with better formatting
 * 
 * @param string $to Recipient email
 * @param string $subject Email subject
 * @param string $htmlContent Email HTML content
 * @param string $fromName Sender name
 * @param string $fromEmail Sender email
 * @return array Status and message
 */
function sendHtmlMail($to, $subject, $htmlContent, $fromName = 'LCC Naročilo razreza', $fromEmail = 'info@lcc.si') {
    // Standard email template with logo and styling
    $emailTemplate = '
    <!DOCTYPE html>
    <html lang="sl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>' . $subject . '</title>
        <style>
            body {
                font-family: "Poppins", Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                padding: 20px 0;
                border-bottom: 1px solid #e5e5e5;
            }
            .logo {
                max-width: 200px;
                height: auto;
            }
            .content {
                padding: 20px 0;
            }
            .footer {
                text-align: center;
                padding: 20px 0;
                color: #888;
                font-size: 14px;
                border-top: 1px solid #e5e5e5;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #1D6EC1;
                color: #ffffff;
                text-decoration: none;
                border-radius: 4px;
            }
            h1, h2, h3 {
                color: #1D6EC1;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            table th, table td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #e5e5e5;
            }
            table th {
                background-color: #f1f1f1;
            }
            @media (max-width: 768px) {
                .container {
                    padding: 10px;
                }
                table {
                    font-size: 14px;
                }
                .logo {
                    max-width: 150px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://www.lcc.si/wp-content/uploads/2020/03/Logo-COREL-Brez-ozadja-2-1024x462-1.png" alt="LCC" class="logo">
            </div>
            <div class="content">
                ' . $htmlContent . '
            </div>
            <div class="footer">
                <p>&copy; ' . date('Y') . ' LCC Naročilo razreza. Vse pravice pridržane.</p>
                <p>Za dodatne informacije nas kontaktirajte na <a href="mailto:info@lcc.si">info@lcc.si</a> ali po telefonu na +386 7 393 07 00.</p>
            </div>
        </div>
    </body>
    </html>
    ';
    
    return sendMail($to, $subject, $emailTemplate, $fromName, $fromEmail, true);
}

/**
 * Convert plain text email content to HTML format
 * 
 * @param string $plainText Plain text content
 * @return string HTML formatted content
 */
function textToHtml($plainText) {
    // Convert new lines to <br> tags
    $html = nl2br(htmlspecialchars($plainText));
    
    return $html;
}

/**
 * Create customer information HTML section
 * 
 * @param array $customer Customer information
 * @return string HTML formatted customer information
 */
function createCustomerInfoHtml($customer) {
    $html = '
        <h3 style="color: #1D6EC1; margin-top: 20px;">Podatki o stranki</h3>
        <table>
            <tr>
                <th>Ime in priimek:</th>
                <td>' . htmlspecialchars($customer['firstName'] . ' ' . $customer['lastName']) . '</td>
            </tr>
            <tr>
                <th>Email:</th>
                <td>' . htmlspecialchars($customer['email']) . '</td>
            </tr>';
    
    if (!empty($customer['phone'])) {
        $html .= '
            <tr>
                <th>Telefon:</th>
                <td>' . htmlspecialchars($customer['phone']) . '</td>
            </tr>';
    }
    
    if (!empty($customer['address'])) {
        $html .= '
            <tr>
                <th>Naslov:</th>
                <td>' . htmlspecialchars($customer['address']) . '</td>
            </tr>';
    }
    
    if (!empty($customer['city']) && !empty($customer['postalCode'])) {
        $html .= '
            <tr>
                <th>Mesto:</th>
                <td>' . htmlspecialchars($customer['city'] . ', ' . $customer['postalCode']) . '</td>
            </tr>';
    }
    
    if (!empty($customer['companyName'])) {
        $html .= '
            <tr>
                <th>Podjetje:</th>
                <td>' . htmlspecialchars($customer['companyName']) . '</td>
            </tr>';
        
        if (!empty($customer['vatNumber'])) {
            $html .= '
            <tr>
                <th>ID za DDV:</th>
                <td>' . htmlspecialchars($customer['vatNumber']) . '</td>
            </tr>';
        }
    }
    
    $html .= '
        </table>';
    
    return $html;
}

/**
 * Send order confirmation email
 * 
 * @param string $orderId Order ID
 * @param string $customerEmail Customer email
 * @param array $orderDetails Order details
 * @param array $customer Customer information
 * @return array Status and message
 */
function sendOrderConfirmationEmail($orderId, $customerEmail, $orderDetails, $customer) {
    $subject = "LCC Naročilo razreza - Novo naročilo";
    
    // Add customer information section
    $customerInfoSection = createCustomerInfoHtml($customer);
    
    // Create HTML content
    $content = '
        <h1>Potrditev naročila</h1>
        <p>Spoštovani ' . htmlspecialchars($customer['firstName'] . ' ' . $customer['lastName']) . ',</p>
        <p>Zahvaljujemo se vam za vaše naročilo. V najkrajšem možnem času bomo začeli z obdelavo.</p>
        
        <h2>Podrobnosti naročila</h2>
        <table>
            <tr>
                <th>Številka naročila:</th>
                <td>#' . htmlspecialchars($orderId) . '</td>
            </tr>
            <tr>
                <th>Skupni znesek:</th>
                <td>€' . number_format($orderDetails['totalCostWithVat'], 2) . '</td>
            </tr>
            <tr>
                <th>Način plačila:</th>
                <td>' . getPaymentMethodName($orderDetails['paymentMethod']) . '</td>
            </tr>
            <tr>
                <th>Način dostave:</th>
                <td>' . ($orderDetails['shippingMethod'] === 'pickup' ? 'Prevzem v trgovini' : 'Dostava') . '</td>
            </tr>
        </table>
        
        ' . $customerInfoSection . '
        
        <p>Za vsa vprašanja smo vam na voljo.</p>
        <p>Lep pozdrav,<br>Ekipa LCC Naročilo razreza</p>
    ';
    
    return sendHtmlMail($customerEmail, $subject, $content);
}

/**
 * Send order status update email
 * 
 * @param string $type Email type (progress/completed)
 * @param string $orderId Order ID
 * @param string $customerEmail Customer email
 * @param array $orderDetails Order details array
 * @param array $customer Customer details array
 * @return array Status and message
 */
function sendOrderStatusEmail($type, $orderId, $customerEmail, $orderDetails, $customer) {
    $statusMessage = '';
    $subject = '';
    
    switch ($type) {
        case 'progress':
            $subject = "LCC Naročilo razreza - Naročilo v obdelavi";
            $statusMessage = "Vaše naročilo je trenutno v obdelavi. Obvestili vas bomo, ko bo pripravljeno za prevzem ali dostavo.";
            break;
            
        case 'completed':
            $subject = "LCC Naročilo razreza - Naročilo zaključeno";
            $statusMessage = "Vaše naročilo je zaključeno in pripravljeno " . 
                ($orderDetails['shippingMethod'] === 'pickup' ? 'za prevzem' : 'za dostavo') . ".";
            break;
            
        default:
            return [
                'success' => false,
                'message' => 'Invalid email type'
            ];
    }
    
    // Add customer information section
    $customerInfoSection = createCustomerInfoHtml($customer);
    
    // Create HTML content
    $content = '
        <h1>' . ($type === 'progress' ? 'Naročilo v obdelavi' : 'Naročilo zaključeno') . '</h1>
        <p>Spoštovani ' . htmlspecialchars($customer['firstName'] . ' ' . $customer['lastName']) . ',</p>
        <p>' . $statusMessage . '</p>
        
        <h2>Podrobnosti naročila</h2>
        <table>
            <tr>
                <th>Številka naročila:</th>
                <td>#' . htmlspecialchars($orderId) . '</td>
            </tr>
            <tr>
                <th>Skupni znesek:</th>
                <td>€' . number_format($orderDetails['totalCostWithVat'], 2) . '</td>
            </tr>
            <tr>
                <th>Način dostave:</th>
                <td>' . ($orderDetails['shippingMethod'] === 'pickup' ? 'Prevzem v trgovini' : 'Dostava') . '</td>
            </tr>
        </table>
        
        ' . $customerInfoSection . '
        
        <p>V primeru vprašanj nas kontaktirajte na <a href="mailto:info@lcc.si">info@lcc.si</a>.</p>
        <p>Lep pozdrav,<br>Ekipa LCC Naročilo razreza</p>
    ';
    
    return sendHtmlMail($customerEmail, $subject, $content);
}

/**
 * Send admin notification email
 * 
 * @param string $orderId Order ID
 * @param array $orderDetails Order details
 * @param array $customer Customer information
 * @return array Status and message
 */
function sendAdminOrderNotification($orderId, $orderDetails, $customer) {
    $adminEmail = "info@lcc.si";
    $subject = "Novo naročilo";
    
    // Create customer information section
    $customerInfoSection = createCustomerInfoHtml($customer);
    
    // Create HTML content
    $content = '
        <h1>Novo naročilo</h1>
        <p>Prejeli ste novo naročilo <strong>#' . htmlspecialchars($orderId) . '</strong>.</p>
        
        ' . $customerInfoSection . '
        
        <h2>Podrobnosti naročila</h2>
        <table>
            <tr>
                <th>Številka naročila:</th>
                <td>#' . htmlspecialchars($orderId) . '</td>
            </tr>
            <tr>
                <th>Skupni znesek:</th>
                <td>€' . number_format($orderDetails['totalCostWithVat'], 2) . '</td>
            </tr>
            <tr>
                <th>Način plačila:</th>
                <td>' . getPaymentMethodName($orderDetails['paymentMethod']) . '</td>
            </tr>
            <tr>
                <th>Način dostave:</th>
                <td>' . ($orderDetails['shippingMethod'] === 'pickup' ? 'Prevzem v trgovini' : 'Dostava') . '</td>
            </tr>
        </table>
        
        <p><a href="https://your-domain.com/admin/order-detail.php?id=' . htmlspecialchars($orderId) . '" class="button">Oglejte si naročilo</a></p>
    ';
    
    return sendHtmlMail($adminEmail, $subject, $content, 'LCC Sistem', 'noreply@lcc.si');
}

/**
 * Get human-readable payment method name
 * 
 * @param string $method Payment method key
 * @return string Human-readable name
 */
function getPaymentMethodName($method) {
    switch($method) {
        case 'bank_transfer':
            return 'Bančno nakazilo';
        case 'credit_card':
            return 'Kreditna kartica';
        case 'pickup_at_shop':
            return 'Plačilo ob prevzem v trgovini';
        case 'payment_on_delivery':
            return 'Plačilo ob dostavi';
        default:
            return 'Neznano';
    }
}
