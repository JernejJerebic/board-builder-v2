
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
    // Send email to customer
    const customerEmailRequest: EmailRequest = {
      type,
      orderId: order.id,
      email: customerEmail
    };
    
    const customerResponse = await axios.post('/api/email/order.php', customerEmailRequest);
    
    addLog(
      'info',
      `E-pošta uspešno poslana stranki: ${customerEmail}`,
      { 
        response: customerResponse.data,
        orderId: order.id
      }
    );
    
    // Send email to admin
    const adminEmailRequest: EmailRequest = {
      type,
      orderId: order.id,
      email: 'jerebic.jernej@gmail.com',
      adminEmail: 'true'
    };
    
    const adminResponse = await axios.post('/api/email/order.php', adminEmailRequest);
    
    addLog(
      'info',
      `E-pošta uspešno poslana administratorju: jerebic.jernej@gmail.com`,
      { 
        response: adminResponse.data,
        orderId: order.id
      }
    );
    
    console.log(`[${timestamp}] Email sent to customer:`, customerResponse.data);
    console.log(`[${timestamp}] Email sent to admin:`, adminResponse.data);
    
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
    
    addLog(
      'error',
      `Napaka pri pošiljanju e-pošte za naročilo #${order.id}`,
      { 
        error: error instanceof Error ? error.message : String(error),
        customerEmail,
        adminEmail: 'jerebic.jernej@gmail.com',
        orderId: order.id
      }
    );
    
    // Show toast notification of failure
    toast.error("Napaka pri pošiljanju e-pošte", {
      description: "Naročilo je bilo uspešno oddano, vendar je prišlo do napake pri pošiljanju potrditvenega e-poštnega sporočila."
    });
    
    return { 
      success: false, 
      message: `Failed to send email: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
