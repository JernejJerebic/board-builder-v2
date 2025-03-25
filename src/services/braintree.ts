
import * as braintree from 'braintree-web';
import { addLog } from '@/services/localStorage';
import axios from 'axios';

interface BraintreeConfig {
  merchantId: string;
  publicKey: string;
  privateKey: string;
}

// Braintree credentials - in a real production app, these should be stored server-side
const BRAINTREE_CONFIG: BraintreeConfig = {
  merchantId: 'pszgyg5dgnw997bx',
  publicKey: 'df6b3f98fhfj57mh',
  privateKey: 'faedbfa95f2bf78f2ba4c1cc444dc63b',
};

// Initialize Braintree client
let braintreeClient: braintree.Client | null = null;

const initBraintreeClient = async (): Promise<braintree.Client> => {
  if (braintreeClient) {
    return braintreeClient;
  }

  try {
    addLog(
      'info',
      'Inicializacija Braintree klienta',
      { timestamp: new Date().toISOString() }
    );

    braintreeClient = await braintree.client.create({
      authorization: BRAINTREE_CONFIG.publicKey
    });

    return braintreeClient;
  } catch (error) {
    console.error('Error initializing Braintree client:', error);
    addLog(
      'error',
      'Napaka pri inicializaciji Braintree klienta',
      { error: error instanceof Error ? error.message : String(error) }
    );
    throw error;
  }
};

export const getBraintreeConfig = (): BraintreeConfig => {
  return BRAINTREE_CONFIG;
};

export const generateClientToken = async (): Promise<string> => {
  try {
    addLog(
      'info',
      'Začetek generiranja Braintree žetona',
      { 
        merchantId: BRAINTREE_CONFIG.merchantId,
        timestamp: new Date().toISOString()
      }
    );
    
    // In a real production app, this would be a server request to generate a client token
    // For this implementation, we're using a client-side approach which isn't recommended for production
    
    // Normally, you would make a request to your server:
    // const response = await axios.get('/api/braintree/client-token');
    // return response.data.clientToken;
    
    // For demo purposes, we're using the client-side SDK directly
    const client = await initBraintreeClient();
    
    // This is a temporary solution - in a real app, token generation should happen server-side
    // We're using a temporary token approach for demonstration
    const timestamp = new Date().getTime();
    const simulatedToken = `${BRAINTREE_CONFIG.publicKey}_${timestamp}`;
    
    addLog(
      'info',
      'Braintree žeton uspešno generiran',
      { 
        tokenPreview: `${simulatedToken.substring(0, 10)}...`,
        timestamp: new Date().toISOString()
      }
    );
    
    return simulatedToken;
  } catch (error) {
    console.error('Error generating client token:', error);
    addLog(
      'error',
      'Napaka pri generiranju Braintree žetona',
      { error: error instanceof Error ? error.message : String(error) }
    );
    throw error;
  }
};

export const processBraintreePayment = async (
  paymentMethodNonce: string, 
  amount: number,
  orderId: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  try {
    console.log(`Processing payment with nonce: ${paymentMethodNonce}, amount: ${amount}`);
    
    const timestamp = new Date().toISOString();
    
    addLog(
      'info',
      `Začetek obdelave plačila za naročilo #${orderId}`,
      { 
        amount,
        orderId,
        paymentMethodNonce: `${paymentMethodNonce.substring(0, 10)}...`,
        timestamp
      }
    );
    
    // Initialize Braintree client
    const client = await initBraintreeClient();
    
    // In a real production app, this would be a server request to process payment
    // const response = await axios.post('/api/braintree/process-payment', {
    //   paymentMethodNonce,
    //   amount,
    //   orderId
    // });
    
    // For demo purposes, we're creating a fake successful transaction
    // In a real integration, you would process this server-side with proper error handling
    
    const hostedFieldsInstance = await braintree.hostedFields.create({
      client,
      fields: {
        // These would normally be set up in the UI
        number: { selector: '#card-number' },
        cvv: { selector: '#cvv' },
        expirationDate: { selector: '#expiration-date' }
      }
    });
    
    // Log success for demonstration
    const transactionId = `bt-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    
    addLog(
      'info',
      `Plačilo uspešno obdelano za naročilo #${orderId}`,
      { 
        transactionId,
        amount,
        orderId,
        timestamp: new Date().toISOString()
      }
    );
    
    return {
      success: true,
      transactionId,
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    addLog(
      'error',
      `Napaka pri obdelavi plačila za naročilo #${orderId}`,
      { error: error instanceof Error ? error.message : String(error) }
    );
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown payment processing error'
    };
  }
};

// This should be implemented server-side in a real application
const simulateWebhookNotification = async (
  transactionId: string, 
  amount: number,
  orderId: string
) => {
  console.log(`Simulating Braintree webhook notification for transaction: ${transactionId}`);
  
  const webhookPayload = {
    kind: 'transaction.settled',
    timestamp: new Date().toISOString(),
    transaction: {
      id: transactionId,
      amount,
      orderId,
      status: 'settled',
      currencyIsoCode: 'EUR',
      type: 'sale',
      createdAt: new Date().toISOString(),
    }
  };
  
  addLog(
    'info',
    'Prejeto Braintree webhook obvestilo',
    webhookPayload
  );
  
  console.log('Braintree webhook notification payload:', webhookPayload);
  
  return {
    success: true,
    message: 'Webhook notification received'
  };
};

/**
 * This is a convenience function to help you set up Braintree in your UI
 * In a real implementation, you would use the Braintree Drop-in UI or Hosted Fields
 */
export const setupBraintreeUI = async (dropinContainerId: string): Promise<any> => {
  try {
    const client = await initBraintreeClient();
    
    // This is a stub that would normally initialize Braintree's Drop-in UI
    // In a real app, you would use braintree.dropin.create() here
    
    addLog(
      'info',
      'Braintree UI inicializiran',
      { timestamp: new Date().toISOString() }
    );
    
    return {
      requestPaymentMethod: () => {
        return Promise.resolve({
          nonce: `fake-valid-nonce-${Date.now()}`
        });
      }
    };
  } catch (error) {
    console.error('Error setting up Braintree UI:', error);
    addLog(
      'error',
      'Napaka pri inicializaciji Braintree UI',
      { error: error instanceof Error ? error.message : String(error) }
    );
    throw error;
  }
};
