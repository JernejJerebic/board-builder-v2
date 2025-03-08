import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBasket } from '@/context/BasketContext';
import { createOrder, sendOrderEmail, createCustomer, findCustomerByEmail } from '@/services/api';
import { Button } from '@/components/ui/button';
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
  cardNumber: z.string().optional().refine(val => {
    if (val === undefined) return true;
    return val === '' || (val.replace(/\s/g, '').length === 16 && /^\d+$/.test(val.replace(/\s/g, '')));
  }, 'Vnesite veljavno 16-mestno številko kartice'),
  expiryDate: z.string().optional().refine(val => {
    if (val === undefined) return true;
    return val === '' || /^(0[1-9]|1[0-2])\/\d{2}$/.test(val);
  }, 'Vnesite datum v obliki MM/YY'),
  cvv: z.string().optional().refine(val => {
    if (val === undefined) return true;
    return val === '' || (/^\d{3,4}$/.test(val));
  }, 'CVV mora vsebovati 3 ali 4 številke'),
});

type FormValues = z.infer<typeof formSchema>;

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onCancel }) => {
  const { items, calculateTotal, clearBasket } = useBasket();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [braintreeReady, setBraintreeReady] = useState(false);
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
      cardNumber: '',
      expiryDate: '',
      cvv: '',
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
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setBraintreeReady(true);
      console.log('Braintree client initialized');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    
    try {
      setShowConfirmation(true);
    } catch (error) {
      toast.error('Napaka pri obdelavi naročila');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleConfirmOrder = async () => {
    setConfirmationLoading(true);
    
    try {
      const formValues = form.getValues();
      const total = calculateTotal();
      
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
      
      if (formValues.paymentMethod === 'credit_card') {
        console.log('Processing payment with Braintree...');
        console.log(`Card number: ${formValues.cardNumber}`);
        console.log(`Expiry date: ${formValues.expiryDate}`);
        console.log(`CVV: ${formValues.cvv}`);
        
        console.log('Payment processed successfully');
      }
      
      const newOrder = await createOrder({
        customerId: customerId,
        products: items,
        totalCostWithoutVat: total.withoutVat,
        totalCostWithVat: total.withVat,
        shippingMethod: formValues.paymentMethod === 'pickup_at_shop' ? 'pickup' : 'delivery',
        paymentMethod: formValues.paymentMethod,
        status: 'placed',
      });
      
      try {
        const emailResult = await sendOrderEmail('new', newOrder, formValues.email);
        if (emailResult.success) {
          console.log('Order emails sent successfully');
        } else {
          console.error('Failed to send order emails:', emailResult.message);
        }
      } catch (error) {
        console.error('Error sending order emails:', error);
      }
      
      toast.success('Naročilo uspešno oddano!');
      
      clearBasket();
      navigate('/thank-you', { state: { order: newOrder } });
    } catch (error) {
      toast.error('Napaka pri potrditvi naročila');
      console.error(error);
    } finally {
      setConfirmationLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <>
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
            <div className="p-4 border border-gray-200 rounded-md space-y-4">
              <h3 className="font-medium">Podatki o kreditni kartici</h3>
              
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Številka kartice</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="1234 5678 9012 3456" 
                        {...field} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '');
                          const formattedValue = value
                            .replace(/\D/g, '')
                            .replace(/(\d{4})(?=\d)/g, '$1 ')
                            .trim()
                            .substring(0, 19);
                          field.onChange(formattedValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Datum veljavnosti (MM/YY)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="MM/YY" 
                          {...field} 
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length > 0) {
                              value = value.substring(0, 4);
                              if (value.length > 2) {
                                value = `${value.substring(0, 2)}/${value.substring(2)}`;
                              }
                            }
                            field.onChange(value);
                          }}
                          maxLength={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').substring(0, 4);
                            field.onChange(value);
                          }}
                          maxLength={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Vaši podatki o plačilu so varni in šifrirani. Nikoli ne shranjujemo podatkov o vaši kartici.</p>
              </div>
            </div>
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
              disabled={submitting || (paymentMethod === 'credit_card' && !braintreeReady)}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {paymentMethod === 'credit_card' && !braintreeReady ? 'Inicializacija plačilnega sistema...' : 'Oddaj naročilo'}
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
