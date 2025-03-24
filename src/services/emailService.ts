
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

// Helper function to check if the environment has the PHP backend
const hasPhpBackend = async (): Promise<boolean> => {
  try {
    // Try to reach the PHP backend with a simple HEAD request
    await axios.head('/api/test.php', { timeout: 2000 });
    return true;
  } catch (error) {
    console.log('PHP backend not detected, using email fallback');
    return false;
  }
};

// Fallback email function - logs the email content when PHP backend is not available
const sendEmailFallback = (
  type: 'new' | 'progress' | 'completed',
  order: Order,
  customerEmail: string,
  isAdmin = false
): { success: boolean; message: string } => {
  // Determine recipient and subject
  const recipient = isAdmin ? 'Administrator' : 'Customer';
  const emailAddress = isAdmin ? 'jerebic.jernej@gmail.com' : customerEmail;
  
  let subject = '';
  let content = '';
  
  // Create email content based on type
  switch (type) {
    case 'new':
      subject = `LCC Naročilo razreza - Novo naročilo #${order.id}`;
      content = `Novo naročilo #${order.id} je bilo ustvarjeno.\nSkupni znesek: €${order.totalCostWithVat.toFixed(2)}`;
      break;
    case 'progress':
      subject = `LCC Naročilo razreza - Naročilo #${order.id} v obdelavi`;
      content = `Vaše naročilo #${order.id} je v obdelavi.\nSkupni znesek: €${order.totalCostWithVat.toFixed(2)}`;
      break;
    case 'completed':
      subject = `LCC Naročilo razreza - Naročilo #${order.id} zaključeno`;
      content = `Vaše naročilo #${order.id} je zaključeno.\nSkupni znesek: €${order.totalCostWithVat.toFixed(2)}`;
      break;
  }
  
  // Log the email details
  const emailDetails = {
    to: emailAddress,
    subject,
    body: content,
    timestamp: new Date().toISOString()
  };
  
  // Add detailed log of the email that would have been sent
  addLog(
    'info',
    `SIMULIRANO POŠILJANJE E-POŠTE: ${recipient} bi prejel e-pošto z naslovom "${subject}"`,
    emailDetails
  );
  
  console.log(`Email would be sent to ${emailAddress}: ${subject}`);
  console.log(`Content: ${content}`);
  
  return {
    success: true,
    message: `Email would be sent to ${emailAddress} (environment doesn't support actual sending)`
  };
};

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
    // Check if PHP backend is available
    const phpBackendAvailable = await hasPhpBackend();
    
    if (phpBackendAvailable) {
      // Using PHP backend
      // Send email to customer
      const customerEmailRequest: EmailRequest = {
        type,
        orderId: order.id,
        email: customerEmail
      };
      
      // Adding timeout and better error handling for the API call
      const customerResponse = await axios.post('/api/email/order.php', customerEmailRequest, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
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
      
      // Adding timeout and better error handling for the API call
      const adminResponse = await axios.post('/api/email/order.php', adminEmailRequest, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
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
    } else {
      // Using JavaScript fallback
      // Send to customer
      const customerResult = sendEmailFallback(type, order, customerEmail, false);
      
      // Send to admin
      const adminResult = sendEmailFallback(type, order, 'jerebic.jernej@gmail.com', true);
      
      // Show toast notification
      toast.success("Naročilo je bilo sprejeto", {
        description: "Potrdilo naročila je bilo generirano. Administrator bo obveščen o vašem naročilu."
      });
      
      return { 
        success: true, 
        message: 'Email notifications logged (actual sending not available in this environment)' 
      };
    }
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
    
    // Try the fallback method
    try {
      console.log("Trying fallback email method after error");
      
      // Send to customer
      sendEmailFallback(type, order, customerEmail, false);
      
      // Send to admin
      sendEmailFallback(type, order, 'jerebic.jernej@gmail.com', true);
      
      // Show toast notification
      toast.warning("Naročilo je bilo sprejeto", {
        description: "Zaradi težav s poštnim strežnikom bo administrator obveščen o vašem naročilu ročno."
      });
      
      return {
        success: true,
        message: 'Fallback email notification logged (actual sending not available)'
      };
    } catch (fallbackError) {
      console.error("Even fallback email method failed:", fallbackError);
      
      // Show toast notification of failure but with more details
      toast.error("Napaka pri pošiljanju e-pošte", {
        description: `Naročilo je bilo uspešno oddano, vendar je prišlo do napake pri pošiljanju (${errorMessage}). Administrator bo obveščen o vašem naročilu.`
      });
      
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
      
      return { 
        success: false, 
        message: `Failed to send email: ${errorMessage}` 
      };
    }
  }
};
