
import React from 'react';
import { Order } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ViewOrderDialogProps {
  order: Order | null;
  onClose: () => void;
  getCustomerName: (customerId: string) => string;
  translatePaymentMethod: (method: string) => string;
  translateShippingMethod: (method: string) => string;
}

const ViewOrderDialog: React.FC<ViewOrderDialogProps> = ({
  order,
  onClose,
  getCustomerName,
  translatePaymentMethod,
  translateShippingMethod,
}) => {
  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Podrobnosti naročila #{order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Stranka</h4>
              <p>{getCustomerName(order.customerId)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Datum</h4>
              <p>{order.orderDate}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Način plačila</h4>
              <p>{translatePaymentMethod(order.paymentMethod)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Način dostave</h4>
              <p>{translateShippingMethod(order.shippingMethod)}</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Izdelki</h4>
            <div className="border rounded-md divide-y">
              {order.products.map((product, index) => (
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
              <span>{order.totalCostWithoutVat.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between font-bold mt-1">
              <span>Skupaj (z DDV):</span>
              <span>{order.totalCostWithVat.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewOrderDialog;
