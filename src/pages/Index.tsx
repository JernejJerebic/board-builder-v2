
import React, { useState, useEffect } from 'react';
import { useBasket } from '@/context/BasketContext';
import BoardVisualization from '@/components/board/BoardVisualization';
import BoardConfigurator from '@/components/board/BoardConfigurator';
import Basket from '@/components/basket/Basket';
import { Color } from '@/types';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const {
    items
  } = useBasket();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);

    // Redirect non-admin users who try to access admin pages
    if (!adminStatus && window.location.pathname !== '/') {
      navigate('/');
    }
  }, [navigate]);
  
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
      <div className="text-left">
        <h1 className="text-3xl font-bold mb-2">LCC Naročilo razreza</h1>
        <p className="text-gray-500 text-base mb-2">
          Oblikujte svojo leseno ploščo po meri z izbiro materiala, dimenzij in dodatnih možnosti
        </p>
        <p className="text-sm text-gray-500">
          Za pomoč pri naročilu nas lahko kontaktirate na <span className="font-medium">info@lcc.si</span> ali po telefonu na <span className="font-medium">+386 7 393 07 00</span>
        </p>
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
      
      {/* Hidden container for Braintree Hosted Fields */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <div id="card-number"></div>
        <div id="cvv"></div>
        <div id="expiration-date"></div>
      </div>
    </div>
  );
};

export default Index;
