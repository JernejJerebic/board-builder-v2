
import React, { useEffect, useRef } from 'react';
import { Color } from '@/types';

interface BoardVisualizationProps {
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
}

const BoardVisualization: React.FC<BoardVisualizationProps> = ({
  color,
  length,
  width,
  thickness,
  borders,
  drilling
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const isInitialRender = useRef(true);

  // Convert real-world dimensions to visualization scale - increased by 50%
  const scale = 0.375; // 1mm = 0.375px (increased from 0.25)
  
  const scaledLength = length * scale;
  const scaledWidth = width * scale;
  const scaledThickness = thickness * scale;

  // Update board visualization whenever props change
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
    }
    
    updateBoardVisualization();
  }, [color, length, width, thickness, borders, drilling]);

  // Function to update the board visualization
  const updateBoardVisualization = () => {
    if (!boardRef.current) return;
    
    // Update board dimensions
    boardRef.current.style.width = `${scaledLength}px`;
    boardRef.current.style.height = `${scaledWidth}px`;
    boardRef.current.style.transform = `perspective(1000px) rotateX(45deg) rotateZ(0deg)`;
    
    // Add thickness using box-shadow
    boardRef.current.style.boxShadow = `0 ${scaledThickness}px 0 #a0826c`;
    
    // Update board color
    if (color) {
      if (color.imageUrl) {
        boardRef.current.style.backgroundImage = `url(${color.imageUrl})`;
        boardRef.current.style.backgroundSize = 'cover';
      } else {
        boardRef.current.style.backgroundColor = color.htmlColor || '#d2b48c';
      }
    } else {
      boardRef.current.style.backgroundColor = '#d2b48c'; // Default wood color
    }
  };

  // Render the board visualization
  return (
    <div className="flex justify-center items-center my-8" ref={containerRef}>
      <div className="relative" style={{ height: `${scaledWidth + scaledThickness + 60}px` }}>
        {/* The wooden board */}
        <div
          ref={boardRef}
          className="relative transition-all duration-300"
          style={{
            width: `${scaledLength}px`,
            height: `${scaledWidth}px`,
            transform: 'perspective(1000px) rotateX(45deg) rotateZ(0deg)',
            transformStyle: 'preserve-3d',
            boxShadow: `0 ${scaledThickness}px 0 #a0826c`,
            backgroundColor: color?.htmlColor || '#d2b48c',
            backgroundImage: color?.imageUrl ? `url(${color.imageUrl})` : 'none',
            backgroundSize: 'cover',
            border: '1px solid rgba(0,0,0,0.2)'
          }}
        >
          {/* Borders */}
          {borders.top && (
            <div className="absolute top-0 left-0 right-0 h-2 bg-gray-300 border border-gray-400" 
                 style={{ transform: 'translateY(-1px)' }}></div>
          )}
          {borders.right && (
            <div className="absolute top-0 bottom-0 right-0 w-2 bg-gray-300 border border-gray-400" 
                 style={{ transform: 'translateX(1px)' }}></div>
          )}
          {borders.bottom && (
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 border border-gray-400" 
                 style={{ transform: 'translateY(1px)' }}></div>
          )}
          {borders.left && (
            <div className="absolute top-0 bottom-0 left-0 w-2 bg-gray-300 border border-gray-400" 
                 style={{ transform: 'translateX(-1px)' }}></div>
          )}
          
          {/* Drilling holes - improved visualization */}
          {drilling && (
            <>
              {/* Top-left hole */}
              <div className="absolute rounded-full bg-gray-800" 
                   style={{ 
                     width: '10px', 
                     height: '10px', 
                     top: '20px', 
                     left: '20px',
                     boxShadow: 'inset 0 0 2px #000, 0 0 0 1px rgba(0,0,0,0.3)'
                   }}>
                <div className="absolute inset-0 rounded-full bg-black opacity-70"></div>
              </div>
              
              {/* Top-right hole */}
              <div className="absolute rounded-full bg-gray-800" 
                   style={{ 
                     width: '10px', 
                     height: '10px', 
                     top: '20px', 
                     right: '20px',
                     boxShadow: 'inset 0 0 2px #000, 0 0 0 1px rgba(0,0,0,0.3)'
                   }}>
                <div className="absolute inset-0 rounded-full bg-black opacity-70"></div>
              </div>
              
              {/* Bottom-left hole */}
              <div className="absolute rounded-full bg-gray-800" 
                   style={{ 
                     width: '10px', 
                     height: '10px', 
                     bottom: '20px', 
                     left: '20px',
                     boxShadow: 'inset 0 0 2px #000, 0 0 0 1px rgba(0,0,0,0.3)'
                   }}>
                <div className="absolute inset-0 rounded-full bg-black opacity-70"></div>
              </div>
              
              {/* Bottom-right hole */}
              <div className="absolute rounded-full bg-gray-800" 
                   style={{ 
                     width: '10px', 
                     height: '10px', 
                     bottom: '20px', 
                     right: '20px',
                     boxShadow: 'inset 0 0 2px #000, 0 0 0 1px rgba(0,0,0,0.3)'
                   }}>
                <div className="absolute inset-0 rounded-full bg-black opacity-70"></div>
              </div>
            </>
          )}
        </div>
        
        {/* Dimensions labels */}
        <div className="absolute top-full left-0 right-0 text-center text-sm text-gray-600 mt-4">
          {length} x {width} x {thickness} mm
        </div>
        
        {/* Side surfaces to create 3D effect */}
        <div
          className="absolute bg-neutral-700 opacity-80"
          style={{
            width: `${scaledThickness}px`,
            height: `${scaledWidth}px`,
            transform: `translateX(${scaledLength}px) rotateY(90deg) translateZ(${scaledThickness/2}px)`,
            transformOrigin: 'left center',
          }}
        ></div>
        
        <div
          className="absolute bg-neutral-800 opacity-80"
          style={{
            width: `${scaledLength}px`,
            height: `${scaledThickness}px`,
            transform: `translateY(${scaledWidth}px) rotateX(90deg) translateZ(${scaledThickness/2}px)`,
            transformOrigin: 'top center',
          }}
        ></div>
      </div>
    </div>
  );
};

export default BoardVisualization;
