
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

    initBraintree();

    // Clean up on unmount
    return () => {
      teardownBraintree().catch(err => {
        console.error('Error tearing down Braintree:', err);
      });
    };
  }, [onPaymentMethodReady, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!isInitialized) {
      setError('Payment system not initialized');
      return;
    }
    
    try {
      setIsLoading(true);
      const paymentMethodNonce = await getPaymentMethodNonce();
      onPaymentMethodReceived(paymentMethodNonce);
    } catch (err) {
      console.error('Failed to process payment:', err);
      setError('Payment validation failed. Please check your card details and try again.');
      toast.error('Napaka pri preverjanju plačilnih podatkov');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form id="braintree-form" onSubmit={handleSubmit}>
        <div className="p-4 border border-gray-200 rounded-md space-y-4">
          <h3 className="font-medium">Podatki o kreditni kartici</h3>
          
          {isLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Inicializacija plačilnega sistema...</span>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2 mt-2" 
                onClick={handleRetry}
              >
                Poskusi ponovno
              </Button>
            </div>
          )}
          
          <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
            <div className="mb-4">
              <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
                Številka kartice
              </label>
              <div id="card-number" className="h-10 p-2 border border-gray-300 rounded-md bg-white"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Datum veljavnosti
                </label>
                <div id="expiration-date" className="h-10 p-2 border border-gray-300 rounded-md bg-white"></div>
              </div>
              
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <div id="cvv" className="h-10 p-2 border border-gray-300 rounded-md bg-white"></div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>Vaši podatki o plačilu so varni in šifrirani. Nikoli ne shranjujemo podatkov o vaši kartici.</p>
            {isInitialized && (
              <p className="text-green-600 mt-2">Plačilni sistem je pripravljen</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isInitialized || isLoading || isSubmitting}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Preverjanje podatkov
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Obdelava plačila
              </>
            ) : (
              'Potrdi plačilne podatke'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BraintreeForm;
