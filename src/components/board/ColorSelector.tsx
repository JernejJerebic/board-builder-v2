
import React from 'react';
import { Color } from '@/types';
import { cn } from '@/lib/utils';

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
    thickness: 18,
  },
  {
    id: "2",
    title: 'Bukev',
    htmlColor: '#F2D7A2',
    priceWithVat: 70,
    thickness: 18,
  },
  {
    id: "3",
    title: 'Hrast',
    htmlColor: '#D1B079',
    priceWithVat: 75,
    thickness: 18,
  },
  {
    id: "4",
    title: 'Črna',
    htmlColor: '#000000',
    priceWithVat: 80,
    thickness: 18,
  },
  {
    id: "5",
    title: 'Siva',
    htmlColor: '#808080',
    priceWithVat: 72,
    thickness: 18,
  },
  {
    id: "6",
    title: 'Javor',
    htmlColor: '#E5D499',
    priceWithVat: 68,
    thickness: 18,
  },
];

const ColorSelector: React.FC<ColorSelectorProps> = ({ 
  selectedColor, 
  onSelectColor, 
  className 
}) => {
  return (
    <div className={cn(
      "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4", 
      className
    )}>
      {colors.map((color) => (
        <div 
          key={color.id}
          data-lov-id="src/components/board/BoardConfigurator.tsx:138:9"
          onClick={() => onSelectColor(color)}
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
  );
};

export default ColorSelector;
