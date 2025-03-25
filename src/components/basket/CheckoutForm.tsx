import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBasket } from '@/context/BasketContext';
import { createOrder, createCustomer, findCustomerByEmail, updateOrder } from '@/services/api';
import { sendOrderEmail } from '@/services/emailService';
import { processBraintreePayment } from '@/services/braintree';
import { Button } from '@/components/ui/button';
import { addLog } from '@/services/localStorage';
import BraintreeForm from '@/components/payment/BraintreeForm';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { CreditCard, Truck, Store, Building, Loader2 } from 'lucide-react';
import EmailNotice from '@/components/EmailNotice';

interface CheckoutFormProps {
  onCancel: () => void;
}

const formSchema = z.object({
  firstName: z.string().min(2, 'Ime je obvezno'),
  lastName: z.string().min(2, 'Priimek je obvezen'),
  companyName: z.string().optional(),
  vatId: z.string().optional(),
  street: z.string().min(3, 'Naslov je obvezen'),
  city: z.string().min(2, 'Mesto je obvezno'),
  zipCode: z.string(),
  email: z.string().email('Neveljaven e-poštni naslov'),
  phone: z.string().min(6, 'Telefonska številka je obvezna'),
  paymentMethod: z.enum(['credit_card', 'payment_on_delivery', 'pickup_at_shop', 'bank_transfer']),
});

type FormValues = z.infer<typeof formSchema>;

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onCancel }) => {
  const { items, calculateTotal, clearBasket } = useBasket();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethodReady, setPaymentMethodReady] = useState(false);
  const [paymentMethodNonce, setPaymentMethodNonce] = useState<string | null>(null);
  const [existingCustomer, setExistingCustomer] = useState<{ id: string; name: string } | null>(null);
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      companyName: '',
      vatId: '',
      street: '',
      city: '',
      zipCode: '',
      email: '',
      phone: '',
      paymentMethod: 'credit_card',
    },
  });
  
  const paymentMethod = form.watch('paymentMethod');
  const email = form.watch('email');
  
  useEffect(() => {
    const checkExistingCustomer = async () => {
      if (email && email.includes('@') && email.includes('.')) {
        try {
          const customer = await findCustomerByEmail(email);
          if (customer) {
            setExistingCustomer({
              id: customer.id,
              name: `${customer.firstName} ${customer.lastName}`
            });
            
            form.setValue('firstName', customer.firstName);
            form.setValue('lastName', customer.lastName);
            form.setValue('companyName', customer.companyName || '');
            form.setValue('vatId', customer.vatId || '');
            form.setValue('street', customer.street);
            form.setValue('city', customer.city);
            form.setValue('zipCode', customer.zipCode);
            form.setValue('phone', customer.phone || '');
            
            toast.info(`Najdena obstoječa stranka: ${customer.firstName} ${customer.lastName}`);
          } else {
            setExistingCustomer(null);
          }
        } catch (error) {
          console.error('Error checking for existing customer:', error);
        }
      }
    };
    
    const timeoutId = setTimeout(checkExistingCustomer, 500);
    
    return () => clearTimeout(timeoutId);
  }, [email, form]);
  
  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    
    try {
      addLog(
        'info',
        'Starting order submission',
        {
          email: values.email,
          paymentMethod: values.paymentMethod,
          timestamp: new Date().toISOString()
        }
      );
      
      if (values.paymentMethod === 'credit_card') {
        if (!paymentMethodNonce && !paymentMethodReady) {
          toast.error('Plačilni sistem ni pripravljen. Poskusite znova kasneje.');
          setSubmitting(false);
          return;
        }
        
        if (!paymentMethodNonce && paymentMethodReady) {
          const braintreeForm = document.getElementById('braintree-form');
          if (braintreeForm) {
            braintreeForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            setSubmitting(false);
            return;
          } else {
            toast.error('Plačilni sistem ni pripravljen. Poskusite znova kasneje.');
            setSubmitting(false);
            return;
          }
        }
      }
      
      setShowConfirmation(true);
    } catch (error) {
      toast.error('Napaka pri obdelavi naročila');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handlePaymentMethodReady = (isReady: boolean) => {
    setPaymentMethodReady(isReady);
  };
  
  const handlePaymentMethodReceived = (nonce: string) => {
    setPaymentMethodNonce(nonce);
    
    if (nonce) {
      toast.success('Podatki o plačilu so bili uspešno preverjeni');
      form.handleSubmit(handleSubmit)();
    }
  };
  
  const handleConfirmOrder = async () => {
    setConfirmationLoading(true);
    
    try {
      const formValues = form.getValues();
      const total = calculateTotal();
      
      addLog(
        'info',
        'Order confirmation',
        {
          email: formValues.email,
          totalAmount: total.withVat,
          itemCount: items.length,
          timestamp: new Date().toISOString()
        }
      );
      
      let customerId: string;
      
      if (existingCustomer) {
        customerId = existingCustomer.id;
        console.log(`Using existing customer ID: ${customerId}`);
      } else {
        const customerData = {
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          companyName: formValues.companyName,
          vatId: formValues.vatId,
          email: formValues.email,
          phone: formValues.phone,
          street: formValues.street,
          city: formValues.city,
          zipCode: formValues.zipCode,
        };
        
        const newCustomer = await createCustomer(customerData);
        customerId = newCustomer.id;
        console.log(`Created new customer with ID: ${customerId}`);
      }
      
      const newOrder = await createOrder({
        customerId: existingCustomer ? existingCustomer.id : customerId,
        products: items,
        totalCostWithoutVat: total.withoutVat,
        totalCostWithVat: total.withVat,
        shippingMethod: formValues.paymentMethod === 'pickup_at_shop' ? 'pickup' : 'delivery',
        paymentMethod: formValues.paymentMethod,
        status: 'placed',
      });
      
      console.log('New order created:', newOrder);
      
      if (formValues.paymentMethod === 'credit_card' && paymentMethodNonce) {
        console.log('Processing payment with Braintree...');
        
        const paymentResult = await processBraintreePayment(
          paymentMethodNonce, 
          total.withVat,
          newOrder.id
        );
        
        if (!paymentResult.success) {
          throw new Error(paymentResult.error || 'Payment processing failed');
        }
        
        console.log('Payment processed successfully:', paymentResult);
        
        await updateOrder(newOrder.id, {
          transactionId: paymentResult.transactionId
        });
        
        newOrder.transactionId = paymentResult.transactionId;
      }
      
      try {
        await sendOrderEmail('new', newOrder, formValues.email);
        console.log('Order emails sent successfully');
      } catch (error) {
        console.error('Error sending order emails:', error);
        addLog(
          'error',
          'Napaka pri pošiljanju e-pošte za naročilo',
          { 
            error: error instanceof Error ? error.message : String(error),
            orderId: newOrder.id
          }
        );
      }
      
      clearBasket();
      navigate('/thank-you', { state: { order: newOrder } });
    } catch (error) {
      console.error('Error during checkout:', error);
      addLog(
        'error',
        'Error confirming order',
        { error: error instanceof Error ? error.message : String(error) }
      );
      toast.error('Napaka pri potrditvi naročila');
    } finally {
      setConfirmationLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <EmailNotice className="mb-6" />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ime</FormLabel>
                  <FormControl>
                    <Input placeholder="Janez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priimek</FormLabel>
                  <FormControl>
                    <Input placeholder="Novak" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ime podjetja (opcijsko)</FormLabel>
                  <FormControl>
                    <Input placeholder="Podjetje d.o.o." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vatId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID za DDV (opcijsko)</FormLabel>
                  <FormControl>
                    <Input placeholder="SI12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Naslov</FormLabel>
                <FormControl>
                  <Input placeholder="Slovenska cesta 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mesto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ljubljana" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poštna številka</FormLabel>
                  <FormControl>
                    <Input placeholder="1000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-poštni naslov</FormLabel>
                  <FormControl>
                    <Input placeholder="janez@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefonska številka</FormLabel>
                  <FormControl>
                    <Input placeholder="+386 31 123 456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Način plačila</FormLabel>
                <FormControl>
                  <RadioGroup 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0 border border-gray-200 rounded-md p-4">
                      <FormControl>
                        <RadioGroupItem value="credit_card" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                        <CreditCard size={18} />
                        Kreditna kartica
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 border border-gray-200 rounded-md p-4">
                      <FormControl>
                        <RadioGroupItem value="payment_on_delivery" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                        <Truck size={18} />
                        Plačilo ob dostavi
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 border border-gray-200 rounded-md p-4">
                      <FormControl>
                        <RadioGroupItem value="pickup_at_shop" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                        <Store size={18} />
                        Prevzem v trgovini
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 border border-gray-200 rounded-md p-4">
                      <FormControl>
                        <RadioGroupItem value="bank_transfer" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                        <Building size={18} />
                        Bančno nakazilo
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {paymentMethod === 'credit_card' && (
            <BraintreeForm
              onPaymentMethodReady={handlePaymentMethodReady}
              onPaymentMethodReceived={handlePaymentMethodReceived}
            />
          )}
          
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onCancel}
            >
              Prekliči
            </Button>
            <Button 
              type="submit" 
              className="w-full"
              disabled={submitting || (paymentMethod === 'credit_card' && !paymentMethodReady)}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {paymentMethod === 'credit_card' && !paymentMethodReady 
                ? 'Inicializacija plačilnega sistema...' 
                : 'Oddaj naročilo'}
            </Button>
          </div>
        </form>
      </Form>
      
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potrdite naročilo</AlertDialogTitle>
            <AlertDialogDescription>
              Naročate {items.length} izdelkov v skupni vrednosti {calculateTotal().withVat.toFixed(2)}€. 
              Želite nadaljevati z naročilom?
              
              <EmailNotice className="mt-4" />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmation(false)}
              disabled={confirmationLoading}
            >
              Prekliči
            </Button>
            <Button 
              onClick={handleConfirmOrder}
              disabled={confirmationLoading}
            >
              {confirmationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Potrdi naročilo
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CheckoutForm;
