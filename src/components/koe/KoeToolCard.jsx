import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Headphones } from 'lucide-react'; // Add default icon

export default function KoeToolCard({
  title,
  subtitle,
  description,
  icon: Icon = Headphones, // Provide default icon
  delay = 0,
  href,
  onClick,
  isActive = true,
  isSpecial = false,
  colorTheme = 'blue' // New prop for color theme
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleClick = useCallback(() => {
    if (isActive && onClick) {
      onClick();
    }
  }, [onClick, isActive]);

  // Color theme configurations
  const colorThemes = {
    blue: {
      primary: 'rgba(59, 130, 246, 0.5)',
      secondary: 'rgba(59, 130, 246, 0.3)',
      tertiary: 'rgba(59, 130, 246, 0.2)',
      text: 'text-blue-300',
      specialRing: 'ring-blue-500/50',
      specialShadow: 'shadow-blue-500/20'
    },
    orange: {
      primary: 'rgba(249, 115, 22, 0.5)',
      secondary: 'rgba(249, 115, 22, 0.3)',
      tertiary: 'rgba(249, 115, 22, 0.2)',
      text: 'text-orange-300',
      specialRing: 'ring-orange-500/50',
      specialShadow: 'shadow-orange-500/20'
    }
  };

  const theme = colorThemes[colorTheme] || colorThemes.blue;

  const CardContentComponent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="h-full"
      style={{ animationDelay: `${delay * 150}ms` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={isActive && onClick ? handleClick : undefined}
    >
      <Card
        className={`glass-card rounded-2xl overflow-hidden transition-all duration-500 flex flex-col will-change-transform relative h-full ${
          !isActive ? 'opacity-60' : 'cursor-pointer'
        } ${
          isSpecial ? `ring-2 ${theme.specialRing} shadow-2xl ${theme.specialShadow}` : ''
        }`}
        style={{
          minHeight: isSpecial ? '120px' : '100px',
          transform: isHovered && isActive ? 'scale(1.02) translateY(-4px)' : 'scale(1) translateY(0)',
          boxShadow: isSpecial ?
            isHovered && isActive ? `0 25px 50px -12px ${theme.primary}, 0 0 40px ${theme.secondary}` : `0 15px 40px ${theme.secondary}, 0 0 20px ${theme.tertiary}` :
            isHovered && isActive ? `0 15px 30px -12px ${theme.secondary}` : '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Enhanced gradient overlay for special cards */}
        <div
          className={`absolute inset-0 transition-opacity duration-300`}
          style={{
            background: `radial-gradient(circle at center, ${theme.primary} 0%, transparent 70%)`,
            opacity: isHovered && isActive ? isSpecial ? 0.8 : 0.6 : isSpecial ? 0.5 : 0.3
          }} 
        />

        {/* Animated shimmer effect for special cards */}
        {isSpecial && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse"></div>
        )}
        
        <div className="relative p-2 sm:p-6 h-full flex flex-col justify-between z-30">
          {/* Header with Icon - Enhanced for special cards */}
          <div className="flex justify-between items-start mb-1 sm:mb-4">
            <div 
              className={`${isSpecial ? 'w-8 h-8 sm:w-14 sm:h-14' : 'w-6 h-6 sm:w-12 sm:h-12'} rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300`}
              style={{
                background: isSpecial ? `linear-gradient(135deg, ${theme.tertiary}, ${theme.secondary})` : theme.tertiary,
                border: `1px solid ${theme.secondary}`,
                transform: isHovered && isActive ? 'rotate(5deg) scale(1.05)' : 'rotate(0deg) scale(1)'
              }}
            >
              <Icon className={`${isSpecial ? 'w-4 h-4 sm:w-7 sm:h-7' : 'w-3 h-3 sm:w-6 sm:h-6'} ${theme.text}`} />
            </div>
          </div>

          {/* Main Content - Enhanced for special cards */}
          <div className="flex-grow flex flex-col">
            <h3 
              className="text-white mb-0 text-base font-semibold sm:text-2xl tracking-tight sm:mb-3 transition-transform duration-300 leading-tight"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 200,
                transform: isHovered && isActive ? 'translateX(4px)' : 'translateX(0)'
              }}
            >
              {title}
            </h3>
            {/* Enhanced subtitle for special cards */}
            {subtitle && (
              <p
                className={`hidden sm:block text-xs sm:text-sm ${
                  !isActive ? 'text-gray-500' : isSpecial ? `${theme.text} font-semibold` : theme.text
                } font-medium mb-2 transition-transform duration-300`}
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: isSpecial ? 600 : 500,
                  transform: isHovered && isActive ? 'translateX(3px)' : 'translateX(0)'
                }}
              >
                {subtitle}
              </p>
            )}
            <p
              className={`${isSpecial ? theme.text.replace('300', '100') : theme.text.replace('300', '200')} leading-relaxed text-xs sm:text-sm transition-transform duration-300 flex-grow hidden sm:block`}
              style={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 400,
                transform: isHovered && isActive ? 'translateX(2px)' : 'translateX(0)'
              }}
            >
              {description}
            </p>
          </div>

          {/* Footer - Enhanced for special cards */}
          <div className="mt-1 sm:mt-4 pt-1 sm:pt-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div 
                className={`inline-flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-md transition-all duration-300`}
                style={{
                  background: isSpecial ? `linear-gradient(135deg, ${theme.tertiary}, ${theme.secondary})` : theme.tertiary,
                  border: `1px solid ${theme.secondary}`,
                  transform: isHovered && isActive ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <div className={`w-1 h-1 sm:w-2 sm:h-2 rounded-full ${
                  isActive ? isSpecial ? theme.text.replace('300', '400') : 'bg-green-400' : 'bg-gray-500'
                } ${
                  isActive ? 'animate-pulse' : ''
                }`}></div>
                <span
                  className={`text-xs tracking-wider font-semibold ${
                    isActive ? isSpecial ? theme.text : 'text-green-300' : 'text-gray-400'
                  }`}
                  style={{ fontFamily: '"Inter", sans-serif', fontSize: '10px' }}
                >
                  {isActive ? 'READY' : 'SOON'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (href && isActive) {
    return <Link to={href} className="will-change-transform">{CardContentComponent}</Link>;
  }

  return CardContentComponent;
}