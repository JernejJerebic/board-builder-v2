
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
  const scale = 0.375; // 1mm = 0.375px
  
  // Determine if board should be rotated (length < width)
  const shouldRotate = length < width;
  
  // Use correct dimensions depending on rotation
  const displayLength = shouldRotate ? width : length;
  const displayWidth = shouldRotate ? length : width;
  
  const scaledLength = displayLength * scale;
  const scaledWidth = displayWidth * scale;
  const scaledThickness = thickness * scale;

  // Calculate hole positioning - same ratio (20% from sides, 5% from top)
  const holeInsetX = Math.max(scaledLength * 0.2, 20); // 20% from left/right sides
  const holeInsetY = Math.max(scaledWidth * 0.05, 10); // 5% from top
  const holeSize = 10;

  // Update board visualization whenever props change
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
    }
    
    updateBoardVisualization();
  }, [color, length, width, thickness, borders, drilling, shouldRotate]);

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
      boardRef.current.style.backgroundColor = color.htmlColor || '#d2b48c';
      boardRef.current.style.backgroundImage = 'none'; // Clear any previous image
    } else {
      boardRef.current.style.backgroundColor = '#d2b48c'; // Default wood color
    }
  };

  // Transform borders if rotated
  const rotatedBorders = shouldRotate ? {
    top: borders.left,
    right: borders.top,
    bottom: borders.right,
    left: borders.bottom
  } : borders;

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
            backgroundImage: 'none',
            border: '1px solid rgba(0,0,0,0.2)'
          }}
        >
          {/* Wood texture or color image as absolute overlay */}
          {color?.imageUrl && (
            <div 
              className="absolute inset-0 z-0" 
              style={{ 
                backgroundImage: `url(${color.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                transform: shouldRotate ? 'rotate(90deg)' : 'none',
                transformOrigin: 'center'
              }}
            />
          )}
          
          {/* Borders */}
          {rotatedBorders.top && (
            <div className="absolute top-0 left-0 right-0 h-2 bg-gray-300 border border-gray-400 z-10" 
                 style={{ transform: 'translateY(-1px)' }}></div>
          )}
          {rotatedBorders.right && (
            <div className="absolute top-0 bottom-0 right-0 w-2 bg-gray-300 border border-gray-400 z-10" 
                 style={{ transform: 'translateX(1px)' }}></div>
          )}
          {rotatedBorders.bottom && (
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 border border-gray-400 z-10" 
                 style={{ transform: 'translateY(1px)' }}></div>
          )}
          {rotatedBorders.left && (
            <div className="absolute top-0 bottom-0 left-0 w-2 bg-gray-300 border border-gray-400 z-10" 
                 style={{ transform: 'translateX(-1px)' }}></div>
          )}
          
          {/* Drilling holes - positioned along the top side */}
          {drilling && (
            <>
              {/* Left top hole */}
              <div className="absolute rounded-full bg-gray-800 z-10" 
                   style={{ 
                     width: `${holeSize}px`, 
                     height: `${holeSize}px`, 
                     top: `${holeInsetY}px`, 
                     left: `${holeInsetX}px`,
                     boxShadow: 'inset 0 0 2px #000, 0 0 0 1px rgba(0,0,0,0.3)'
                   }}>
                <div className="absolute inset-0 rounded-full bg-black opacity-70"></div>
              </div>
              
              {/* Right top hole */}
              <div className="absolute rounded-full bg-gray-800 z-10" 
                   style={{ 
                     width: `${holeSize}px`, 
                     height: `${holeSize}px`, 
                     top: `${holeInsetY}px`, 
                     right: `${holeInsetX}px`,
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
          {shouldRotate && <span className="ml-2 text-xs">(rotated)</span>}
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
