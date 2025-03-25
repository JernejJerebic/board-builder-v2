
import React, { useState, useEffect } from 'react';
import { Color, Product } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import ColorSelector from './ColorSelector';
import { useBasket } from '@/context/BasketContext';
import { useToast } from '@/components/ui/use-toast';
import { X } from 'lucide-react';

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
    customImage: File | null;
  }) => void;
  initialCustomImage?: File | null;
}

const BoardConfigurator: React.FC<BoardConfiguratorProps> = ({
  onConfigChange,
  initialCustomImage = null
}) => {
  const { addItem } = useBasket();
  const { toast } = useToast();
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
  const [customImage, setCustomImage] = useState<File | null>(initialCustomImage);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Update thickness when color changes
  useEffect(() => {
    if (color) {
      setThickness(color.thickness);
    }
  }, [color]);

  // Update image preview when custom image changes
  useEffect(() => {
    if (customImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(customImage);
    } else {
      setImagePreview(null);
    }
  }, [customImage]);

  // Calculate surface area
  useEffect(() => {
    if (length && width) {
      const area = length * width / 1000000; // Convert to m²
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
      drilling,
      customImage
    });
  }, [color, length, width, thickness, borders, drilling, customImage, onConfigChange]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomImage(file);
      toast({
        title: "Slika naložena",
        description: "Vaša slika je bila uspešno naložena."
      });
    }
  };

  const removeImage = () => {
    setCustomImage(null);
    setImagePreview(null);
    toast({
      title: "Slika odstranjena",
      description: "Vaša slika je bila uspešno odstranjena."
    });
  };

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

  return <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2 text-xl">1. Izbira materiala</h3>
        <ColorSelector selectedColor={color} onSelectColor={setColor} />
      </div>
      
      <div>
        <h3 className="font-medium mb-2 text-xl">2. Dodaj svojo sliko</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Slika za ploščo (neobvezno)</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          
          {imagePreview && (
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Predogled slike" 
                className="max-w-full h-auto max-h-48 rounded-md border border-gray-200" 
              />
              <button 
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                title="Odstrani sliko"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2 text-xl">3. Dimenzije plošče</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="length">Dolžina (mm)</Label>
            <Input id="length" type="number" min="100" max="3000" value={length} onChange={e => setLength(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width">Širina (mm)</Label>
            <Input id="width" type="number" min="100" max="2000" value={width} onChange={e => setWidth(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thickness">Debelina (mm)</Label>
            <Input id="thickness" type="number" value={thickness} disabled />
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Površina: {surfaceArea.toFixed(2)} m²
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2 text-xl">4. ABS robovi</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="top-border" checked={borders.top} onCheckedChange={checked => handleBorderChange('top', checked === true)} />
            <Label htmlFor="top-border">Zgoraj</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="right-border" checked={borders.right} onCheckedChange={checked => handleBorderChange('right', checked === true)} />
            <Label htmlFor="right-border">Desno</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="bottom-border" checked={borders.bottom} onCheckedChange={checked => handleBorderChange('bottom', checked === true)} />
            <Label htmlFor="bottom-border">Spodaj</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="left-border" checked={borders.left} onCheckedChange={checked => handleBorderChange('left', checked === true)} />
            <Label htmlFor="left-border">Levo</Label>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2 text-xl">5. Vrtanje lukenj</h3>
        <div className="flex items-center space-x-2">
          <Checkbox id="drilling" checked={drilling} onCheckedChange={checked => setDrilling(checked === true)} />
          <Label htmlFor="drilling">Dodaj luknje (100mm od roba)</Label>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2 text-xl">6. Količina in cena</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Količina</Label>
            <Input id="quantity" type="number" min="1" max="100" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricePerUnit">Cena na enoto</Label>
            <Input id="pricePerUnit" type="text" value={`€${pricePerUnit.toFixed(2)}`} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalPrice">Skupna cena</Label>
            <Input id="totalPrice" type="text" value={`€${totalPrice.toFixed(2)}`} disabled />
          </div>
        </div>
      </div>
      
      <Button className="w-full py-6 text-lg" disabled={!color || quantity < 1} onClick={handleAddToBasket}>
        Dodaj v košarico
      </Button>
    </div>;
};

export default BoardConfigurator;
