
import React, { createContext, useContext, useState, useCallback } from 'react';
import { BasketItem, Product, Color } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { getColorById } from '@/data/mockData';
import { toast } from 'sonner';

interface BasketContextType {
  items: BasketItem[];
  addItem: (product: Omit<Product, 'id'>) => void;
  removeItem: (basketId: string) => void;
  clearBasket: () => void;
  calculateTotal: () => { withoutVat: number; withVat: number };
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export const BasketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<BasketItem[]>([]);

  const addItem = useCallback((product: Omit<Product, 'id'>) => {
    const color = getColorById(product.colorId);
    if (!color) {
      toast.error('Barva ni najdena');
      return;
    }

    const newItem: BasketItem = {
      ...product,
      id: uuidv4(),
      basketId: uuidv4(),
      color
    };

    setItems(prev => [...prev, newItem]);
    toast.success('Izdelek dodan v košarico');
  }, []);

  const removeItem = useCallback((basketId: string) => {
    setItems(prev => prev.filter(item => item.basketId !== basketId));
    toast.info('Izdelek odstranjen iz košarice');
  }, []);

  const clearBasket = useCallback(() => {
    setItems([]);
    toast.info('Košarica izpraznjena');
  }, []);

  const calculateTotal = useCallback(() => {
    return items.reduce((acc, item) => {
      const withoutVat = acc.withoutVat + (item.totalPrice / 1.22);
      const withVat = acc.withVat + item.totalPrice;
      return { withoutVat, withVat };
    }, { withoutVat: 0, withVat: 0 });
  }, [items]);

  const value = {
    items,
    addItem,
    removeItem,
    clearBasket,
    calculateTotal
  };

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
};

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (context === undefined) {
    throw new Error('useBasket mora biti uporabljen znotraj BasketProvider');
  }
  return context;
};
