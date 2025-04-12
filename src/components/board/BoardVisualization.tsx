
import React, { useEffect, useState } from 'react';
import { Color } from '@/types';
import { cn } from '@/lib/utils';

interface BoardVisualizationProps {
  color: Color | null;
  length: number;
  width: number;
  thickness: number;
  drilling: boolean;
  borders: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
}

const BoardVisualization: React.FC<BoardVisualizationProps> = ({
  color,
  length,
  width,
  thickness,
  drilling,
  borders
}) => {
  const [ratio, setRatio] = useState(1);
  const [rotated, setRotated] = useState(false);

  useEffect(() => {
    if (length && width) {
      setRotated(length < width);
      
      const maxDimension = Math.max(length, width);
      const newRatio = 300 / maxDimension;
      setRatio(newRatio);
    }
  }, [length, width]);

  const visualWidth = rotated ? width * ratio : width * ratio;
  const visualLength = rotated ? length * ratio : length * ratio;

  if (!color) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300">
        <p className="text-gray-500">Izberite barvo za vizualizacijo plošče</p>
      </div>
    );
  }

  const holeSize = 3;
  const holeDistanceFromEdge = 100 * ratio;

  return (
    <div className="h-[350px] w-full flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "transition-all duration-300 ease-out"
          )}
          style={{
            width: `${visualWidth}px`,
            height: `${visualLength}px`,
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `perspective(800px) rotateX(30deg)`,
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              backgroundColor: color.imageUrl ? 'transparent' : (color.htmlColor || '#d2b48c'),
              backgroundImage: color.imageUrl ? `url(${color.imageUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: rotated ? 'rotate(90deg)' : 'none',
              transformOrigin: 'center',
              width: '100%',
              height: '100%',
            }}
          />
          
          {borders.top && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700"></div>
          )}
          {borders.right && (
            <div className="absolute top-0 right-0 bottom-0 w-1 bg-gray-700"></div>
          )}
          {borders.bottom && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700"></div>
          )}
          {borders.left && (
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gray-700"></div>
          )}

          {drilling && (
            <>
              <div
                className="absolute w-3 h-3 rounded-full bg-black"
                style={{
                  left: `${holeDistanceFromEdge - holeSize/2}px`,
                  top: '20px',
                  zIndex: 10
                }}
              ></div>
              <div
                className="absolute w-3 h-3 rounded-full bg-black"
                style={{
                  right: `${holeDistanceFromEdge - holeSize/2}px`,
                  top: '20px',
                  zIndex: 10
                }}
              ></div>
            </>
          )}

          <div
            style={{
              position: 'absolute',
              bottom: `-${thickness * ratio * 1.2}px`,
              left: 0,
              right: 0,
              height: `${thickness * ratio * 1.2}px`,
              backgroundColor: color.htmlColor ? adjustColorBrightness(color.htmlColor, -20) : '#b69b7d',
              transform: 'rotateX(-90deg)',
              transformOrigin: 'top',
            }}
          ></div>

          <div
            style={{
              position: 'absolute',
              right: `-${thickness * ratio * 1.2}px`,
              top: 0,
              bottom: 0,
              width: `${thickness * ratio * 1.2}px`,
              backgroundColor: color.htmlColor ? adjustColorBrightness(color.htmlColor, -40) : '#8c7a63',
              transform: 'rotateY(90deg)',
              transformOrigin: 'left',
            }}
          ></div>
        </div>
      </div>

      <div className="absolute bottom-2 left-0 right-0 text-center text-sm text-gray-600">
        {length} x {width} x {thickness} mm
      </div>
    </div>
  );
};

function adjustColorBrightness(color: string, percent: number) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = (num >> 16) + percent;
  const g = ((num >> 8) & 0x00FF) + percent;
  const b = (num & 0x0000FF) + percent;
  
  const newR = r < 0 ? 0 : r > 255 ? 255 : r;
  const newG = g < 0 ? 0 : g > 255 ? 255 : g;
  const newB = b < 0 ? 0 : b > 255 ? 255 : b;
  
  return '#' + (newB | (newG << 8) | (newR << 16)).toString(16).padStart(6, '0');
}

export default BoardVisualization;
