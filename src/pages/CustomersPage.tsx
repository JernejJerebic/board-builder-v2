
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCustomers, createCustomer, updateCustomer } from '@/services/api';
import { Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Plus, Edit, Trash, Loader2, Save, UserPlus } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const customerSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, "Ime je obvezno"),
  lastName: z.string().min(1, "Priimek je obvezen"),
  companyName: z.string().optional(),
  vatId: z.string().optional(),
  street: z.string().min(1, "Ulica je obvezna"),
  city: z.string().min(1, "Mesto je obvezno"),
  zipCode: z.string().min(1, "Poštna številka je obvezna"),
  lastPurchase: z.string().optional(),
  totalPurchases: z.number().default(0),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  
  const queryClient = useQueryClient();
  
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      companyName: '',
      vatId: '',
      street: '',
      city: '',
      zipCode: '',
      totalPurchases: 0,
    },
  });
  
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers
  });
  
  const saveMutation = useMutation({
    mutationFn: (data: CustomerFormValues) => {
      if (data.id) {
        return updateCustomer(data.id, data);
      } else {
        return createCustomer(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsEditDialogOpen(false);
      toast.success(currentCustomer ? 'Stranka posodobljena' : 'Stranka dodana');
    },
    onError: () => {
      toast.error('Napaka pri shranjevanju stranke');
    }
  });
  
  const handleEditCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    form.reset({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      companyName: customer.companyName || '',
      vatId: customer.vatId || '',
      street: customer.street,
      city: customer.city,
      zipCode: customer.zipCode,
      lastPurchase: customer.lastPurchase,
      totalPurchases: customer.totalPurchases,
    });
    setIsEditDialogOpen(true);
  };
  
  const handleNewCustomer = () => {
    setCurrentCustomer(null);
    form.reset({
      firstName: '',
      lastName: '',
      companyName: '',
      vatId: '',
      street: '',
      city: '',
      zipCode: '',
      totalPurchases: 0,
    });
    setIsEditDialogOpen(true);
  };
  
  const onSubmit = (data: CustomerFormValues) => {
    saveMutation.mutate(data);
  };
  
  const filteredCustomers = customers?.filter(customer =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.city.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Stranke</h1>
          <p className="text-gray-500">Upravljajte podatke o vaših strankah</p>
        </div>
        
        <Button onClick={handleNewCustomer}>
          <UserPlus className="mr-2 h-4 w-4" /> Dodaj stranko
        </Button>
      </div>
      
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Iskanje strank..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Ime</TableHead>
                <TableHead>Podjetje</TableHead>
                <TableHead>Lokacija</TableHead>
                <TableHead>Zadnji nakup</TableHead>
                <TableHead>Skupni nakupi</TableHead>
                <TableHead>Dejanja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers && filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.id}</TableCell>
                    <TableCell>{customer.firstName} {customer.lastName}</TableCell>
                    <TableCell>{customer.companyName || '-'}</TableCell>
                    <TableCell>{customer.city}, {customer.zipCode}</TableCell>
                    <TableCell>{customer.lastPurchase || '-'}</TableCell>
                    <TableCell>€{customer.totalPurchases.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Ni najdenih strank
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentCustomer ? 'Uredi stranko' : 'Dodaj novo stranko'}</DialogTitle>
            <DialogDescription>
              {currentCustomer ? 'Spremenite podatke stranke' : 'Vnesite podatke nove stranke'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ime</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ime podjetja (neobvezno)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vatId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID za DDV (neobvezno)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ulica</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mesto</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Shrani
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersPage;
