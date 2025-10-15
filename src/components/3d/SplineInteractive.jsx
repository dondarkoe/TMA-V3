import React from 'react';

export default function SplineInteractive({ 
  width = '60vw', 
  height = '40vh', 
  opacity = 0.9,
  className = '' 
}) {
  return (
    <div 
      className={`relative mx-auto ${className}`}
      style={{ 
        width: width,
        height: height,
        maxWidth: '800px',
        minHeight: '300px',
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
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)'
        }}
        title="Interactive 3D Animation"
        allow="accelerometer; gyroscope; magnetometer; vr; xr"
      />
    </div>
  );
}