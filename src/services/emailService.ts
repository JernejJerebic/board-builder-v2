
import axios from 'axios';

interface EmailRequest {
  type: 'new' | 'progress' | 'completed';
  orderId: string;
  email: string;
  adminEmail?: string;
}

export const sendOrderEmail = async (
  type: 'new' | 'progress' | 'completed',
  order: any,
  customerEmail: string
): Promise<{ success: boolean; message?: string }> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Sending ${type} order email to ${customerEmail} for order ${order.id}`);
  
  try {
    // Send email to customer
    const customerEmailRequest: EmailRequest = {
      type,
      orderId: order.id,
      email: customerEmail
    };
    
    const customerResponse = await axios.post('/api/email/order.php', customerEmailRequest);
    
    // Send email to admin
    const adminEmailRequest: EmailRequest = {
      type,
      orderId: order.id,
      email: 'jerebic.jernej@gmail.com',
      adminEmail: 'true'
    };
    
    const adminResponse = await axios.post('/api/email/order.php', adminEmailRequest);
    
    console.log(`[${timestamp}] Email sent to customer:`, customerResponse.data);
    console.log(`[${timestamp}] Email sent to admin:`, adminResponse.data);
    
    return { 
      success: true, 
      message: 'Emails sent successfully to customer and admin' 
    };
  } catch (error) {
    console.error(`[${timestamp}] Error sending email:`, error);
    return { 
      success: false, 
      message: `Failed to send email: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
