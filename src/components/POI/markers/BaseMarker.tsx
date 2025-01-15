import React from 'react';

interface BaseMarkerProps {
  size?: number;
  color?: string;
  className?: string;
}

export const BaseMarker: React.FC<BaseMarkerProps> = ({ 
  size = 24, 
  color = '#000000',
  className = ''
}) => (
  <div className={`relative ${className}`}>
    <div className="absolute animate-ping w-full h-full rounded-full bg-current opacity-30" />
    <div className="relative rounded-full bg-current p-2">
      <div style={{ width: size, height: size, color }} />
    </div>
  </div>
);