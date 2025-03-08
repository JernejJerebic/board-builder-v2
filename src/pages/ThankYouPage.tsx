
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
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order as Order | undefined;
  
  useEffect(() => {
    // If no order data is present, redirect to the home page
    if (!order) {
      navigate('/', { replace: true });
    }
  }, [order, navigate]);
  
  if (!order) {
    return null;
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Hvala za vaše naročilo!</h1>
        <p className="text-gray-500">
          Vaše naročilo je bilo uspešno oddano. Spodaj so podrobnosti vašega naročila.
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Podrobnosti naročila</CardTitle>
          <CardDescription>Naročilo #{order.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Datum naročila</p>
              <p>{order.orderDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status naročila</p>
              <p className="capitalize">{order.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Način plačila</p>
              <p className="capitalize">{order.paymentMethod.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Način dostave</p>
              <p className="capitalize">{order.shippingMethod === 'pickup' ? 'Prevzem v trgovini' : 'Dostava'}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-2">Naročeni izdelki</h3>
            <div className="border rounded-md divide-y">
              {order.products.map((product, index) => (
                <div key={index} className="p-4 flex justify-between">
                  <div>
                    <p className="font-medium">Lesena deska po meri</p>
                    <p className="text-sm text-gray-500">
                      {product.width}mm × {product.length}mm × {product.thickness}mm
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">€{product.totalPrice.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Količina: {product.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between">
              <span>Skupaj brez DDV:</span>
              <span>€{order.totalCostWithoutVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Skupaj z DDV:</span>
              <span>€{order.totalCostWithVat.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="mr-2 h-4 w-4" />
            Domov
          </Button>
          <Button onClick={() => navigate('/orders')}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Moja naročila
          </Button>
        </CardFooter>
      </Card>
      
      <div className="text-center">
        <p className="text-gray-500 mb-4">
          Potrdilo o naročilu smo poslali na vaš e-poštni naslov.
        </p>
        <p className="text-gray-500">
          V primeru vprašanj nas kontaktirajte na <span className="font-medium">info@woodboard.si</span>
        </p>
      </div>
    </div>
  );
};

export default ThankYouPage;
