
import { addLog } from '@/services/localStorage';

interface BraintreeConfig {
  merchantId: string;
  publicKey: string;
  privateKey: string;
}

// Webhook URL for Braintree notifications - in a real app, this would be your server endpoint
const BRAINTREE_WEBHOOK_URL = '/api/webhooks/braintree';

const BRAINTREE_CONFIG: BraintreeConfig = {
  merchantId: 'pszgyg5dgnw997bx',
  publicKey: 'df6b3f98fhfj57mh',
  privateKey: 'faedbfa95f2bf78f2ba4c1cc444dc63b',
};

export const getBraintreeConfig = (): BraintreeConfig => {
  return BRAINTREE_CONFIG;
};

export const generateClientToken = async (): Promise<string> => {
  // In a real app, this would be a server request to generate a client token
  // For demo purposes, we'll simulate this and provide detailed logging
  console.log('Generating Braintree client token with:', BRAINTREE_CONFIG.merchantId);
  
  addLog(
    'info',
    'Začetek generiranja Braintree žetona',
    { 
      merchantId: BRAINTREE_CONFIG.merchantId,
      timestamp: new Date().toISOString()
    }
  );
  
  // Simulate token generation
  const timestamp = new Date().getTime();
  const simulatedToken = `braintree-client-token-${timestamp}`;
  
  // Wait for 500ms to simulate network request
  await new Promise(resolve => setTimeout(resolve, 500));
  
  addLog(
    'info',
    'Braintree žeton uspešno generiran',
    { 
      tokenPreview: `${simulatedToken.substring(0, 10)}...`,
      timestamp: new Date().toISOString()
    }
  );
  
  return simulatedToken;
};

export const processBraintreePayment = async (
  paymentMethodNonce: string, 
  amount: number,
  orderId: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  // In a real app, this would be a server request to process payment
  // For demo purposes, we'll simulate this with comprehensive logging
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
  
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Always succeed in this demo
  const transactionId = `bt-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  
  // Log the successful transaction
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
  
  // Simulate a webhook call to your backend (in a real app, Braintree would call your webhook)
  simulateWebhookNotification(transactionId, amount, orderId);
  
  return {
    success: true,
    transactionId,
  };
};

// Simulate Braintree webhook notification
const simulateWebhookNotification = async (
  transactionId: string, 
  amount: number,
  orderId: string
) => {
  console.log(`Simulating Braintree webhook notification for transaction: ${transactionId}`);
  
  // In a real app, Braintree would call your webhook with transaction details
  // Here we're just logging it for demonstration purposes
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
  
  // Log the webhook notification
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
