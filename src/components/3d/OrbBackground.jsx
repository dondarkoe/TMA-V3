import React from 'react';

export default function OrbBackground({ opacity = 0.6, zIndex = -1, className = '' }) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ 
        zIndex: zIndex,
        opacity: opacity
      }}
    >
      <iframe 
        src="https://my.spline.design/reactiveorb-coVZBQHLuir3anqU8SDepEtZ/" 
        frameBorder="0" 
        width="100%" 
        height="100%"
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          border: 'none',
          pointerEvents: 'none'
        }}
        title="3D Orb Animation"
      />
    </div>
  );
}