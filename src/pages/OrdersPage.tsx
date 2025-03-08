
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrders, updateOrderStatus, sendOrderEmail, updateOrder, deleteOrder } from '@/services/api';
import { Order, Product } from '@/types';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Eye, Loader2, Edit, Trash2, FilePenLine } from 'lucide-react';
import { mockCustomers } from '@/data/mockData';
import OrderEditForm from '@/components/orders/OrderEditForm';

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) => 
      updateOrderStatus(id, status),
    onSuccess: async (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      const customer = mockCustomers.find(c => c.id === updatedOrder.customerId);
      const email = customer?.email || 'customer@example.com';
      
      try {
        if (updatedOrder.status === 'in_progress') {
          const emailResult = await sendOrderEmail('progress', updatedOrder, email);
          if (emailResult.success) {
            toast.success('Status naročila je posodobljen in poslano je e-poštno sporočilo o napredku');
          } else {
            toast.error('Status naročila je posodobljen ampak prišlo je do napake pri pošiljanju e-pošte');
          }
        } else if (updatedOrder.status === 'completed') {
          const emailResult = await sendOrderEmail('completed', updatedOrder, email);
          if (emailResult.success) {
            toast.success('Status naročila je posodobljen in poslano je e-poštno sporočilo o zaključku');
          } else {
            toast.error('Status naročila je posodobljen ampak prišlo je do napake pri pošiljanju e-pošte');
          }
        } else {
          toast.success('Status naročila je posodobljen');
        }
      } catch (error) {
        console.error('Error sending email:', error);
        toast.error('Status naročila je posodobljen ampak prišlo je do napake pri pošiljanju e-pošte');
      }
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast.error('Ni bilo mogoče posodobiti statusa naročila');
    }
  });
  
  const updateOrderMutation = useMutation({
    mutationFn: (orderData: { id: string, data: Partial<Order> }) => 
      updateOrder(orderData.id, orderData.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Naročilo je uspešno posodobljeno');
      setEditOrder(null);
    },
    onError: (error) => {
      console.error('Error updating order:', error);
      toast.error('Ni bilo mogoče posodobiti naročila');
    }
  });
  
  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Naročilo je uspešno izbrisano');
      setOrderToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting order:', error);
      toast.error('Ni bilo mogoče izbrisati naročila');
    }
  });
  
  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateStatusMutation.mutate({ id: orderId, status });
  };
  
  const handleUpdateOrder = (updatedOrder: Partial<Order>) => {
    if (!editOrder) return;
    
    updateOrderMutation.mutate({
      id: editOrder.id,
      data: updatedOrder
    });
  };
  
  const handleDeleteOrder = () => {
    if (!orderToDelete) return;
    deleteOrderMutation.mutate(orderToDelete.id);
  };
  
  const filteredOrders = orders?.filter(order =>
    order.id.includes(searchTerm) ||
    order.customerId.includes(searchTerm)
  );
  
  const getCustomerName = (customerId: string) => {
    const customer = mockCustomers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Neznano';
  };
  
  const getStatusBadgeColor = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const translateStatus = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return 'Oddano';
      case 'in_progress':
        return 'V obdelavi';
      case 'completed':
        return 'Zaključeno';
      default:
        return status;
    }
  };
  
  const translatePaymentMethod = (method: string) => {
    if (!method) return '';
    
    switch (method) {
      case 'credit_card':
        return 'Kreditna kartica';
      case 'payment_on_delivery':
        return 'Plačilo ob dostavi';
      case 'pickup_at_shop':
        return 'Prevzem v trgovini';
      case 'bank_transfer':
        return 'Bančno nakazilo';
      default:
        return method ? method.replace(/_/g, ' ') : '';
    }
  };
  
  const translateShippingMethod = (method: string) => {
    switch (method) {
      case 'pickup':
        return 'Prevzem';
      case 'delivery':
        return 'Dostava';
      default:
        return method || '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Naročila</h1>
        <p className="text-gray-500">Upravljajte vsa naročila strank</p>
      </div>
      
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Išči naročila..."
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
                <TableHead>ID naročila</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Stranka</TableHead>
                <TableHead>Izdelki</TableHead>
                <TableHead>Skupaj (DDV)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dejanja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders && filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>{getCustomerName(order.customerId)}</TableCell>
                    <TableCell>{order.products.length} izdelkov</TableCell>
                    <TableCell>{order.totalCostWithVat.toFixed(2)}€</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewOrder(order)}
                          title="Pogled"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditOrder(order)}
                          title="Urejanje"
                        >
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setOrderToDelete(order)}
                          title="Izbriši"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Select
                          value={order.status}
                          onValueChange={(value: Order['status']) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="placed">Oddano</SelectItem>
                            <SelectItem value="in_progress">V obdelavi</SelectItem>
                            <SelectItem value="completed">Zaključeno</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Ni najdenih naročil
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      
      {/* View Order Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Podrobnosti naročila #{viewOrder?.id}</DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Stranka</h4>
                  <p>{getCustomerName(viewOrder.customerId)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Datum</h4>
                  <p>{viewOrder.orderDate}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Način plačila</h4>
                  <p>{translatePaymentMethod(viewOrder.paymentMethod)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Način dostave</h4>
                  <p>{translateShippingMethod(viewOrder.shippingMethod)}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Izdelki</h4>
                <div className="border rounded-md divide-y">
                  {viewOrder.products.map((product, index) => (
                    <div key={index} className="p-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">Plošča {index + 1}</p>
                          <p className="text-sm text-gray-500">
                            {product.length} x {product.width} x {product.thickness}mm
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-right">{product.totalPrice.toFixed(2)}€</p>
                          <p className="text-sm text-gray-500">Kol: {product.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Vmesna vsota (brez DDV):</span>
                  <span>{viewOrder.totalCostWithoutVat.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-bold mt-1">
                  <span>Skupaj (z DDV):</span>
                  <span>{viewOrder.totalCostWithVat.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Order Dialog */}
      <Dialog open={!!editOrder} onOpenChange={(open) => !open && setEditOrder(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uredi naročilo #{editOrder?.id}</DialogTitle>
            <DialogDescription>
              Spremenite podrobnosti naročila
            </DialogDescription>
          </DialogHeader>
          {editOrder && (
            <OrderEditForm 
              order={editOrder} 
              onSubmit={handleUpdateOrder} 
              onCancel={() => setEditOrder(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Order Confirmation Dialog */}
      <Dialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Izbriši naročilo</DialogTitle>
            <DialogDescription>
              Ali ste prepričani, da želite izbrisati naročilo #{orderToDelete?.id}?
              Tega dejanja ni mogoče razveljaviti.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderToDelete(null)}>
              Prekliči
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrder}>
              Izbriši naročilo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
