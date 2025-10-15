import React from 'react';

export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, className = '', ...props }) {
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    if (onValueChange) {
      onValueChange([newValue]);
    }
  };

  const currentValue = Array.isArray(value) ? value[0] : value;
  const percentage = (currentValue - min) / (max - min) * 100;

  return (
    <div className={`relative w-full ${className}`} {...props}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange} className="slider-input w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"

        style={{
          background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${percentage}%, rgb(55, 65, 81) ${percentage}%, rgb(55, 65, 81) 100%)`
        }} />

      
      <style jsx>{`
        .slider-input::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(139, 92, 246), rgb(6, 182, 212));
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider-input::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(139, 92, 246), rgb(6, 182, 212));
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider-input::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
        }
        
        .slider-input::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: rgb(55, 65, 81);
        }
      `}</style>
    </div>);

}