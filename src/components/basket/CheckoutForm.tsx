
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBasket } from '@/context/BasketContext';
import { createOrder, sendOrderEmail } from '@/services/api';
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
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  companyName: z.string().optional(),
  vatId: z.string().optional(),
  street: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
  email: z.string().email('Invalid email address'),
  paymentMethod: z.enum(['credit_card', 'payment_on_delivery', 'pickup_at_shop', 'bank_transfer']),
});

type FormValues = z.infer<typeof formSchema>;

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onCancel }) => {
  const { items, calculateTotal, clearBasket } = useBasket();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
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
      paymentMethod: 'credit_card',
    },
  });
  
  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    
    try {
      // Simulate checking customer in database
      const customerId = '12345'; // This would be a real ID in production
      
      // Show confirmation dialog
      setShowConfirmation(true);
    } catch (error) {
      toast.error('Error processing checkout');
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
      
      // Create order
      const newOrder = await createOrder({
        customerId: '12345', // This would be a real ID in production
        products: items,
        totalCostWithoutVat: total.withoutVat,
        totalCostWithVat: total.withVat,
        shippingMethod: formValues.paymentMethod === 'pickup_at_shop' ? 'pickup' : 'delivery',
        paymentMethod: formValues.paymentMethod,
        status: 'placed',
      });
      
      // Send confirmation email
      await sendOrderEmail('new', newOrder, formValues.email);
      
      // Simulate payment processing (would integrate with Braintree in production)
      if (formValues.paymentMethod === 'credit_card') {
        // In production, we would process payment here
        console.log('Processing payment...');
      }
      
      toast.success('Order successfully placed!');
      
      // Clear basket and close checkout
      clearBasket();
      onCancel();
    } catch (error) {
      toast.error('Error confirming order');
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
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
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
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
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
                  <FormLabel>Company Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp" {...field} />
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
                  <FormLabel>VAT ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="VAT123456789" {...field} />
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
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} />
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
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="New York" {...field} />
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
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="10001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
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
                        Credit Card
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 border border-gray-200 rounded-md p-4">
                      <FormControl>
                        <RadioGroupItem value="payment_on_delivery" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                        <Truck size={18} />
                        Payment on Delivery
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 border border-gray-200 rounded-md p-4">
                      <FormControl>
                        <RadioGroupItem value="pickup_at_shop" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                        <Store size={18} />
                        Pickup at Shop
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 border border-gray-200 rounded-md p-4">
                      <FormControl>
                        <RadioGroupItem value="bank_transfer" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                        <Building size={18} />
                        Bank Transfer
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="w-full"
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Place Order
            </Button>
          </div>
        </form>
      </Form>
      
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Order</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to place an order for {items.length} item(s) with a total value of €{calculateTotal().withVat.toFixed(2)}. 
              Proceed with this order?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmation(false)}
              disabled={confirmationLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmOrder}
              disabled={confirmationLoading}
            >
              {confirmationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Order
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CheckoutForm;
