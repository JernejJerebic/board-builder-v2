
import * as braintree from 'braintree-web';
import { addLog } from '@/services/localStorage';
import axios from 'axios';

// Braintree client instances
let braintreeClient: braintree.Client | null = null;
let hostedFieldsInstance: braintree.HostedFields | null = null;

// Base API URL - ensure this matches your server configuration
const API_BASE_URL = '/api';

/**
 * Get a client token from the server
 */
export const getClientToken = async (): Promise<string> => {
  try {
    // Add a timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await axios.get(`${API_BASE_URL}/braintree/token?_=${timestamp}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Token response:', response);
    
    if (!response.data || !response.data.clientToken) {
      console.error('Invalid response from token endpoint:', response.data);
      throw new Error('Invalid response from server');
    }
    
    addLog('info', 'Successfully fetched Braintree client token', { 
      timestamp: new Date().toISOString() 
    });
    
    return response.data.clientToken;
  } catch (error) {
    console.error('Error getting client token:', error);
    addLog('error', 'Error getting Braintree client token', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
};

/**
 * Initialize the Braintree client
 */
export const initBraintreeClient = async (): Promise<braintree.Client> => {
  if (braintreeClient) {
    return braintreeClient;
  }

  try {
    addLog('info', 'Initializing Braintree client', { timestamp: new Date().toISOString() });

    // Get authorization from server
    const authorization = await getClientToken();
    console.log('Received authorization token:', authorization.substring(0, 20) + '...');

    braintreeClient = await braintree.client.create({
      authorization
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
    addLog('info', 'Payment method nonce generated', { timestamp: new Date().toISOString() });
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
    
    const response = await axios.post(`${API_BASE_URL}/braintree/process`, {
      paymentMethodNonce,
      amount,
      orderId
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Payment response:', response);
    
    addLog(
      'info',
      `Payment processed successfully for order #${orderId}`,
      { 
        transactionId: response.data.transactionId,
        amount,
        orderId,
        timestamp: new Date().toISOString()
      }
    );
    
    return {
      success: true,
      transactionId: response.data.transactionId,
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    
    let errorMessage = 'Unknown payment processing error';
    
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.error || 'Payment processing failed';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    addLog(
      'error',
      `Error processing payment for order #${orderId}`,
      { error: errorMessage }
    );
    
    return {
      success: false,
      error: errorMessage
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
