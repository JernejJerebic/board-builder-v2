
import React from 'react';
import { Order } from '@/types';
import { Search, Eye, FilePenLine, Trash2, Loader2 } from 'lucide-react';
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

interface OrdersListProps {
  orders: Order[] | undefined;
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (order: Order) => void;
  onStatusChange: (orderId: string, status: Order['status']) => void;
  getCustomerName: (customerId: string) => string;
}

const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  isLoading,
  searchTerm,
  onSearchChange,
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onStatusChange,
  getCustomerName,
}) => {
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

  return (
    <>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Išči naročila..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
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
              {orders && orders.length > 0 ? (
                orders.map((order) => (
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
                          onClick={() => onViewOrder(order)}
                          title="Pogled"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditOrder(order)}
                          title="Urejanje"
                        >
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteOrder(order)}
                          title="Izbriši"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Select
                          value={order.status}
                          onValueChange={(value: Order['status']) => onStatusChange(order.id, value)}
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
    </>
  );
};

export default OrdersList;
