import React, { useState } from 'react';
import { useBasket } from '@/context/BasketContext';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import CheckoutForm from './CheckoutForm';
import { Separator } from '@/components/ui/separator';

const Basket: React.FC = () => {
  const { items, removeItem, calculateTotal } = useBasket();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  
  const total = calculateTotal();
  
  if (items.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
        <h2 className="text-xl font-semibold mb-4">Košarica</h2>
        <p className="text-gray-500">Vaša košarica je prazna</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
      <h2 className="text-xl font-semibold mb-4">Košarica</h2>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.basketId} className="flex flex-col md:flex-row justify-between border-b border-gray-200 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded" 
                  style={{ backgroundColor: item.color?.htmlColor || item.colorHtml || '#d2b48c' }}
                />
                <h3 className="font-medium">{item.color?.title || item.colorTitle}</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {item.length} x {item.width} x {item.thickness}mm
                {Object.values(item.borders).some(Boolean) && (
                  <>, Robovi: {Object.entries(item.borders)
                    .filter(([_, value]) => value)
                    .map(([key]) => {
                      switch(key) {
                        case 'top': return 'zgornji';
                        case 'right': return 'desni';
                        case 'bottom': return 'spodnji';
                        case 'left': return 'levi';
                        default: return key;
                      }
                    })
                    .join(', ')}</>
                )}
                {item.drilling && <>, Z vrtanjem</>}
              </p>
              <p className="text-sm mt-1">Količina: {item.quantity}</p>
            </div>
            
            <div className="flex justify-between items-center mt-2 md:mt-0">
              <span className="font-medium">{item.totalPrice.toFixed(2)}€</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-500 hover:text-red-500"
                onClick={() => removeItem(item.basketId)}
              >
                <Trash size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span>Vmesna vsota (brez DDV):</span>
          <span>{total.withoutVat.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between font-semibold text-lg mt-2">
          <span>Skupaj (z DDV):</span>
          <span>{total.withVat.toFixed(2)}€</span>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      {checkoutOpen ? (
        <CheckoutForm onCancel={() => setCheckoutOpen(false)} />
      ) : (
        <Button 
          className="w-full mt-4" 
          onClick={() => setCheckoutOpen(true)}
        >
          Nadaljuj na blagajno
        </Button>
      )}
    </div>
  );
};

export default Basket;
