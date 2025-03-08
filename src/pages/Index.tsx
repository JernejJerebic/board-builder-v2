
import React, { useState } from 'react';
import { useBasket } from '@/context/BasketContext';
import BoardVisualization from '@/components/board/BoardVisualization';
import BoardConfigurator from '@/components/board/BoardConfigurator';
import Basket from '@/components/basket/Basket';
import { Color } from '@/types';

const Index = () => {
  const { items } = useBasket();
  
  const [boardConfig, setBoardConfig] = useState({
    color: null as Color | null,
    length: 800,
    width: 600,
    thickness: 18,
    borders: {
      top: false,
      right: false,
      bottom: false,
      left: false
    },
    drilling: false
  });
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Oblikovalec plošč</h1>
        <p className="text-gray-500">Oblikujte svojo leseno ploščo po meri z izbiro materiala, dimenzij in dodatnih možnosti</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <BoardVisualization
            color={boardConfig.color}
            length={boardConfig.length}
            width={boardConfig.width}
            thickness={boardConfig.thickness}
            borders={boardConfig.borders}
            drilling={boardConfig.drilling}
          />
        </div>
        
        <div>
          <BoardConfigurator onConfigChange={setBoardConfig} />
        </div>
      </div>
      
      <Basket />
    </div>
  );
};

export default Index;
