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
  const prevRotateState = useRef<boolean | null>(null);

  const MIN_LENGTH = 200;
  const MAX_LENGTH = 2760;
  const MIN_WIDTH = 70;
  const MAX_WIDTH = 1200;

  const length = Math.max(MIN_LENGTH, Math.min(rawLength, MAX_LENGTH));
  const width = Math.max(MIN_WIDTH, Math.min(rawWidth, MAX_WIDTH));

  const MAX_VISUALIZATION_HEIGHT = 500;

  const maxDimension = Math.max(width, length);
  const baseScale = 0.375;
  const heightLimitScale = MAX_VISUALIZATION_HEIGHT / maxDimension;

  const scale = Math.min(baseScale, heightLimitScale);
  const scaledLength = length * scale;
  const scaledWidth = width * scale;
  const scaledThickness = thickness * scale;

  const shouldRotate = length > width;

  const holeInsetX = Math.max(scaledLength * 0.2, 20);
  const holeInsetY = Math.max(scaledWidth * 0.05, 10);
  const holeSize = 10;

  const isLandscape = length > width;

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      prevRotateState.current = shouldRotate;
    }
    updateBoardVisualization();

    prevRotateState.current = shouldRotate;
  }, [color, length, width, thickness, borders, drilling, shouldRotate]);

  const updateBoardVisualization = () => {
    if (!boardRef.current) return;

    boardRef.current.style.width = `${scaledLength}px`;
    boardRef.current.style.height = `${scaledWidth}px`;

    const rotationAngle = shouldRotate ? 90 : 0;

    boardRef.current.style.transform = `perspective(1000px) rotateX(45deg) rotateZ(${rotationAngle}deg)`;

    if (shouldRotate) {
      boardRef.current.style.boxShadow = `${scaledThickness}px 0 0 #a0826c`;
    } else {
      boardRef.current.style.boxShadow = `0 ${scaledThickness}px 0 #a0826c`;
    }

    if (color) {
      boardRef.current.style.backgroundColor = color.htmlColor || '#d2b48c';
      boardRef.current.style.backgroundImage = 'none';
    } else {
      boardRef.current.style.backgroundColor = '#d2b48c';
    }
  };

  const adjustedBorders = shouldRotate ? {
    top: borders.left,
    right: borders.bottom,
    bottom: borders.right,
    left: borders.top
  } : borders;

  const leftHolePosition = shouldRotate ? {
    top: holeInsetX,
    left: holeInsetY
  } : {
    top: holeInsetY,
    left: holeInsetX
  };

  const rightHolePosition = shouldRotate ? {
    top: scaledWidth - holeInsetX,
    left: holeInsetY
  } : {
    top: holeInsetY,
    right: holeInsetX
  };

  return <div className="board-visualization-container flex justify-center items-center my-8" ref={containerRef}>
      <div className="board-wrapper relative">
        <div ref={boardRef} className={`board-main relative ${shouldRotate ? 'board-rotated' : 'board-normal'}`} style={{
          width: `${scaledLength}px`,
          height: `${scaledWidth}px`,
          transform: shouldRotate ? 'perspective(1000px) rotateX(45deg) rotateZ(90deg)' : 'perspective(1000px) rotateX(45deg) rotateZ(0deg)',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
          boxShadow: shouldRotate ? `${scaledThickness}px 0 0 #a0826c` : `0 ${scaledThickness}px 0 #a0826c`,
          backgroundColor: color?.htmlColor || '#d2b48c',
          backgroundImage: 'none',
          border: '1px solid rgba(0,0,0,0.2)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}>
          {color?.imageUrl && <div className="board-texture absolute z-0 overflow-hidden" style={isLandscape ? {
            width: `${scaledWidth}px`,
            height: `${scaledLength}px`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(90deg)',
            backgroundImage: `url(${color.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : {
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${color.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }} />}
          
          {adjustedBorders.top && <div className="board-border board-border-top absolute top-0 left-0 right-0 h-2 bg-black/30 dark:bg-white/30 z-10" style={{
            transform: 'translateY(-1px)'
          }}></div>}
          {adjustedBorders.right && <div className="board-border board-border-right absolute top-0 bottom-0 right-0 w-2 bg-black/30 dark:bg-white/30 z-10" style={{
            transform: 'translateX(1px)'
          }}></div>}
          {adjustedBorders.bottom && <div className="board-border board-border-bottom absolute bottom-0 left-0 right-0 h-2 bg-black/30 dark:bg-white/30 z-10" style={{
            transform: 'translateY(1px)'
          }}></div>}
          {adjustedBorders.left && <div className="board-border board-border-left absolute top-0 bottom-0 left-0 w-2 bg-black/30 dark:bg-white/30 z-10" style={{
            transform: 'translateX(-1px)'
          }}></div>}
          
          {drilling && <>
              <div className="board-hole board-hole-left absolute rounded-full bg-gray-800 z-10" style={{
                width: `${holeSize}px`,
                height: `${holeSize}px`,
                top: shouldRotate ? `${leftHolePosition.top}px` : `${leftHolePosition.top}px`,
                ...(shouldRotate ? {
                  left: `${leftHolePosition.left}px`
                } : {
                  left: `${leftHolePosition.left}px`
                }),
                boxShadow: 'inset 0 0 2px #000, 0 0 0 1px rgba(0,0,0,0.3)'
              }}>
                <div className="board-hole-inner absolute inset-0 rounded-full bg-black opacity-70"></div>
              </div>
              
              <div className="board-hole board-hole-right absolute rounded-full bg-gray-800 z-10" style={{
                width: `${holeSize}px`,
                height: `${holeSize}px`,
                top: shouldRotate ? `${rightHolePosition.top}px` : `${rightHolePosition.top}px`,
                ...(shouldRotate ? {
                  left: `${rightHolePosition.left}px`
                } : {
                  right: `${rightHolePosition.right}px`
                }),
                boxShadow: 'inset 0 0 2px #000, 0 0 0 1px rgba(0,0,0,0.3)'
              }}>
                <div className="board-hole-inner absolute inset-0 rounded-full bg-black opacity-70"></div>
              </div>
            </>}
        </div>
        
        <div className="board-dimensions absolute top-full left-0 right-0 text-center text-sm text-gray-600 mt-4 hidden">
          {rawLength} x {rawWidth} x {thickness} mm
          {(rawLength !== length || rawWidth !== width) && <span className="board-dimensions-adjusted block text-amber-600">
              (prilagojeno na {length} x {width} mm)
            </span>}
        </div>
        
        <div className="board-side board-side-right absolute bg-neutral-700 opacity-80" style={{
          width: `${scaledThickness}px`,
          height: `${scaledWidth}px`,
          transform: `translateX(${scaledLength}px) rotateY(90deg) translateZ(${scaledThickness / 2}px)`,
          transformOrigin: 'left center',
          transition: 'transform 0.3s ease'
        }}></div>
        
        <div className="board-side board-side-bottom absolute bg-neutral-800 opacity-80" style={{
          width: `${scaledLength}px`,
          height: `${scaledThickness}px`,
          transform: `translateY(${scaledWidth}px) rotateX(90deg) translateZ(${scaledThickness / 2}px)`,
          transformOrigin: 'top center',
          transition: 'transform 0.3s ease'
        }}></div>
      </div>
    </div>;
};

export default BoardVisualization;
