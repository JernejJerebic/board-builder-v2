
import * as braintree from 'braintree-web';
import { addLog } from '@/services/localStorage';

interface BraintreeConfig {
  merchantId: string;
  publicKey: string;
  privateKey: string;
}

// Braintree credentials - replace these with your actual Braintree credentials
const BRAINTREE_CONFIG: BraintreeConfig = {
  merchantId: 'pszgyg5dgnw997bx', // Replace with your actual merchant ID
  publicKey: 'df6b3f98fhfj57mh', // Replace with your actual public key
  privateKey: 'faedbfa95f2bf78f2ba4c1cc444dc63b', // This should only be on server side in production
};

// Initialize Braintree client
let braintreeClient: braintree.Client | null = null;
let hostedFieldsInstance: braintree.HostedFields | null = null;

/**
 * Initialize the Braintree client
 */
export const initBraintreeClient = async (): Promise<braintree.Client> => {
  if (braintreeClient) {
    return braintreeClient;
  }

  try {
    addLog('info', 'Initializing Braintree client', { timestamp: new Date().toISOString() });

    // In a real app, you'd fetch a client token from your server
    braintreeClient = await braintree.client.create({
      authorization: BRAINTREE_CONFIG.publicKey
    });

    return braintreeClient;
  } catch (error) {
    console.error('Error initializing Braintree client:', error);
    addLog('error', 'Error initializing Braintree client', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
};

/**
 * Initialize Braintree hosted fields
 */
export const initBraintreeHostedFields = async (): Promise<braintree.HostedFields> => {
  if (hostedFieldsInstance) {
    return hostedFieldsInstance;
  }

  try {
    const client = await initBraintreeClient();
    
    addLog('info', 'Initializing Braintree hosted fields', { timestamp: new Date().toISOString() });
    
    hostedFieldsInstance = await braintree.hostedFields.create({
      client,
      styles: {
        'input': {
          'font-size': '16px',
          'color': '#333',
          'font-family': 'Arial, sans-serif'
        },
        'input.invalid': {
          'color': '#e53e3e'
        },
        'input.valid': {
          'color': '#38a169'
        }
      },
      fields: {
        number: {
          selector: '#card-number',
          placeholder: '4111 1111 1111 1111'
        },
        cvv: {
          selector: '#cvv',
          placeholder: '123'
        },
        expirationDate: {
          selector: '#expiration-date',
          placeholder: 'MM/YY'
        }
      }
    });
    
    return hostedFieldsInstance;
  } catch (error) {
    console.error('Error initializing Braintree hosted fields:', error);
    addLog('error', 'Error initializing Braintree hosted fields', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
};

/**
 * Get a payment method nonce from hosted fields
 */
export const getPaymentMethodNonce = async (): Promise<string> => {
  try {
    if (!hostedFieldsInstance) {
      await initBraintreeHostedFields();
    }
    
    if (!hostedFieldsInstance) {
      throw new Error('Hosted fields not initialized');
    }
    
    const payload = await hostedFieldsInstance.tokenize();
    return payload.nonce;
  } catch (error) {
    console.error('Error getting payment method nonce:', error);
    addLog('error', 'Error getting payment method nonce', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
};

/**
 * Process a payment using Braintree
 */
export const processBraintreePayment = async (
  paymentMethodNonce: string, 
  amount: number,
  orderId: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  try {
    console.log(`Processing payment with nonce: ${paymentMethodNonce}, amount: ${amount}`);
    
    addLog(
      'info',
      `Starting payment processing for order #${orderId}`,
      { 
        amount,
        orderId,
        paymentMethodNonce: `${paymentMethodNonce.substring(0, 10)}...`,
        timestamp: new Date().toISOString()
      }
    );
    
    // In a production environment, this should be a server-side call
    // You should NOT process payments directly from the client
    // const response = await fetch('/api/payment/process', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ paymentMethodNonce, amount, orderId })
    // });
    // const result = await response.json();
    
    // For demo purposes, we'll simulate a successful transaction
    // IMPORTANT: Replace this with actual server-side payment processing in production
    const transactionId = `bt-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    
    addLog(
      'info',
      `Payment processed successfully for order #${orderId}`,
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
      `Error processing payment for order #${orderId}`,
      { error: error instanceof Error ? error.message : String(error) }
    );
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown payment processing error'
    };
  }
};

/**
 * Clean up Braintree resources
 */
export const teardownBraintree = async (): Promise<void> => {
  try {
    if (hostedFieldsInstance) {
      await hostedFieldsInstance.teardown();
      hostedFieldsInstance = null;
    }
    braintreeClient = null;
  } catch (error) {
    console.error('Error tearing down Braintree:', error);
  }
};
