import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Order } from '@/types';
import { CheckCircle, Home } from 'lucide-react';
import { addLog } from '@/services/localStorage';

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order as Order | undefined;
  
  useEffect(() => {
    if (!order) {
      navigate('/', { replace: true });
    } else {
      addLog(
        'info',
        `Ogled strani za zahvalo za naročilo #${order.id}`,
        { 
          orderId: order.id,
          paymentMethod: order.paymentMethod,
          timestamp: new Date().toISOString()
        }
      );
    }
  }, [order, navigate]);
  
  if (!order) {
    return null;
  }
  
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Kreditna kartica';
      case 'payment_on_delivery': return 'Plačilo ob dostavi';
      case 'pickup_at_shop': return 'Prevzem v trgovini';
      case 'bank_transfer': return 'Bančno nakazilo';
      default: return method;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Hvala za vaše naročilo!</h1>
        <p className="text-xl text-gray-600">
          Vaše naročilo je bilo uspešno oddano. Spodaj so podrobnosti vašega naročila.
        </p>
      </div>
      
      <Card className="mb-8 shadow-lg">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-2xl">Podrobnosti naročila</CardTitle>
          <CardDescription className="text-lg">Naročilo #{order.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-base font-medium text-gray-500">Datum naročila</p>
              <p className="text-lg">{new Date(order.orderDate).toLocaleDateString('sl-SI')}</p>
            </div>
            <div>
              <p className="text-base font-medium text-gray-500">Status naročila</p>
              <p className="text-lg capitalize">
                {order.status === 'placed' || order.status === 'new' ? 'Oddano' : 
                order.status === 'in_progress' || order.status === 'processing' ? 'V obdelavi' : 'Zaključeno'}
              </p>
            </div>
            <div>
              <p className="text-base font-medium text-gray-500">Način plačila</p>
              <p className="text-lg">{getPaymentMethodText(order.paymentMethod)}</p>
            </div>
            <div>
              <p className="text-base font-medium text-gray-500">Način dostave</p>
              <p className="text-lg">{order.shippingMethod === 'pickup' ? 'Prevzem v trgovini' : 'Dostava'}</p>
            </div>
            
            {order.transactionId && (
              <div className="col-span-2">
                <p className="text-base font-medium text-gray-500">ID transakcije</p>
                <p className="text-lg font-mono">{order.transactionId}</p>
              </div>
            )}
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-medium mb-4">Naročeni izdelki</h3>
            <div className="border rounded-md divide-y">
              {order.products.map((product, index) => (
                <div key={index} className="p-4 flex justify-between">
                  <div>
                    <p className="font-medium text-lg">Lesena deska po meri</p>
                    <p className="text-base text-gray-600">
                      {product.width}mm × {product.length}mm × {product.thickness}mm
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg">€{product.totalPrice.toFixed(2)}</p>
                    <p className="text-base text-gray-600">Količina: {product.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between text-lg">
              <span>Skupaj brez DDV:</span>
              <span>€{order.totalCostWithoutVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl mt-2">
              <span>Skupaj z DDV:</span>
              <span>€{order.totalCostWithVat.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center bg-muted/30 py-6">
          <Button size="lg" onClick={() => navigate('/')}>
            <Home className="mr-2 h-5 w-5" />
            Nazaj na domačo stran
          </Button>
        </CardFooter>
      </Card>
      
      <div className="text-center text-gray-600">
        <p className="text-lg mb-4">
          Potrdilo o naročilu smo poslali na vaš e-poštni naslov.
        </p>
        <p className="text-lg">
          V primeru vprašanj nas kontaktirajte na <span className="font-medium">info@lcc-razrez.si</span>
        </p>
      </div>
    </div>
  );
};

export default ThankYouPage;
