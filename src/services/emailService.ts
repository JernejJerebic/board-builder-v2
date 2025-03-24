
import axios from 'axios';
import { toast } from 'sonner';
import { Order } from '@/types';
import { addLog } from '@/services/localStorage';

interface EmailRequest {
  type: 'new' | 'progress' | 'completed';
  orderId: string;
  email: string;
  adminEmail?: string;
}

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
    // Try to send email to customer first
    const customerEmailRequest: EmailRequest = {
      type,
      orderId: order.id,
      email: customerEmail
    };
    
    // Add more robust request configuration
    const requestConfig = {
      timeout: 15000, // Longer timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    // Send customer email
    const customerResponse = await axios.post('/api/email/order.php', customerEmailRequest, requestConfig);
    
    console.log(`[${timestamp}] Customer email response:`, customerResponse.data);
    
    addLog(
      'info',
      `E-pošta uspešno poslana stranki: ${customerEmail}`,
      { 
        response: customerResponse.data,
        orderId: order.id
      }
    );
    
    // If customer email was successful, try sending admin email
    const adminEmail = 'jerebic.jernej@gmail.com';
    const adminEmailRequest: EmailRequest = {
      type,
      orderId: order.id,
      email: adminEmail,
      adminEmail: 'true'
    };
    
    // Send admin email
    const adminResponse = await axios.post('/api/email/order.php', adminEmailRequest, requestConfig);
    
    console.log(`[${timestamp}] Admin email response:`, adminResponse.data);
    
    addLog(
      'info',
      `E-pošta uspešno poslana administratorju: ${adminEmail}`,
      { 
        response: adminResponse.data,
        orderId: order.id
      }
    );
    
    // Show toast notification of success
    toast.success("E-poštna sporočila uspešno poslana", {
      description: "Potrditev naročila poslana na vaš e-poštni naslov in administratorja."
    });
    
    return { 
      success: true, 
      message: 'Emails sent successfully to customer and admin' 
    };
  } catch (error) {
    console.error(`[${timestamp}] Error sending email:`, error);
    
    // Extract more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = axios.isAxiosError(error) 
      ? {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method
          }
        }
      : {};
    
    addLog(
      'error',
      `Napaka pri pošiljanju e-pošte za naročilo #${order.id}`,
      { 
        error: errorMessage,
        details: errorDetails,
        customerEmail,
        adminEmail: 'jerebic.jernej@gmail.com',
        orderId: order.id
      }
    );
    
    // Create a fallback notification in logs that will be visible to admin
    addLog(
      'warning',
      `POZOR: Naročilo #${order.id} ni poslalo e-pošte stranki ${customerEmail}`,
      {
        reason: "Napaka API strežnika: " + errorMessage,
        orderDetails: {
          id: order.id,
          totalCostWithVat: order.totalCostWithVat,
          status: order.status
        },
        timestamp: new Date().toISOString()
      }
    );
    
    // Show toast notification of failure but with more details
    toast.error("Napaka pri pošiljanju e-pošte", {
      description: `Naročilo je bilo uspešno oddano, vendar je prišlo do napake pri pošiljanju e-pošte (${errorMessage}). Administrator bo obveščen o vašem naročilu.`
    });
    
    return { 
      success: false, 
      message: `Failed to send email: ${errorMessage}` 
    };
  }
};
