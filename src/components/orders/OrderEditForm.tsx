import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Order, Product, Color } from '@/types';
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
import { mockCustomers, mockColors } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, X, Save, Trash2 } from 'lucide-react';
import { fetchColors } from '@/services/api';

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
  
  const { data: colors, isLoading: isLoadingColors } = useQuery({
    queryKey: ['colors'],
    queryFn: fetchColors
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
  
  // Helper function to update product details
  const updateProduct = (index: number, updatedProduct: Partial<Product>) => {
    const products = [...form.getValues('products')];
    const product = products[index];
    
    // Update all provided fields
    Object.assign(product, updatedProduct);
    
    // Calculate surface area
    product.surfaceArea = (product.length * product.width) / 1000000; // convert to m²
    
    // Recalculate total price
    product.totalPrice = product.quantity * product.pricePerUnit;
    
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
  
  // Helper function to update border properties
  const updateBorder = (index: number, side: 'top' | 'right' | 'bottom' | 'left', value: boolean) => {
    const products = [...form.getValues('products')];
    products[index].borders = {
      ...products[index].borders,
      [side]: value
    };
    form.setValue('products', products);
  };
  
  // Remove a product from the order
  const removeProduct = (index: number) => {
    const products = form.getValues('products').filter((_, i) => i !== index);
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
  
  // Helper function to get color information
  const getColorById = (colorId: string): Color | undefined => {
    return colors?.find(color => color.id === colorId);
  };
  
  // Add a new product to the order
  const addNewProduct = () => {
    const defaultColor = colors?.[0]?.id || '';
    const products = [...form.getValues('products')];
    
    products.push({
      id: `temp-${Date.now()}`,
      colorId: defaultColor,
      length: 1000,
      width: 600,
      thickness: colors?.[0]?.thickness || 18,
      surfaceArea: 0.6,
      borders: {
        top: false,
        right: false,
        bottom: false,
        left: false
      },
      drilling: false,
      quantity: 1,
      pricePerUnit: colors?.[0]?.priceWithVat || 0,
      totalPrice: colors?.[0]?.priceWithVat || 0
    });
    
    form.setValue('products', products);
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
        
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <FormLabel className="text-lg">Izdelki</FormLabel>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={addNewProduct}
            >
              <Plus className="h-4 w-4 mr-1" />
              Dodaj izdelek
            </Button>
          </div>
          
          <div className="border rounded-md divide-y overflow-hidden">
            {form.watch('products').map((product, index) => (
              <div key={index} className="p-3 bg-muted/30">
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium">Plošča {index + 1}</h4>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeProduct(index)} 
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mb-3">
                  <FormLabel className="text-xs">Material in barva</FormLabel>
                  <Select 
                    value={product.colorId}
                    onValueChange={(value) => {
                      const selectedColor = getColorById(value);
                      updateProduct(index, { 
                        colorId: value,
                        thickness: selectedColor?.thickness || product.thickness,
                        pricePerUnit: selectedColor?.priceWithVat || product.pricePerUnit
                      });
                    }}
                  >
                    <SelectTrigger className="h-8 mt-1">
                      <SelectValue placeholder="Izberi material" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingColors ? (
                        <SelectItem value="loading" disabled>Nalaganje...</SelectItem>
                      ) : (
                        colors?.filter(c => c.active).map((color) => (
                          <SelectItem key={color.id} value={color.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300" 
                                style={{ backgroundColor: color.htmlColor || '#d2b48c' }}
                              />
                              <span>{color.title} ({color.thickness}mm)</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <FormLabel className="text-xs">Dolžina (mm)</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      value={product.length}
                      onChange={(e) => updateProduct(index, { length: parseInt(e.target.value) })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <FormLabel className="text-xs">Širina (mm)</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      value={product.width}
                      onChange={(e) => updateProduct(index, { width: parseInt(e.target.value) })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <FormLabel className="text-xs">Debelina (mm)</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      value={product.thickness}
                      onChange={(e) => updateProduct(index, { thickness: parseInt(e.target.value) })}
                      className="h-8"
                      disabled
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <FormLabel className="text-xs">Količina</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) => updateProduct(index, { quantity: parseInt(e.target.value) })}
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
                      onChange={(e) => updateProduct(index, { pricePerUnit: parseFloat(e.target.value) })}
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
                
                <div className="mb-3">
                  <FormLabel className="text-xs">Robovi (označi obdelane robove)</FormLabel>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`top-${index}`} 
                        checked={product.borders.top}
                        onCheckedChange={(checked) => updateBorder(index, 'top', checked === true)}
                      />
                      <label htmlFor={`top-${index}`} className="text-xs">Zgornji</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`right-${index}`} 
                        checked={product.borders.right}
                        onCheckedChange={(checked) => updateBorder(index, 'right', checked === true)}
                      />
                      <label htmlFor={`right-${index}`} className="text-xs">Desni</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`bottom-${index}`} 
                        checked={product.borders.bottom}
                        onCheckedChange={(checked) => updateBorder(index, 'bottom', checked === true)}
                      />
                      <label htmlFor={`bottom-${index}`} className="text-xs">Spodnji</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`left-${index}`} 
                        checked={product.borders.left}
                        onCheckedChange={(checked) => updateBorder(index, 'left', checked === true)}
                      />
                      <label htmlFor={`left-${index}`} className="text-xs">Levi</label>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`drilling-${index}`} 
                    checked={product.drilling}
                    onCheckedChange={(checked) => updateProduct(index, { drilling: checked === true })}
                  />
                  <label htmlFor={`drilling-${index}`} className="text-sm">Vrtanje</label>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  Površina: {product.surfaceArea.toFixed(2)} m²
                </div>
                
                {getColorById(product.colorId) && (
                  <div className="mt-2 flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300" 
                      style={{ backgroundColor: getColorById(product.colorId)?.htmlColor || '#d2b48c' }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {getColorById(product.colorId)?.title}
                    </span>
                  </div>
                )}
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
            <Save className="mr-2 h-4 w-4" />
            Shrani
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OrderEditForm;
