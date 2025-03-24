import axios from 'axios';
import { toast } from 'sonner';
import { Order } from '@/types';
import { addLog } from '@/services/localStorage';

/**
 * Client-side email simulation service
 * This implementation logs email attempts but doesn't actually send emails as PHP endpoints are not available
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
        method: 'client-side-simulation',
        timestamp: new Date().toISOString(),
        contentType: isHtml ? 'HTML' : 'Text'
      }
    );
    
    // In a live environment, we would send an actual email here
    // But since the PHP endpoints are not accessible, we'll just simulate success
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const simulatedLogId = `log_${Date.now()}`;
    
    // Log successful simulation
    console.log(`[${requestId}] SUCCESS: Email simulated for ${to}`);
    console.log(`[${requestId}] SIMULATION ID: ${simulatedLogId}`);
    
    // Add detailed success log
    addLog(
      'info',
      `E-pošta simulirana za naslov: ${to}`,
      { 
        requestId,
        simulationId: simulatedLogId,
        subject,
        service: 'client-side-simulation',
        timestamp: new Date().toISOString(),
        responseTime: `${Date.now() - parseInt(requestId.split('_')[1])}ms`
      }
    );
    
    return {
      success: true,
      message: `Email simulated for ${to}`,
      logId: simulatedLogId
    };
  } catch (error) {
    // Detailed error logging
    console.error(`[${requestId}] ERROR: Failed to simulate email for ${to}`, error);
    
    const errorMessage = axios.isAxiosError(error)
      ? `${error.message}: ${JSON.stringify(error.response?.data || {})}`
      : String(error);
    
    // Log error
    addLog(
      'error',
      `Napaka pri simulaciji e-pošte za naslov: ${to}`,
      { 
        requestId,
        error: errorMessage,
        method: 'client-side-simulation',
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
 * Main function to simulate sending order-related emails to both customer and admin
 * Since we can't actually send emails through PHP on this environment, we'll just log them
 */
export const sendOrderEmail = async (
  type: 'new' | 'progress' | 'completed',
  order: Order,
  customerEmail: string
): Promise<{ success: boolean; message?: string }> => {
  const timestamp = new Date().toISOString();
  const requestId = `order_email_${Date.now()}`;
  
  console.log(`[${requestId}] START: Simulating ${type} order email for order ${order.id}`);
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
    // Create and send customer email
    console.log(`[${requestId}] CUSTOMER: Creating email content for ${customerEmail}`);
    const customerEmailContent = createEmailContent(type, order, false);
    
    console.log(`[${requestId}] CUSTOMER: Simulating email to ${customerEmail}`);
    const customerResult = await sendEmail(
      customerEmail,
      customerEmailContent.subject,
      customerEmailContent.body
    );
    
    // Create and send admin email
    const adminEmail = 'jerebic.jernej@gmail.com';
    console.log(`[${requestId}] ADMIN: Creating email content for ${adminEmail}`);
    const adminEmailContent = createEmailContent(type, order, true);
    
    console.log(`[${requestId}] ADMIN: Simulating email to ${adminEmail}`);
    const adminResult = await sendEmail(
      adminEmail,
      adminEmailContent.subject,
      adminEmailContent.body
    );
    
    // Log detailed results
    if (customerResult.success) {
      console.log(`[${requestId}] CUSTOMER SUCCESS: Email simulated for ${customerEmail}, SimulationID: ${customerResult.logId || 'N/A'}`);
    } else {
      console.error(`[${requestId}] CUSTOMER ERROR: Failed to simulate email for ${customerEmail}: ${customerResult.message}`);
    }
    
    if (adminResult.success) {
      console.log(`[${requestId}] ADMIN SUCCESS: Email simulated for ${adminEmail}, SimulationID: ${adminResult.logId || 'N/A'}`);
    } else {
      console.error(`[${requestId}] ADMIN ERROR: Failed to simulate email for ${adminEmail}: ${adminResult.message}`);
    }
    
    // Determine overall success and show appropriate notification
    if (customerResult.success && adminResult.success) {
      console.log(`[${requestId}] COMPLETE: All emails simulated successfully`);
      
      addLog(
        'info',
        `E-poštna sporočila simulirana za naročilo #${order.id}`,
        {
          requestId,
          customerLogId: customerResult.logId,
          adminLogId: adminResult.logId,
          type,
          orderId: order.id
        }
      );
      
      toast.success("E-poštna sporočila simulirana", {
        description: "V produkcijskem okolju bi bila e-pošta poslana na vaš e-poštni naslov in administratorja."
      });
      
      return { 
        success: true, 
        message: 'Email simulation completed successfully' 
      };
    } else {
      // Partial or complete failure
      console.error(`[${requestId}] PARTIAL FAILURE: Email simulation had issues`);
      
      addLog(
        'warning',
        `Delno uspešna simulacija e-pošte za naročilo #${order.id}`,
        {
          requestId,
          customerSuccess: customerResult.success,
          adminSuccess: adminResult.success,
          type,
          orderId: order.id
        }
      );
      
      toast.warning("Naročilo ustvarjeno, vendar e-poštna obvestila se ne morejo poslati", {
        description: "E-poštne funkcije niso na voljo v tem okolju."
      });
      
      return {
        success: true,
        message: 'Order created but emails could not be sent in this environment'
      };
    }
  } catch (error) {
    console.error(`[${requestId}] CRITICAL ERROR: Unexpected error during email simulation:`, error);
    
    // Create a detailed error log
    addLog(
      'error',
      `Nepričakovana napaka pri simulaciji e-pošte za naročilo #${order.id}`,
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
    toast.error("Naročilo ustvarjeno, vendar ni e-poštnih obvestil", {
      description: "E-poštne funkcije niso na voljo v tem okolju."
    });
    
    return { 
      success: false, 
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
