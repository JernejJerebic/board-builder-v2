
import React, { useState, useEffect } from 'react';
import { Color, Product } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import ColorSelector from './ColorSelector';
import { useBasket } from '@/context/BasketContext';

interface BoardConfiguratorProps {
  onConfigChange: (config: {
    color: Color | null;
    length: number;
    width: number;
    thickness: number;
    borders: {
      top: boolean;
      right: boolean;
      bottom: boolean;
      left: boolean;
    };
    drilling: boolean;
  }) => void;
}

const BoardConfigurator: React.FC<BoardConfiguratorProps> = ({ onConfigChange }) => {
  const { addItem } = useBasket();
  
  const [color, setColor] = useState<Color | null>(null);
  const [length, setLength] = useState<number>(800);
  const [width, setWidth] = useState<number>(600);
  const [thickness, setThickness] = useState<number>(18);
  const [surfaceArea, setSurfaceArea] = useState<number>(0);
  const [borders, setBorders] = useState({
    top: false,
    right: false,
    bottom: false,
    left: false
  });
  const [drilling, setDrilling] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [pricePerUnit, setPricePerUnit] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  
  // Update thickness when color changes
  useEffect(() => {
    if (color) {
      setThickness(color.thickness);
    }
  }, [color]);
  
  // Calculate surface area
  useEffect(() => {
    if (length && width) {
      const area = (length * width) / 1000000; // Convert to m²
      setSurfaceArea(area);
    }
  }, [length, width]);
  
  // Calculate price
  useEffect(() => {
    if (color && surfaceArea) {
      // Base price based on material and surface area
      let price = color.priceWithVat * surfaceArea;
      
      // Add cost for borders
      const borderCount = Object.values(borders).filter(Boolean).length;
      const borderPrice = borderCount * (length + width) / 1000 * 3; // €3 per meter
      
      // Add cost for drilling
      const drillingPrice = drilling ? 5 : 0;
      
      const unitPrice = price + borderPrice + drillingPrice;
      setPricePerUnit(parseFloat(unitPrice.toFixed(2)));
      setTotalPrice(parseFloat((unitPrice * quantity).toFixed(2)));
    }
  }, [color, surfaceArea, borders, drilling, quantity, length, width]);
  
  // Update parent component when configuration changes
  useEffect(() => {
    onConfigChange({
      color,
      length,
      width,
      thickness,
      borders,
      drilling
    });
  }, [color, length, width, thickness, borders, drilling, onConfigChange]);
  
  const handleAddToBasket = () => {
    if (!color) return;
    
    const product: Omit<Product, 'id'> = {
      colorId: color.id,
      length,
      width,
      thickness,
      surfaceArea,
      borders,
      drilling,
      quantity,
      pricePerUnit,
      totalPrice
    };
    
    addItem(product);
  };
  
  const handleBorderChange = (side: keyof typeof borders, checked: boolean) => {
    setBorders(prev => ({
      ...prev,
      [side]: checked
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">1. Select Material</h3>
        <ColorSelector selectedColor={color} onSelectColor={setColor} />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">2. Board Dimensions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="length">Length (mm)</Label>
            <Input
              id="length"
              type="number"
              min="100"
              max="3000"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width">Width (mm)</Label>
            <Input
              id="width"
              type="number"
              min="100"
              max="2000"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thickness">Thickness (mm)</Label>
            <Input
              id="thickness"
              type="number"
              value={thickness}
              disabled
            />
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Surface Area: {surfaceArea.toFixed(2)} m²
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">3. ABS Borders</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="top-border" 
              checked={borders.top} 
              onCheckedChange={(checked) => handleBorderChange('top', checked === true)}
            />
            <Label htmlFor="top-border">Top</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="right-border" 
              checked={borders.right} 
              onCheckedChange={(checked) => handleBorderChange('right', checked === true)}
            />
            <Label htmlFor="right-border">Right</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="bottom-border" 
              checked={borders.bottom} 
              onCheckedChange={(checked) => handleBorderChange('bottom', checked === true)}
            />
            <Label htmlFor="bottom-border">Bottom</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="left-border" 
              checked={borders.left} 
              onCheckedChange={(checked) => handleBorderChange('left', checked === true)}
            />
            <Label htmlFor="left-border">Left</Label>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">4. Hole Drilling</h3>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="drilling" 
            checked={drilling} 
            onCheckedChange={(checked) => setDrilling(checked === true)}
          />
          <Label htmlFor="drilling">Add drilling (100mm from edge)</Label>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">5. Quantity & Price</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricePerUnit">Price per unit</Label>
            <Input
              id="pricePerUnit"
              type="text"
              value={`€${pricePerUnit.toFixed(2)}`}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalPrice">Total price</Label>
            <Input
              id="totalPrice"
              type="text"
              value={`€${totalPrice.toFixed(2)}`}
              disabled
            />
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full py-6 text-lg"
        disabled={!color || quantity < 1}
        onClick={handleAddToBasket}
      >
        Add to Basket
      </Button>
    </div>
  );
};

export default BoardConfigurator;
