
import React, { useState } from 'react';
import { Color } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ColorSelectorProps {
  selectedColor: Color | null;
  onSelectColor: (color: Color) => void;
  className?: string;
}

const colors: Color[] = [
  {
    id: "1",
    title: 'Bela',
    htmlColor: '#FFFFFF',
    priceWithVat: 60,
    priceWithoutVat: 49.18,
    thickness: 18,
    active: true,
  },
  {
    id: "2",
    title: 'Bukev',
    htmlColor: '#F2D7A2',
    priceWithVat: 70,
    priceWithoutVat: 57.38,
    thickness: 18,
    active: true,
  },
  {
    id: "3",
    title: 'Hrast',
    htmlColor: '#D1B079',
    priceWithVat: 75,
    priceWithoutVat: 61.48,
    thickness: 18,
    active: true,
  },
  {
    id: "4",
    title: 'Črna',
    htmlColor: '#000000',
    priceWithVat: 80,
    priceWithoutVat: 65.57,
    thickness: 18,
    active: true,
  },
  {
    id: "5",
    title: 'Siva',
    htmlColor: '#808080',
    priceWithVat: 72,
    priceWithoutVat: 59.02,
    thickness: 18,
    active: true,
  },
  {
    id: "6",
    title: 'Javor',
    htmlColor: '#E5D499',
    priceWithVat: 68,
    priceWithoutVat: 55.74,
    thickness: 18,
    active: true,
  },
];

const ColorSelector: React.FC<ColorSelectorProps> = ({ 
  selectedColor, 
  onSelectColor, 
  className 
}) => {
  const [open, setOpen] = useState(false);
  
  const handleColorSelect = (color: Color) => {
    onSelectColor(color);
    setOpen(false);
  };

  return (
    <div className={className}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            className="w-full flex justify-between items-center" 
            variant="outline"
          >
            <span>Izberite barvo</span>
            {selectedColor && (
              <div className="flex items-center gap-2">
                <span>{selectedColor.title}</span>
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300" 
                  style={{ backgroundColor: selectedColor.htmlColor || 'transparent' }} 
                />
              </div>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Izberite barvo</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 py-4">
            {colors.map((color) => (
              <div 
                key={color.id}
                data-lov-id="src/components/board/BoardConfigurator.tsx:138:9"
                onClick={() => handleColorSelect(color)}
                className={cn(
                  "p-2 rounded-lg border cursor-pointer transition-all duration-200 ease-in-out",
                  selectedColor?.id === color.id 
                    ? "border-primary dark:border-primary-foreground ring-2 ring-offset-2 ring-primary dark:ring-primary-foreground" 
                    : "border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary-foreground",
                  "flex flex-col items-center space-y-2"
                )}
              >
                <div 
                  className="w-full h-16 rounded-md border border-gray-300 dark:border-gray-600" 
                  style={{ backgroundColor: color.htmlColor || 'transparent' }}
                />
                <span className="text-xs text-gray-700 dark:text-gray-300 text-center">
                  {color.title}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ColorSelector;
