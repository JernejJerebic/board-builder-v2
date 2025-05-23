import { Order, Product, Customer } from '@/types';
import { addLog } from '@/services/localStorage';
import { toast } from 'sonner';
import emailjs from 'emailjs-com';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_iqv96th';
const EMAILJS_TEMPLATE_ID = 'template_2pd5z1i';
const EMAILJS_USER_ID = 'QSWNF6DxGrTMaC3CI';

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
    if (!EMAILJS_USER_ID || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
      throw new Error('EmailJS is not properly configured');
    }
    
    // Prepare template parameters
    const templateParams = {
      to_email: to,
      title: subject,
      message: body,
      from_name: 'LCC Naročilo razreza',
      reply_to: 'info@lcc.si',
      html_content: isHtml,
      hideFooter: true
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
 * Creates an HTML table of product details with color visualization
 */
const createProductsTable = (products: Product[]): string => {
  let tableRows = '';
  
  products.forEach((product, index) => {
    const borderInfo = [];
    if (product.borders.top) borderInfo.push('zgoraj');
    if (product.borders.right) borderInfo.push('desno');
    if (product.borders.bottom) borderInfo.push('spodaj');
    if (product.borders.left) borderInfo.push('levo');
    
    const borderText = borderInfo.length > 0 
      ? borderInfo.join(', ') 
      : 'brez';
    
    // Create color display with hex code - fixed to use htmlColor instead of hex
    const colorHex = product.color?.htmlColor || '#CCCCCC';
    const colorName = product.color?.title || 'Barva ni na voljo';
    const colorDisplay = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 20px; height: 20px; background-color: ${colorHex}; border: 1px solid #ddd; border-radius: 3px;"></div>
        <span>${colorName} (${colorHex})</span>
      </div>
    `;
    
    tableRows += `
      <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : '#ffffff'}">
        <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${colorDisplay}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${product.length} × ${product.width} × ${product.thickness} mm</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${product.surfaceArea} m²</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${borderText}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${product.drilling ? 'Da' : 'Ne'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${product.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">€${product.totalPrice.toFixed(2)}</td>
      </tr>
    `;
  });
  
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">#</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Barva</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Dimenzije</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Površina</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Obrobe</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Vrtanje</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Količina</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Cena</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
      <tfoot>
        <tr style="background-color: #f2f2f2; font-weight: bold;">
          <td colspan="7" style="padding: 8px; border: 1px solid #ddd; text-align: right;">Skupaj:</td>
          <td style="padding: 8px; border: 1px solid #ddd;">€${products.reduce((sum, product) => sum + product.totalPrice, 0).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  `;
};

/**
 * Creates a customer information section for emails
 */
const createCustomerInfoSection = (customer: Customer): string => {
  const companyInfo = customer.companyName ? 
    `<p style="margin: 5px 0;"><strong>Podjetje:</strong> ${customer.companyName}</p>` : '';
  
  const vatInfo = customer.vatId ? 
    `<p style="margin: 5px 0;"><strong>ID za DDV:</strong> ${customer.vatId}</p>` : '';
  
  return `
    <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h3 style="margin-top: 0; color: #1D6EC1;">Podatki o stranki</h3>
      <p style="margin: 5px 0;"><strong>Ime in priimek:</strong> ${customer.firstName} ${customer.lastName}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${customer.email || 'Ni podan'}</p>
      <p style="margin: 5px 0;"><strong>Telefon:</strong> ${customer.phone || 'Ni podan'}</p>
      ${companyInfo}
      ${vatInfo}
      <p style="margin: 5px 0;"><strong>Naslov:</strong> ${customer.street}, ${customer.zipCode} ${customer.city}</p>
    </div>
  `;
};

/**
 * Creates an email with appropriate content based on order status
 */
const createEmailContent = (
  type: 'new' | 'progress' | 'completed',
  order: Order,
  customer: Customer,
  isAdmin = false
): { subject: string; body: string } => {
  const recipient = isAdmin ? 'Administrator' : customer.firstName;
  
  // Payment method text
  const getPaymentMethodText = (method: string): string => {
    switch (method) {
      case 'credit_card': return 'Kreditna kartica';
      case 'payment_on_delivery': return 'Plačilo ob dostavi';
      case 'pickup_at_shop': return 'Prevzem v trgovini';
      case 'bank_transfer': return 'Bančno nakazilo';
      default: return method;
    }
  };
  
  // Shipping method text
  const getShippingMethodText = (method: string): string => {
    return method === 'pickup' ? 'Prevzem v trgovini' : 'Dostava';
  };
  
  // Products table
  const productsTable = createProductsTable(order.products);
  
  // Customer info section
  const customerInfoSection = createCustomerInfoSection(customer);
  
  // Base HTML structure for all emails
  const baseHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
        <img src="https://www.lcc.si/wp-content/uploads/2020/03/Logo-COREL-Brez-ozadja-2-1024x462-1.png" alt="LCC" style="max-width: 200px; height: auto;">
      </div>
      <h2 style="color: #1D6EC1;">{TITLE}</h2>
      <p>Spoštovani ${recipient},</p>
      <p>{MESSAGE}</p>
      
      ${customerInfoSection}
      
      <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Številka naročila:</strong> #${order.id}</p>
        <p style="margin: 5px 0;"><strong>Datum naročila:</strong> ${new Date(order.orderDate).toLocaleDateString('sl-SI')}</p>
        <p style="margin: 5px 0;"><strong>Način plačila:</strong> ${getPaymentMethodText(order.paymentMethod)}</p>
        <p style="margin: 5px 0;"><strong>Način dostave:</strong> ${getShippingMethodText(order.shippingMethod)}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> {STATUS}</p>
      </div>
      
      <h3 style="margin-top: 20px; margin-bottom: 10px;">Naročeni izdelki</h3>
      ${productsTable}
      
      <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: right;">
        <p style="margin: 5px 0; font-size: 16px;"><strong>Skupni znesek brez DDV:</strong> €${order.totalCostWithoutVat.toFixed(2)}</p>
        <p style="margin: 5px 0; font-size: 18px;"><strong>Skupni znesek z DDV:</strong> €${order.totalCostWithVat.toFixed(2)}</p>
      </div>
      
      <p>Lep pozdrav,<br>Ekipa LCC Naročilo razreza</p>
      <p style="font-size: 14px; color: #666;">Za dodatne informacije nas kontaktirajte na <a href="mailto:info@lcc.si" style="color: #1D6EC1;">info@lcc.si</a> ali po telefonu na +386 7 393 07 00.</p>
    </div>
  `;
  
  let title = '';
  let message = '';
  let status = '';
  let subject = '';
  
  // Customize content based on order type and recipient
  switch (type) {
    case 'new':
      title = 'Novo naročilo';
      subject = 'LCC Naročilo razreza - Novo naročilo';
      message = isAdmin ? 'Prejeli ste novo naročilo.' : 'Zahvaljujemo se vam za vaše naročilo.';
      status = 'Novo naročilo';
      break;
      
    case 'progress':
      title = 'Naročilo v obdelavi';
      subject = 'LCC Naročilo razreza - Naročilo v obdelavi';
      message = 'Vaše naročilo je trenutno v obdelavi.';
      status = 'V obdelavi';
      break;
      
    case 'completed':
      title = 'Naročilo zaključeno';
      subject = 'LCC Naročilo razreza - Naročilo zaključeno';
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
 * Fetch customer data directly from localStorage instead of API
 */
const fetchCustomerData = (customerId: string): Customer | null => {
  try {
    // Get customer directly from localStorage instead of API
    const customers = JSON.parse(localStorage.getItem('woodboard_customers') || '[]');
    const customer = customers.find((c: Customer) => c.id === customerId);
    return customer || null;
  } catch (error) {
    console.error('Error fetching customer data:', error);
    addLog('error', 'Error fetching customer data', { 
      customerId, 
      error: error instanceof Error ? error.message : String(error) 
    });
    return null;
  }
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
  
  // Use only standard console methods directly without dynamic access
  console.log(`[${requestId}] START: Sending ${type} order email for order ${order.id}`);
  console.log(`[${requestId}] RECIPIENTS: Customer: ${customerEmail}, Admin: info@lcc.si`);
  
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
    // Get customer data from localStorage
    let customer: Customer | null = fetchCustomerData(order.customerId);
    
    // If customer data can't be fetched, create a minimal customer object
    if (!customer) {
      console.warn(`[${requestId}] WARNING: Could not fetch customer data, using minimal customer object`);
      
      // Create minimal customer object from available information
      customer = {
        id: order.customerId,
        firstName: 'Cenjeni',
        lastName: 'Kupec',
        email: customerEmail,
        street: '',
        city: '',
        zipCode: '',
        totalPurchases: 0
      };
      
      addLog(
        'warning',
        `Ni bilo mogoče pridobiti podatkov o stranki za naročilo #${order.id}`,
        { 
          requestId,
          customerId: order.customerId
        }
      );
    }
    
    // Check if EmailJS is configured
    if (!EMAILJS_USER_ID || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
      throw new Error('EmailJS is not properly configured');
    }
    
    // Create and send customer email
    console.log(`[${requestId}] CUSTOMER: Creating email content for ${customerEmail}`);
    const customerEmailContent = createEmailContent(type, order, customer, false);
    
    console.log(`[${requestId}] CUSTOMER: Sending email to ${customerEmail}`);
    const customerResult = await sendEmail(
      customerEmail,
      customerEmailContent.subject,
      customerEmailContent.body,
      true // Always send as HTML
    );
    
    // Create and send admin email
    const adminEmail = 'info@lcc.si';
    console.log(`[${requestId}] ADMIN: Creating email content for ${adminEmail}`);
    const adminEmailContent = createEmailContent(type, order, customer, true);
    
    console.log(`[${requestId}] ADMIN: Sending email to ${adminEmail}`);
    const adminResult = await sendEmail(
      adminEmail,
      adminEmailContent.subject,
      adminEmailContent.body,
      true // Always send as HTML
    );
    
    // Log detailed results - use direct console methods instead of dynamic access
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
        adminEmail: 'info@lcc.si',
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
