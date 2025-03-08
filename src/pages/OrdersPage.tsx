
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrders, updateOrderStatus, sendOrderEmail } from '@/services/api';
import { Order } from '@/types';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Eye, Loader2 } from 'lucide-react';
import { mockCustomers } from '@/data/mockData';

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  
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
      
      // Find customer email (this would be from a real API in production)
      const customer = mockCustomers.find(c => c.id === updatedOrder.customerId);
      const email = customer ? 'customer@example.com' : 'unknown@example.com';
      
      // Send notification email based on status
      if (updatedOrder.status === 'in_progress') {
        await sendOrderEmail('progress', updatedOrder, email);
        toast.success('Order status updated and progress email sent');
      } else if (updatedOrder.status === 'completed') {
        await sendOrderEmail('completed', updatedOrder, email);
        toast.success('Order status updated and completion email sent');
      } else {
        toast.success('Order status updated');
      }
    },
    onError: () => {
      toast.error('Failed to update order status');
    }
  });
  
  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateStatusMutation.mutate({ id: orderId, status });
  };
  
  const filteredOrders = orders?.filter(order =>
    order.id.includes(searchTerm) ||
    order.customerId.includes(searchTerm)
  );
  
  const getCustomerName = (customerId: string) => {
    const customer = mockCustomers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Orders</h1>
        <p className="text-gray-500">Manage all customer orders</p>
      </div>
      
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Search orders..."
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
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total (VAT)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders && filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>{getCustomerName(order.customerId)}</TableCell>
                    <TableCell>{order.products.length} items</TableCell>
                    <TableCell>€{order.totalCostWithVat.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select
                          value={order.status}
                          onValueChange={(value: Order['status']) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="placed">Placed</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      
      <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details #{viewOrder?.id}</DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                  <p>{getCustomerName(viewOrder.customerId)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date</h4>
                  <p>{viewOrder.orderDate}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
                  <p>{viewOrder.paymentMethod.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Shipping Method</h4>
                  <p>{viewOrder.shippingMethod}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Products</h4>
                <div className="border rounded-md divide-y">
                  {viewOrder.products.map((product, index) => (
                    <div key={index} className="p-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">Board {index + 1}</p>
                          <p className="text-sm text-gray-500">
                            {product.length} x {product.width} x {product.thickness}mm
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-right">€{product.totalPrice.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Qty: {product.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal (without VAT):</span>
                  <span>€{viewOrder.totalCostWithoutVat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold mt-1">
                  <span>Total (with VAT):</span>
                  <span>€{viewOrder.totalCostWithVat.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
