
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

// Helper function to adjust color brightness for 3D effect
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

const BoardVisualization: React.FC<BoardVisualizationProps> = ({
  color,
  length,
  width,
  thickness,
  drilling,
  borders
}) => {
  const [ratio, setRatio] = useState(1);
  const [shouldRotate, setShouldRotate] = useState(false);

  useEffect(() => {
    if (length && width) {
      // Determine if board should be rotated based on dimensions
      setShouldRotate(length < width);
      
      // Calculate the scaling ratio based on the maximum dimension
      const maxDimension = Math.max(length, width);
      const newRatio = 300 / maxDimension;
      setRatio(newRatio);
    }
  }, [length, width]);

  // Calculate visual dimensions
  const visualWidth = shouldRotate ? width * ratio : length * ratio;
  const visualHeight = shouldRotate ? length * ratio : width * ratio;
  
  // Show placeholder when no color is selected
  if (!color) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300">
        <p className="text-gray-500">Izberite barvo za vizualizacijo plošče</p>
      </div>
    );
  }

  // Drilling hole configuration
  const holeSize = 3;
  const holeDistanceFromEdge = 100 * ratio;

  return (
    <div className="h-[350px] w-full flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* 3D board container with perspective */}
        <div
          className="transition-all duration-300 ease-out"
          style={{
            width: `${visualWidth}px`,
            height: `${visualHeight}px`,
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `perspective(800px) rotateX(30deg)`,
          }}
        >
          {/* Main board surface - top face */}
          <div 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: color.imageUrl ? 'transparent' : (color.htmlColor || '#d2b48c'),
              backgroundImage: color.imageUrl ? `url(${color.imageUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: shouldRotate ? 'rotate(90deg)' : 'none',
              transformOrigin: 'center',
              backfaceVisibility: 'hidden',
            }}
          >
            {/* Borders on top surface */}
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

            {/* Drilling holes */}
            {drilling && (
              <>
                <div
                  className="absolute w-3 h-3 rounded-full bg-black"
                  style={{
                    left: holeDistanceFromEdge - holeSize/2,
                    top: '20px',
                  }}
                ></div>
                <div
                  className="absolute w-3 h-3 rounded-full bg-black"
                  style={{
                    right: holeDistanceFromEdge - holeSize/2,
                    top: '20px',
                  }}
                ></div>
              </>
            )}
          </div>

          {/* Bottom edge - 3D effect */}
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
              backfaceVisibility: 'hidden',
            }}
          ></div>

          {/* Right edge - 3D effect */}
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
              backfaceVisibility: 'hidden',
            }}
          ></div>
        </div>
      </div>

      {/* Board dimensions label */}
      <div className="absolute bottom-2 left-0 right-0 text-center text-sm text-gray-600">
        {length} x {width} x {thickness} mm
      </div>
    </div>
  );
};

export default BoardVisualization;
