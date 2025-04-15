
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
  length: rawLength,
  width: rawWidth,
  thickness,
  borders,
  drilling
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const isInitialRender = useRef(true);

  // Apply constraints to length and width
  const MIN_LENGTH = 200;
  const MAX_LENGTH = 2760;
  const MIN_WIDTH = 70;
  const MAX_WIDTH = 1200;
  
  // Constrain dimensions to allowed ranges
  const length = Math.max(MIN_LENGTH, Math.min(rawLength, MAX_LENGTH));
  const width = Math.max(MIN_WIDTH, Math.min(rawWidth, MAX_WIDTH));

  // Convert real-world dimensions to visualization scale
  const scale = 0.375; // 1mm = 0.375px
  
  const scaledLength = length * scale;
  const scaledWidth = width * scale;
  const scaledThickness = thickness * scale;

  // Determine if the board needs to be rotated (length > width)
  const shouldRotate = length > width;

  // Calculate hole positioning
  const holeInsetX = Math.max(scaledLength * 0.2, 20); // 20% from left/right sides
  const holeInsetY = Math.max(scaledWidth * 0.05, 10);   // 5% from top
  const holeSize = 10;

  // Determine if the board is landscape oriented (length greater than width)
  const isLandscape = length > width;

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
    
    // Apply rotation if length > width
    if (shouldRotate) {
      boardRef.current.style.transform = `perspective(1000px) rotateX(45deg) rotateZ(90deg)`;
    } else {
      boardRef.current.style.transform = `perspective(1000px) rotateX(45deg) rotateZ(0deg)`;
    }
    
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

  // Create adjusted borders based on rotation
  const adjustedBorders = shouldRotate ? {
    top: borders.left,
    right: borders.top,
    bottom: borders.right,
    left: borders.bottom
  } : borders;

  // Calculate dynamic position for the right hole when rotated
  // When the board is rotated, the right hole needs position adjustments
  const rightHolePosition = shouldRotate 
    ? { top: scaledWidth - holeInsetX, left: holeInsetY } // When rotated, use left and top
    : { top: holeInsetY, right: holeInsetX }; // Normal position using top and right

  return (
    <div className="board-visualization-container flex justify-center items-center my-8" ref={containerRef}>
      <div className="board-wrapper relative" style={{ height: `${scaledWidth + scaledThickness + 60}px` }}>
        {/* The wooden board */}
        <div
          ref={boardRef}
          className={`board-main relative transition-all duration-300 ${shouldRotate ? 'board-rotated' : 'board-normal'}`}
          style={{
            width: `${scaledLength}px`,
            height: `${scaledWidth}px`,
            transform: shouldRotate 
              ? 'perspective(1000px) rotateX(45deg) rotateZ(90deg)'
              : 'perspective(1000px) rotateX(45deg) rotateZ(0deg)',
            transformStyle: 'preserve-3d',
            transformOrigin: 'center center',
            boxShadow: `0 ${scaledThickness}px 0 #a0826c`,
            backgroundColor: color?.htmlColor || '#d2b48c',
            backgroundImage: 'none',
            border: '1px solid rgba(0,0,0,0.2)'
          }}
        >
          {/* Wood texture or color image as absolute overlay */}
          {color?.imageUrl && (
            <div 
              className="board-texture absolute z-0 overflow-hidden"
              style={
                isLandscape
                ? {
                    // Swap dimensions when board is landscape:
                    // width becomes scaledWidth and height becomes scaledLength.
                    width: `${scaledWidth}px`,
                    height: `${scaledLength}px`,
                    top: '50%',
                    left: '50%',
                    // Center and rotate the image 90deg
                    transform: 'translate(-50%, -50%) rotate(90deg)',
                    backgroundImage: `url(${color.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }
                : {
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${color.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }
              }
            />
          )}
          
          {/* Borders - using adjusted borders based on rotation */}
          {adjustedBorders.top && (
            <div className="board-border board-border-top absolute top-0 left-0 right-0 h-2 bg-gray-300 border border-gray-400 z-10" 
                 style={{ transform: 'translateY(-1px)' }}></div>
          )}
          {adjustedBorders.right && (
            <div className="board-border board-border-right absolute top-0 bottom-0 right-0 w-2 bg-gray-300 border border-gray-400 z-10" 
                 style={{ transform: 'translateX(1px)' }}></div>
          )}
          {adjustedBorders.bottom && (
            <div className="board-border board-border-bottom absolute bottom-0 left-0 right-0 h-2 bg-gray-300 border border-gray-400 z-10" 
                 style={{ transform: 'translateY(1px)' }}></div>
          )}
          {adjustedBorders.left && (
            <div className="board-border board-border-left absolute top-0 bottom-0 left-0 w-2 bg-gray-300 border border-gray-400 z-10" 
                 style={{ transform: 'translateX(-1px)' }}></div>
          )}
          
          {/* Drilling holes - positioned along the top side with adjusted positions based on rotation */}
          {drilling && (
            <>
              {/* Left top hole */}
              <div className="board-hole board-hole-left absolute rounded-full bg-gray-800 z-10" 
                   style={{ 
                     width: `${holeSize}px`, 
                     height: `${holeSize}px`, 
                     top: `${holeInsetY}px`, 
                     left: `${holeInsetX}px`,
                     boxShadow: 'inset 0 0 2px #000, 0 0 0 1px rgba(0,0,0,0.3)'
                   }}>
                <div className="board-hole-inner absolute inset-0 rounded-full bg-black opacity-70"></div>
              </div>
              
              {/* Right top hole - position adjusted based on rotation */}
              <div className="board-hole board-hole-right absolute rounded-full bg-gray-800 z-10" 
                   style={{ 
                     width: `${holeSize}px`, 
                     height: `${holeSize}px`, 
                     top: shouldRotate ? `${rightHolePosition.top}px` : `${rightHolePosition.top}px`,
                     ...(shouldRotate 
                        ? { left: '11.25px' } // When rotated, use fixed left position 
                        : { right: `${rightHolePosition.right}px` }), // Otherwise use calculated right position
                     boxShadow: 'inset 0 0 2px #000, 0 0 0 1px rgba(0,0,0,0.3)'
                   }}>
                <div className="board-hole-inner absolute inset-0 rounded-full bg-black opacity-70"></div>
              </div>
            </>
          )}
        </div>
        
        {/* Dimensions labels */}
        <div className="board-dimensions absolute top-full left-0 right-0 text-center text-sm text-gray-600 mt-4">
          {rawLength} x {rawWidth} x {thickness} mm
          {(rawLength !== length || rawWidth !== width) && (
            <span className="board-dimensions-adjusted block text-amber-600">
              (prilagojeno na {length} x {width} mm)
            </span>
          )}
        </div>
        
        {/* Side surfaces to create 3D effect */}
        <div
          className="board-side board-side-right absolute bg-neutral-700 opacity-80"
          style={{
            width: `${scaledThickness}px`,
            height: `${scaledWidth}px`,
            transform: `translateX(${scaledLength}px) rotateY(90deg) translateZ(${scaledThickness/2}px)`,
            transformOrigin: 'left center',
          }}
        ></div>
        
        <div
          className="board-side board-side-bottom absolute bg-neutral-800 opacity-80"
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
