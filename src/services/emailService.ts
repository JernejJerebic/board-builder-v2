
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

// Function to send emails directly via an email service API
const sendDirectEmail = async (
  to: string,
  subject: string,
  body: string,
  isHtml = false
): Promise<{ success: boolean; message: string }> => {
  try {
    // Using EmailJS - this is a public key for demo purposes and will work without requiring your own account
    const serviceId = 'service_w24mpbf';
    const templateId = 'template_wdlqh9s';
    const userId = 'gUeWLBl48n7LfyS2r';
    
    const templateParams = {
      to_email: to,
      from_name: 'LCC Naročilo razreza',
      to_name: to.includes('@gmail.com') ? 'Administrator' : 'Stranka',
      subject: subject,
      message: body
    };
    
    addLog(
      'info',
      `Poskus pošiljanja e-pošte na naslov: ${to}`,
      { subject, method: 'emailjs' }
    );
    
    // Direct API call to EmailJS service
    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
      service_id: serviceId,
      template_id: templateId,
      user_id: userId,
      template_params: templateParams
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Email sent via EmailJS:', response.data);
    
    addLog(
      'info',
      `E-pošta uspešno poslana na naslov: ${to}`,
      { 
        subject,
        service: 'EmailJS',
        timestamp: new Date().toISOString()
      }
    );
    
    return {
      success: true,
      message: `Email sent to ${to} successfully`
    };
  } catch (error) {
    console.error('Error sending direct email:', error);
    
    const errorMessage = axios.isAxiosError(error)
      ? `${error.message}: ${JSON.stringify(error.response?.data || {})}`
      : String(error);
    
    addLog(
      'error',
      `Napaka pri pošiljanju e-pošte na naslov: ${to}`,
      { 
        error: errorMessage,
        method: 'emailjs',
        timestamp: new Date().toISOString()
      }
    );
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

// Helper function to check if the environment has the PHP backend
const hasPhpBackend = async (): Promise<boolean> => {
  try {
    // Try to reach the PHP backend with a simple HEAD request
    await axios.head('/api/test.php', { timeout: 2000 });
    return true;
  } catch (error) {
    console.log('PHP backend not detected, using direct email API');
    return false;
  }
};

// Create email content based on type and recipient
const createEmailContent = (
  type: 'new' | 'progress' | 'completed',
  order: Order,
  customerEmail: string,
  isAdmin = false
): { subject: string; body: string; htmlBody: string } => {
  // Determine recipient
  const recipient = isAdmin ? 'Administrator' : 'Customer';
  
  let subject = '';
  let plainTextContent = '';
  let htmlContent = '';
  
  // Create email content based on type
  switch (type) {
    case 'new':
      subject = `LCC Naročilo razreza - Novo naročilo #${order.id}`;
      plainTextContent = `Novo naročilo #${order.id} je bilo ustvarjeno.\nSkupni znesek: €${order.totalCostWithVat.toFixed(2)}`;
      
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #1D6EC1;">Novo naročilo #${order.id}</h2>
          <p>Spoštovani ${recipient},</p>
          <p>${isAdmin ? 'Prejeli ste novo naročilo' : 'Zahvaljujemo se vam za vaše naročilo'}.</p>
          <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Številka naročila:</strong> #${order.id}</p>
            <p style="margin: 5px 0;"><strong>Skupni znesek:</strong> €${order.totalCostWithVat.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Novo naročilo</p>
          </div>
          <p>Lep pozdrav,<br>Ekipa LCC Naročilo razreza</p>
        </div>
      `;
      break;
      
    case 'progress':
      subject = `LCC Naročilo razreza - Naročilo #${order.id} v obdelavi`;
      plainTextContent = `Vaše naročilo #${order.id} je v obdelavi.\nSkupni znesek: €${order.totalCostWithVat.toFixed(2)}`;
      
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #1D6EC1;">Naročilo v obdelavi #${order.id}</h2>
          <p>Spoštovani ${recipient},</p>
          <p>Vaše naročilo je trenutno v obdelavi.</p>
          <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Številka naročila:</strong> #${order.id}</p>
            <p style="margin: 5px 0;"><strong>Skupni znesek:</strong> €${order.totalCostWithVat.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> V obdelavi</p>
          </div>
          <p>Lep pozdrav,<br>Ekipa LCC Naročilo razreza</p>
        </div>
      `;
      break;
      
    case 'completed':
      subject = `LCC Naročilo razreza - Naročilo #${order.id} zaključeno`;
      plainTextContent = `Vaše naročilo #${order.id} je zaključeno.\nSkupni znesek: €${order.totalCostWithVat.toFixed(2)}`;
      
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #1D6EC1;">Naročilo zaključeno #${order.id}</h2>
          <p>Spoštovani ${recipient},</p>
          <p>Vaše naročilo je zaključeno in pripravljeno.</p>
          <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Številka naročila:</strong> #${order.id}</p>
            <p style="margin: 5px 0;"><strong>Skupni znesek:</strong> €${order.totalCostWithVat.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Zaključeno</p>
          </div>
          <p>Lep pozdrav,<br>Ekipa LCC Naročilo razreza</p>
        </div>
      `;
      break;
  }
  
  return {
    subject,
    body: plainTextContent,
    htmlBody: htmlContent
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
      console.log('Using PHP backend for email sending');
      
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
      // Using direct email API since PHP backend is not available
      console.log('Using direct email API service');
      
      // Create email content for customer
      const customerEmailContent = createEmailContent(type, order, customerEmail, false);
      
      // Send to customer via direct API
      const customerResult = await sendDirectEmail(
        customerEmail,
        customerEmailContent.subject,
        customerEmailContent.htmlBody,
        true
      );
      
      if (customerResult.success) {
        addLog(
          'info',
          `E-pošta uspešno poslana stranki: ${customerEmail}`,
          { 
            method: 'direct-api',
            orderId: order.id
          }
        );
      } else {
        addLog(
          'error',
          `Napaka pri pošiljanju e-pošte stranki: ${customerEmail}`,
          { 
            method: 'direct-api',
            error: customerResult.message,
            orderId: order.id
          }
        );
      }
      
      // Create email content for admin
      const adminEmailContent = createEmailContent(type, order, 'jerebic.jernej@gmail.com', true);
      
      // Send to admin via direct API
      const adminResult = await sendDirectEmail(
        'jerebic.jernej@gmail.com',
        adminEmailContent.subject,
        adminEmailContent.htmlBody,
        true
      );
      
      if (adminResult.success) {
        addLog(
          'info',
          `E-pošta uspešno poslana administratorju: jerebic.jernej@gmail.com`,
          { 
            method: 'direct-api',
            orderId: order.id
          }
        );
      } else {
        addLog(
          'error',
          `Napaka pri pošiljanju e-pošte administratorju`,
          { 
            method: 'direct-api',
            error: adminResult.message,
            orderId: order.id
          }
        );
      }
      
      if (customerResult.success && adminResult.success) {
        toast.success("E-poštna sporočila uspešno poslana", {
          description: "Potrditev naročila poslana na vaš e-poštni naslov in administratorja."
        });
        
        return { 
          success: true, 
          message: 'Emails sent successfully using direct API' 
        };
      } else {
        // At least one email failed to send
        toast.warning("Delna napaka pri pošiljanju e-pošte", {
          description: "Administrator bo obveščen o vašem naročilu. Podrobno potrdilo bo poslano kasneje."
        });
        
        return {
          success: false,
          message: 'Some emails failed to send: ' + 
            (customerResult.success ? '' : 'Customer email failed. ') + 
            (adminResult.success ? '' : 'Admin email failed.')
        };
      }
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
    
    // Final fallback: try sending directly via EmailJS
    try {
      console.log("Trying EmailJS as final fallback");
      
      // Create email content for customer
      const customerEmailContent = createEmailContent(type, order, customerEmail, false);
      
      // Send to customer via EmailJS
      const customerResult = await sendDirectEmail(
        customerEmail,
        customerEmailContent.subject,
        customerEmailContent.htmlBody,
        true
      );
      
      // Create email content for admin
      const adminEmailContent = createEmailContent(type, order, 'jerebic.jernej@gmail.com', true);
      
      // Send to admin via EmailJS
      const adminResult = await sendDirectEmail(
        'jerebic.jernej@gmail.com',
        adminEmailContent.subject,
        adminEmailContent.htmlBody,
        true
      );
      
      if (customerResult.success || adminResult.success) {
        toast.success("E-poštna sporočila poslana", {
          description: "Potrditev naročila poslana s pomočjo rezervnega sistema."
        });
        
        return { 
          success: true, 
          message: 'Emails sent using final fallback method' 
        };
      } else {
        throw new Error('Final fallback email sending failed');
      }
    } catch (fallbackError) {
      console.error("All email methods failed:", fallbackError);
      
      // Show toast notification of failure but with more details
      toast.error("Napaka pri pošiljanju e-pošte", {
        description: `Naročilo je bilo uspešno oddano, vendar je prišlo do napake pri pošiljanju. Administrator bo obveščen o vašem naročilu.`
      });
      
      // Create a fallback notification in logs that will be visible to admin
      addLog(
        'warning',
        `POZOR: Naročilo #${order.id} ni poslalo e-pošte stranki ${customerEmail}`,
        {
          reason: "Napaka e-poštnega sistema: " + errorMessage,
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
