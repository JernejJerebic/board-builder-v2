import axios from 'axios';
import { toast } from 'sonner';
import { Order } from '@/types';
import { addLog } from '@/services/localStorage';

/**
 * Simple, reliable email sending service that uses our PHP backend
 * This implementation relies on the server's mail() function for maximum compatibility
 */
const sendEmail = async (
  to: string,
  subject: string,
  body: string,
  isHtml = true
): Promise<{ success: boolean; message: string }> => {
  try {
    // Log the attempt
    addLog(
      'info',
      `Pošiljanje e-pošte na naslov: ${to}`,
      { subject, method: 'php-mail', timestamp: new Date().toISOString() }
    );
    
    // Send email using our PHP mail endpoint
    const response = await axios.post('/api/email/send.php', {
      to_email: to,
      subject: subject,
      message: body,
      is_html: isHtml
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Email sent via PHP mail():', response.data);
    
    // Log success
    addLog(
      'info',
      `E-pošta uspešno poslana na naslov: ${to}`,
      { 
        subject,
        service: 'PHP-mail',
        timestamp: new Date().toISOString()
      }
    );
    
    return {
      success: true,
      message: `Email sent to ${to} successfully`
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    const errorMessage = axios.isAxiosError(error)
      ? `${error.message}: ${JSON.stringify(error.response?.data || {})}`
      : String(error);
    
    // Log error
    addLog(
      'error',
      `Napaka pri pošiljanju e-pošte na naslov: ${to}`,
      { 
        error: errorMessage,
        method: 'php-mail',
        timestamp: new Date().toISOString()
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
  console.log(`[${timestamp}] Sending ${type} order email to ${customerEmail} for order ${order.id}`);
  
  // Log the start of email sending process
  addLog(
    'info',
    `Začetek pošiljanja e-pošte za naročilo #${order.id}`,
    { type, customerEmail, orderId: order.id, timestamp }
  );
  
  try {
    // Create and send customer email
    const customerEmailContent = createEmailContent(type, order, false);
    const customerResult = await sendEmail(
      customerEmail,
      customerEmailContent.subject,
      customerEmailContent.body
    );
    
    // Create and send admin email
    // Using the provided email for admin
    const adminEmail = 'jerebic.jernej@gmail.com';
    const adminEmailContent = createEmailContent(type, order, true);
    const adminResult = await sendEmail(
      adminEmail,
      adminEmailContent.subject,
      adminEmailContent.body
    );
    
    // Log results
    if (customerResult.success) {
      console.log(`Email sent to customer: ${customerEmail}`);
    } else {
      console.error(`Failed to send email to customer: ${customerResult.message}`);
    }
    
    if (adminResult.success) {
      console.log(`Email sent to admin: ${adminEmail}`);
    } else {
      console.error(`Failed to send email to admin: ${adminResult.message}`);
    }
    
    // Determine overall success and show appropriate notification
    if (customerResult.success && adminResult.success) {
      toast.success("E-poštna sporočila uspešno poslana", {
        description: "Potrditev naročila poslana na vaš e-poštni naslov in administratorja."
      });
      
      return { 
        success: true, 
        message: 'Emails sent successfully to customer and admin' 
      };
    } else if (customerResult.success || adminResult.success) {
      // At least one email sent successfully
      toast.warning("Delna napaka pri pošiljanju e-pošte", {
        description: "Vsaj eno e-poštno sporočilo je bilo uspešno poslano."
      });
      
      return {
        success: true,
        message: 'At least one email was sent successfully'
      };
    } else {
      // Both emails failed
      toast.error("Napaka pri pošiljanju e-pošte", {
        description: "Naročilo je bilo zabeleženo, vendar e-poštna sporočila niso bila poslana."
      });
      
      return {
        success: false,
        message: 'Failed to send all emails'
      };
    }
  } catch (error) {
    console.error(`[${timestamp}] Unexpected error during email sending:`, error);
    
    // Create a detailed error log
    addLog(
      'error',
      `Nepričakovana napaka pri pošiljanju e-pošte za naročilo #${order.id}`,
      { 
        error: error instanceof Error ? error.message : String(error),
        customerEmail,
        adminEmail: 'jerebic.jernej@gmail.com',
        orderId: order.id,
        timestamp
      }
    );
    
    // Show error notification
    toast.error("Napaka pri pošiljanju e-pošte", {
      description: "Naročilo je bilo zabeleženo, vendar je prišlo do napake pri pošiljanju potrditve."
    });
    
    return { 
      success: false, 
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

