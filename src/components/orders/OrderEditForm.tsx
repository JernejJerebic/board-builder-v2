
import React from 'react';
import { useForm } from 'react-hook-form';
import { Order, Product } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockCustomers } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, X, Save } from 'lucide-react';

interface OrderEditFormProps {
  order: Order;
  onSubmit: (data: Partial<Order>) => void;
  onCancel: () => void;
}

const OrderEditForm: React.FC<OrderEditFormProps> = ({ order, onSubmit, onCancel }) => {
  const form = useForm({
    defaultValues: {
      customerId: order.customerId,
      shippingMethod: order.shippingMethod,
      paymentMethod: order.paymentMethod,
      status: order.status,
      products: [...order.products],
      totalCostWithoutVat: order.totalCostWithoutVat,
      totalCostWithVat: order.totalCostWithVat,
    },
  });
  
  const { formState } = form;
  
  const handleSubmit = (data: any) => {
    // Recalculate totals based on products
    const totalWithoutVat = data.products.reduce(
      (sum: number, product: Product) => sum + (product.totalPrice / 1.22), 
      0
    );
    
    const totalWithVat = data.products.reduce(
      (sum: number, product: Product) => sum + product.totalPrice, 
      0
    );
    
    onSubmit({
      ...data,
      totalCostWithoutVat: parseFloat(totalWithoutVat.toFixed(2)),
      totalCostWithVat: parseFloat(totalWithVat.toFixed(2)),
    });
  };
  
  // Helper function to update product price
  const updateProductPrice = (index: number, quantity: number, price: number) => {
    const products = form.getValues('products');
    products[index].quantity = quantity;
    products[index].pricePerUnit = price;
    products[index].totalPrice = quantity * price;
    form.setValue('products', products);
    
    // Recalculate totals
    const totalWithoutVat = products.reduce(
      (sum, product) => sum + (product.totalPrice / 1.22), 
      0
    );
    
    const totalWithVat = products.reduce(
      (sum, product) => sum + product.totalPrice, 
      0
    );
    
    form.setValue('totalCostWithoutVat', parseFloat(totalWithoutVat.toFixed(2)));
    form.setValue('totalCostWithVat', parseFloat(totalWithVat.toFixed(2)));
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stranka</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Izberi stranko" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="shippingMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Način dostave</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Izberi način dostave" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pickup">Prevzem</SelectItem>
                    <SelectItem value="delivery">Dostava</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Način plačila</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Izberi način plačila" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="credit_card">Kreditna kartica</SelectItem>
                    <SelectItem value="payment_on_delivery">Plačilo ob dostavi</SelectItem>
                    <SelectItem value="pickup_at_shop">Prevzem v trgovini</SelectItem>
                    <SelectItem value="bank_transfer">Bančno nakazilo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status naročila</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Izberi status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="placed">Oddano</SelectItem>
                  <SelectItem value="in_progress">V obdelavi</SelectItem>
                  <SelectItem value="completed">Zaključeno</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel>Izdelki</FormLabel>
          <div className="border rounded-md divide-y overflow-hidden">
            {form.watch('products').map((product, index) => (
              <div key={index} className="p-3 bg-muted/30">
                <div className="grid grid-cols-3 gap-3 mb-2">
                  <div>
                    <FormLabel className="text-xs">Količina</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) => updateProductPrice(index, parseInt(e.target.value), product.pricePerUnit)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <FormLabel className="text-xs">Cena na enoto (€)</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.pricePerUnit}
                      onChange={(e) => updateProductPrice(index, product.quantity, parseFloat(e.target.value))}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <FormLabel className="text-xs">Skupna cena (€)</FormLabel>
                    <Input
                      readOnly
                      value={product.totalPrice.toFixed(2)}
                      className="h-8 bg-muted/50"
                    />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Dimenzije: {product.length}mm × {product.width}mm × {product.thickness}mm
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span>Vmesna vsota (brez DDV):</span>
            <span>{form.watch('totalCostWithoutVat').toFixed(2)}€</span>
          </div>
          <div className="flex justify-between font-bold mt-1">
            <span>Skupaj (z DDV):</span>
            <span>{form.watch('totalCostWithVat').toFixed(2)}€</span>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Prekliči
          </Button>
          <Button 
            type="submit" 
            disabled={formState.isSubmitting || !formState.isDirty}
          >
            {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Shrani
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OrderEditForm;
