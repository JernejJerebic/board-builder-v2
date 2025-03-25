
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
      html_content: isHtml, // Add a flag to indicate HTML content
      hideFooter: true // Add parameter to hide EmailJS footer
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
    
    // Create color display with hex code
    const colorHex = product.colorHtml || '#CCCCCC';
    const colorName = product.colorTitle || 'Barva ni na voljo';
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
 * Create HTML table with customer info
 */
const createCustomerInfoTable = (customer: Customer): string => {
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
      <tr style="background-color: #f2f2f2;">
        <th colspan="2" style="padding: 8px; border: 1px solid #ddd; text-align: left;">Podatki o stranki</th>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Ime in priimek:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${customer.firstName} ${customer.lastName}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>E-pošta:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${customer.email}" style="color: #1D6EC1;">${customer.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Telefon:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;"><a href="tel:${customer.phone}" style="color: #1D6EC1;">${customer.phone}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Naslov:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${customer.street}, ${customer.zipCode} ${customer.city}</td>
      </tr>
      ${customer.companyName ? `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Podjetje:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${customer.companyName}</td>
      </tr>` : ''}
      ${customer.vatId ? `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>ID za DDV:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${customer.vatId}</td>
      </tr>` : ''}
    </table>
  `;
};

/**
 * Create HTML table with payment info
 */
const createPaymentInfoTable = (order: Order): string => {
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

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
      <tr style="background-color: #f2f2f2;">
        <th colspan="2" style="padding: 8px; border: 1px solid #ddd; text-align: left;">Podatki o plačilu</th>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Način plačila:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${getPaymentMethodText(order.paymentMethod)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Način dostave:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${getShippingMethodText(order.shippingMethod)}</td>
      </tr>
      ${order.transactionId ? `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>ID transakcije:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${order.transactionId}</td>
      </tr>` : ''}
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Znesek brez DDV:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">€${order.totalCostWithoutVat.toFixed(2)}</td>
      </tr>
      <tr style="font-weight: bold;">
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Skupni znesek z DDV:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">€${order.totalCostWithVat.toFixed(2)}</td>
      </tr>
    </table>
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
  const recipientName = isAdmin ? 'Administrator' : `${customer.firstName} ${customer.lastName}`;
  
  // Products table
  const productsTable = createProductsTable(order.products);
  
  // Customer info table
  const customerInfoTable = createCustomerInfoTable(customer);
  
  // Payment info table
  const paymentInfoTable = createPaymentInfoTable(order);
  
  // Base HTML structure for all emails
  const baseHtml = `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
        <img src="https://www.lcc.si/wp-content/uploads/2020/03/Logo-COREL-Brez-ozadja-2-1024x462-1.png" alt="LCC" style="max-width: 200px; height: auto;">
      </div>
      <h2 style="color: #1D6EC1;">{TITLE}</h2>
      <p>Spoštovani ${recipientName},</p>
      <p>{MESSAGE}</p>
      <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Številka naročila:</strong> #${order.id}</p>
        <p style="margin: 5px 0;"><strong>Datum naročila:</strong> ${new Date(order.orderDate).toLocaleDateString('sl-SI')}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> {STATUS}</p>
      </div>
      
      <h3 style="margin-top: 20px; margin-bottom: 10px;">Naročeni izdelki</h3>
      ${productsTable}
      
      <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: right;">
        <p style="margin: 5px 0; font-size: 16px;"><strong>Skupni znesek brez DDV:</strong> €${order.totalCostWithoutVat.toFixed(2)}</p>
        <p style="margin: 5px 0; font-size: 18px;"><strong>Skupni znesek z DDV:</strong> €${order.totalCostWithVat.toFixed(2)}</p>
      </div>
      
      ${customerInfoTable}
      ${paymentInfoTable}
      
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
 * Main function to send order-related emails to both customer and admin
 */
export const sendOrderEmail = async (
  type: 'new' | 'progress' | 'completed',
  order: Order,
  customerEmail: string,
  customerData?: Customer
): Promise<{ success: boolean; message?: string }> => {
  const timestamp = new Date().toISOString();
  const requestId = `order_email_${Date.now()}`;
  
  console.log(`[${requestId}] START: Sending ${type} order email for order ${order.id}`);
  console.log(`[${requestId}] RECIPIENTS: Customer: ${customerEmail}, Admin: info@lcc.si`);
  
  // Create a default customer if not provided
  const customer: Customer = customerData || {
    id: 'temp',
    firstName: customerEmail.split('@')[0],
    lastName: '',
    email: customerEmail,
    phone: '',
    street: '',
    city: '',
    zipCode: ''
  };
  
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
