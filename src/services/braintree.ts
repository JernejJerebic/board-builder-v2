
interface BraintreeConfig {
  merchantId: string;
  publicKey: string;
  privateKey: string;
}

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
  // For demo purposes, we'll simulate this
  console.log('Generating Braintree client token with:', BRAINTREE_CONFIG.merchantId);
  
  // Simulate token generation
  const timestamp = new Date().getTime();
  const simulatedToken = `braintree-client-token-${timestamp}`;
  
  // Wait for 500ms to simulate network request
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return simulatedToken;
};

export const processBraintreePayment = async (
  paymentMethodNonce: string, 
  amount: number
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  // In a real app, this would be a server request to process payment
  // For demo purposes, we'll simulate this
  console.log(`Processing payment with nonce: ${paymentMethodNonce}, amount: ${amount}`);
  
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Always succeed in this demo
  const transactionId = `bt-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  
  return {
    success: true,
    transactionId,
  };
};
