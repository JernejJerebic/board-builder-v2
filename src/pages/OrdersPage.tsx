
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Order } from '@/types';
import { fetchOrders, updateOrderStatus, sendOrderEmail, deleteOrder } from '@/services/api';
import { toast } from 'sonner';
import OrdersList from '@/components/orders/OrdersList';
import ViewOrderDialog from '@/components/orders/ViewOrderDialog';
import DeleteOrderDialog from '@/components/orders/DeleteOrderDialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
      try {
        if (updatedOrder.status === 'in_progress') {
          await sendOrderEmail('progress', updatedOrder);
          toast.success('Status naročila je posodobljen in poslano je e-poštno sporočilo o napredku');
        } else if (updatedOrder.status === 'completed') {
          await sendOrderEmail('completed', updatedOrder);
          toast.success('Status naročila je posodobljen in poslano je e-poštno sporočilo o zaključku');
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

  const handleDeleteOrder = () => {
    if (!orderToDelete) return;
    deleteOrderMutation.mutate(orderToDelete.id);
  };

  const getCustomerName = (customerId: string) => {
    // This could be improved by fetching actual customer data
    return customerId;
  };

  const translatePaymentMethod = (method: string) => {
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

  const filteredOrders = orders?.filter(order =>
    order.id.includes(searchTerm) ||
    order.customerId.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Naročila</h1>
        <p className="text-gray-500">Upravljajte vsa naročila strank</p>
      </div>

      <OrdersList
        orders={filteredOrders}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onViewOrder={setViewOrder}
        onEditOrder={setEditOrder}
        onDeleteOrder={setOrderToDelete}
        onStatusChange={handleStatusChange}
        getCustomerName={getCustomerName}
      />

      <ViewOrderDialog
        order={viewOrder}
        onClose={() => setViewOrder(null)}
        getCustomerName={getCustomerName}
        translatePaymentMethod={translatePaymentMethod}
        translateShippingMethod={translateShippingMethod}
      />

      <Dialog open={!!editOrder} onOpenChange={(open) => !open && setEditOrder(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {editOrder && (
            <OrderEditForm
              order={editOrder}
              onSubmit={(data) => {
                // Handle order update
                setEditOrder(null);
              }}
              onCancel={() => setEditOrder(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteOrderDialog
        order={orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={handleDeleteOrder}
      />
    </div>
  );
};

export default OrdersPage;
