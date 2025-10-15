import React from 'react';

export default function SplineBackground({ opacity = 0.3, zIndex = -1 }) {
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ 
        zIndex: zIndex,
        opacity: opacity
      }}
    >
      <iframe 
        src="https://my.spline.design/particles-7fClI8JKHCsNWrvYPyooKtld/" 
        frameBorder="0" 
        width="100%" 
        height="100%"
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          border: 'none',
          pointerEvents: 'none' // Ensures clicks pass through to underlying elements
        }}
        title="3D Background Animation"
      />
    </div>
  );
}