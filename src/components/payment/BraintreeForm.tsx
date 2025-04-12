import React, { useEffect, useState } from 'react';
import { initBraintreeHostedFields, getPaymentMethodNonce, teardownBraintree } from '@/services/braintree';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface BraintreeFormProps {
  onPaymentMethodReady: (isReady: boolean) => void;
  onPaymentMethodReceived: (paymentMethodNonce: string) => void;
  isSubmitting?: boolean;
}

const BraintreeForm: React.FC<BraintreeFormProps> = ({ 
  onPaymentMethodReady, 
  onPaymentMethodReceived,
  isSubmitting = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const initBraintree = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Initializing Braintree hosted fields...');
        await initBraintreeHostedFields();
        console.log('Braintree hosted fields initialized successfully');
        
        setIsInitialized(true);
        onPaymentMethodReady(true);
      } catch (err) {
        console.error('Failed to initialize Braintree:', err);
        setError('Failed to initialize payment system. Please try again later.');
        onPaymentMethodReady(false);
        toast.error('Napaka pri inicializaciji plačilnega sistema');
      } finally {
        setIsLoading(false);
      }
    };

    // Disabling Braintree initialization - credit card payments are disabled
    // initBraintree();
    
    // Inform parent component that payment method is not ready
    onPaymentMethodReady(false);

    // Return a no-op cleanup function
    return () => {
      // No Braintree teardown needed since it's not initialized
    };
  }, [onPaymentMethodReady, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Credit card payments are disabled
    setError('Credit card payments are currently unavailable. Please choose another payment method.');
    toast.error('Plačila s kreditno kartico trenutno niso na voljo.');
  };

  return (
    <div className="space-y-4">
      <form id="braintree-form" onSubmit={handleSubmit}>
        <div className="p-4 border border-gray-200 rounded-md space-y-4">
          <h3 className="font-medium">Podatki o kreditni kartici</h3>
          
          <div className="p-3 bg-amber-50 text-amber-700 rounded-md text-sm">
            Plačila s kreditno kartico trenutno niso na voljo. Prosimo, izberite drug način plačila.
          </div>
          
          {/* Hidden fields to keep compatibility */}
          <div style={{ display: 'none' }}>
            <div id="card-number"></div>
            <div id="expiration-date"></div>
            <div id="cvv"></div>
          </div>
          
          <Button 
            type="button" 
            className="w-full" 
            variant="outline"
            onClick={() => onPaymentMethodReceived('disabled')}
          >
            Izberi drug način plačila
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BraintreeForm;
