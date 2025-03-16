
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchColors } from '@/services/api';
import { Color } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ColorSelectorProps {
  selectedColor: Color | null;
  onSelectColor: (color: Color) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ selectedColor, onSelectColor }) => {
  const [open, setOpen] = useState(false);
  
  const { data: colors, isLoading } = useQuery({
    queryKey: ['colors'],
    queryFn: fetchColors
  });

  const handleColorSelect = (color: Color) => {
    onSelectColor(color);
    setOpen(false);
  };

  const renderColorPreview = (color: Color) => {
    if (color.imageUrl) {
      return (
        <div 
          className="w-8 h-8 rounded border border-gray-300 bg-cover bg-center" 
          style={{ backgroundImage: `url(${color.imageUrl})` }}
        />
      );
    } else {
      return (
        <div 
          className="w-8 h-8 rounded border border-gray-300" 
          style={{ backgroundColor: color.htmlColor || '#d2b48c' }}
        />
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between flex items-center h-16 px-4"
        >
          {selectedColor ? (
            <div className="flex items-center gap-2">
              {renderColorPreview(selectedColor)}
              <span>{selectedColor.title} ({selectedColor.thickness}mm)</span>
            </div>
          ) : (
            <span>Izberite barvo</span>
          )}
          <span className="text-gray-400">▼</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Izberite barvo materiala</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto py-4">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Skeleton className="w-10 h-10 rounded" />
                <div>
                  <Skeleton className="w-24 h-4 mb-1" />
                  <Skeleton className="w-16 h-3" />
                </div>
              </div>
            ))
          ) : (
            colors?.filter(c => c.active).map((color) => (
              <Button
                key={color.id}
                variant="outline"
                className="h-auto py-2 justify-start"
                onClick={() => handleColorSelect(color)}
              >
                <div className="flex items-center gap-2 w-full">
                  {color.imageUrl ? (
                    <div 
                      className="w-10 h-10 rounded border border-gray-300 bg-cover bg-center" 
                      style={{ backgroundImage: `url(${color.imageUrl})` }}
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded border border-gray-300" 
                      style={{ backgroundColor: color.htmlColor || '#d2b48c' }}
                    />
                  )}
                  <div className="text-left">
                    <p className="font-medium">{color.title}</p>
                    <p className="text-sm text-gray-500">{color.thickness}mm - €{color.priceWithVat.toFixed(2)}</p>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColorSelector;
