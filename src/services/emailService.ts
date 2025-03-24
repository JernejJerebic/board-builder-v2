import { Order } from '@/types';
import { addLog } from '@/services/localStorage';
import { toast } from 'sonner';
import emailjs from 'emailjs-com';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_email_id';
const EMAILJS_TEMPLATE_ID = 'template_email_id';
const EMAILJS_USER_ID = 'user_id';

/**
 * Sends an email using EmailJS
 */
const sendEmail = async (
  to: string,
  subject: string,
  body: string,
  isHtml = true
): Promise<{ success: boolean; message: string; logId?: string }> => {
  const requestId = `req_${Date.now()}`;
  try {
    // Log the attempt with detailed information
    console.log(`[${requestId}] ATTEMPT: Sending email to ${to}`);
    console.log(`[${requestId}] SUBJECT: ${subject}`);
    console.log(`[${requestId}] CONTENT TYPE: ${isHtml ? 'HTML' : 'Plain text'}`);
    
    addLog(
      'info',
      `Pošiljanje e-pošte na naslov: ${to}`,
      { 
        requestId,
        subject, 
        method: 'emailjs',
        timestamp: new Date().toISOString(),
        contentType: isHtml ? 'HTML' : 'Text'
      }
    );
    
    // Check if EmailJS is configured
    if (EMAILJS_USER_ID === 'user_id' || 
        EMAILJS_SERVICE_ID === 'service_email_id' || 
        EMAILJS_TEMPLATE_ID === 'template_email_id') {
      throw new Error('EmailJS is not properly configured');
    }
    
    // Prepare template parameters
    const templateParams = {
      to_email: to,
      subject: subject,
      message: body,
      from_name: 'LCC Naročilo razreza',
      reply_to: 'info@lcc.si'
    };
    
    // Send email
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_USER_ID
    );
    
    const emailId = `email_${Date.now()}`;
    
    // Log successful sending
    console.log(`[${requestId}] SUCCESS: Email sent to ${to}`);
    console.log(`[${requestId}] EMAIL ID: ${emailId}`);
    console.log(`[${requestId}] SERVER RESPONSE: ${result.text}`);
    
    // Add detailed success log
    addLog(
      'info',
      `E-pošta poslana na naslov: ${to}`,
      { 
        requestId,
        emailId: emailId,
        subject,
        service: 'emailjs',
        timestamp: new Date().toISOString(),
        responseTime: `${Date.now() - parseInt(requestId.split('_')[1])}ms`,
        serverResponse: result.text,
        serverStatus: result.status
      }
    );
    
    return {
      success: true,
      message: `Email sent to ${to}`,
      logId: emailId
    };
  } catch (error) {
    // Detailed error logging
    console.error(`[${requestId}] ERROR: Failed to send email to ${to}`, error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Log error
    addLog(
      'error',
      `Napaka pri pošiljanju e-pošte na naslov: ${to}`,
      { 
        requestId,
        error: errorMessage,
        method: 'emailjs',
        timestamp: new Date().toISOString(),
        responseTime: `${Date.now() - parseInt(requestId.split('_')[1])}ms`
      }
    );
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

/**
 * Creates an email with appropriate content based on order status
 */
const createEmailContent = (
  type: 'new' | 'progress' | 'completed',
  order: Order,
  isAdmin = false
): { subject: string; body: string } => {
  const recipient = isAdmin ? 'Administrator' : 'Stranka';
  
  // Base HTML structure for all emails
  const baseHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #1D6EC1;">{TITLE}</h2>
      <p>Spoštovani ${recipient},</p>
      <p>{MESSAGE}</p>
      <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Številka naročila:</strong> #${order.id}</p>
        <p style="margin: 5px 0;"><strong>Skupni znesek:</strong> €${order.totalCostWithVat.toFixed(2)}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> {STATUS}</p>
      </div>
      <p>Lep pozdrav,<br>Ekipa LCC Naročilo razreza</p>
    </div>
  `;
  
  let title = '';
  let message = '';
  let status = '';
  let subject = '';
  
  // Customize content based on order type and recipient
  switch (type) {
    case 'new':
      title = `Novo naročilo #${order.id}`;
      subject = `LCC Naročilo razreza - Novo naročilo #${order.id}`;
      message = isAdmin ? 'Prejeli ste novo naročilo.' : 'Zahvaljujemo se vam za vaše naročilo.';
      status = 'Novo naročilo';
      break;
      
    case 'progress':
      title = `Naročilo v obdelavi #${order.id}`;
      subject = `LCC Naročilo razreza - Naročilo #${order.id} v obdelavi`;
      message = 'Vaše naročilo je trenutno v obdelavi.';
      status = 'V obdelavi';
      break;
      
    case 'completed':
      title = `Naročilo zaključeno #${order.id}`;
      subject = `LCC Naročilo razreza - Naročilo #${order.id} zaključeno`;
      message = 'Vaše naročilo je zaključeno in pripravljeno.';
      status = 'Zaključeno';
      break;
  }
  
  // Replace placeholders with actual content
  const body = baseHtml
    .replace('{TITLE}', title)
    .replace('{MESSAGE}', message)
    .replace('{STATUS}', status);
  
  return { subject, body };
};

/**
 * Main function to send order-related emails to both customer and admin
 */
export const sendOrderEmail = async (
  type: 'new' | 'progress' | 'completed',
  order: Order,
  customerEmail: string
): Promise<{ success: boolean; message?: string }> => {
  const timestamp = new Date().toISOString();
  const requestId = `order_email_${Date.now()}`;
  
  console.log(`[${requestId}] START: Sending ${type} order email for order ${order.id}`);
  console.log(`[${requestId}] RECIPIENTS: Customer: ${customerEmail}, Admin: jerebic.jernej@gmail.com`);
  
  // Log the start of email sending process with more details
  addLog(
    'info',
    `Začetek pošiljanja e-pošte za naročilo #${order.id}`,
    { 
      requestId,
      type, 
      customerEmail, 
      orderId: order.id, 
      timestamp,
      orderTotal: order.totalCostWithVat,
      productCount: order.products.length
    }
  );
  
  try {
    // Check if EmailJS is configured
    if (EMAILJS_USER_ID === 'user_id' || 
        EMAILJS_SERVICE_ID === 'service_email_id' || 
        EMAILJS_TEMPLATE_ID === 'template_email_id') {
      throw new Error('EmailJS is not properly configured');
    }
    
    // Create and send customer email
    console.log(`[${requestId}] CUSTOMER: Creating email content for ${customerEmail}`);
    const customerEmailContent = createEmailContent(type, order, false);
    
    console.log(`[${requestId}] CUSTOMER: Sending email to ${customerEmail}`);
    const customerResult = await sendEmail(
      customerEmail,
      customerEmailContent.subject,
      customerEmailContent.body
    );
    
    // Create and send admin email
    const adminEmail = 'jerebic.jernej@gmail.com';
    console.log(`[${requestId}] ADMIN: Creating email content for ${adminEmail}`);
    const adminEmailContent = createEmailContent(type, order, true);
    
    console.log(`[${requestId}] ADMIN: Sending email to ${adminEmail}`);
    const adminResult = await sendEmail(
      adminEmail,
      adminEmailContent.subject,
      adminEmailContent.body
    );
    
    // Log detailed results
    if (customerResult.success) {
      console.log(`[${requestId}] CUSTOMER SUCCESS: Email sent to ${customerEmail}, EmailID: ${customerResult.logId || 'N/A'}`);
    } else {
      console.error(`[${requestId}] CUSTOMER ERROR: Failed to send email to ${customerEmail}: ${customerResult.message}`);
    }
    
    if (adminResult.success) {
      console.log(`[${requestId}] ADMIN SUCCESS: Email sent to ${adminEmail}, EmailID: ${adminResult.logId || 'N/A'}`);
    } else {
      console.error(`[${requestId}] ADMIN ERROR: Failed to send email to ${adminEmail}: ${adminResult.message}`);
    }
    
    // Determine overall success and show appropriate notification
    if (customerResult.success && adminResult.success) {
      console.log(`[${requestId}] COMPLETE: All emails sent successfully`);
      
      addLog(
        'info',
        `E-poštna sporočila poslana za naročilo #${order.id}`,
        {
          requestId,
          customerLogId: customerResult.logId,
          adminLogId: adminResult.logId,
          type,
          orderId: order.id
        }
      );
      
      toast.success("E-poštna sporočila poslana", {
        description: "E-pošta je bila poslana na vaš e-poštni naslov in administratorja."
      });
      
      return { 
        success: true, 
        message: 'Emails sent successfully' 
      };
    } else {
      // Partial or complete failure
      console.error(`[${requestId}] PARTIAL FAILURE: Email sending had issues`);
      
      addLog(
        'warning',
        `Delno uspešno pošiljanje e-pošte za naročilo #${order.id}`,
        {
          requestId,
          customerSuccess: customerResult.success,
          adminSuccess: adminResult.success,
          type,
          orderId: order.id
        }
      );
      
      toast.warning("Naročilo ustvarjeno, vendar e-poštna obvestila se niso v celoti poslala", {
        description: "Preverite dnevnik za podrobnosti."
      });
      
      return {
        success: true,
        message: 'Order created but some emails could not be sent'
      };
    }
  } catch (error) {
    console.error(`[${requestId}] CRITICAL ERROR: Unexpected error during email sending:`, error);
    
    // Create a detailed error log
    addLog(
      'error',
      `Nepričakovana napaka pri pošiljanju e-pošte za naročilo #${order.id}`,
      { 
        requestId,
        error: error instanceof Error ? error.message : String(error),
        stackTrace: error instanceof Error ? error.stack : undefined,
        customerEmail,
        adminEmail: 'jerebic.jernej@gmail.com',
        orderId: order.id,
        timestamp
      }
    );
    
    // Show error notification
    toast.error("Naročilo ustvarjeno, vendar e-poštna obvestila se niso poslala", {
      description: "Preverite dnevnik za podrobnosti."
    });
    
    return { 
      success: false, 
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
