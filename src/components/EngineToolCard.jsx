
import React, { useState, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react'; // Assuming lucide-react for the Lock icon

export default function EngineToolCard({
  engineName, // Changed from 'title'
  logoUrl, // New prop for image URL
  subtitle,
  description,
  status,
  colorName,
  icon: Icon,
  delay = 0,
  href,
  onClick, // New prop for click handler
  disabled = false, // New prop for disabling the card
  requiredLevel, // New prop: minimum membership level required
  userLevel // New prop: current user's membership level
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (!disabled) { // Only allow hover effect if not disabled
      setIsHovered(true);
    }
  }, [disabled]);

  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleClick = useCallback(() => {
    if (disabled) return; // Don't handle clicks if disabled

    if (onClick) {
      onClick(); // Use onClick handler if provided
    } else if (href) {
      // Fallback to href navigation for external links or if not using react-router-dom for this specific instance
      window.location.href = href;
    }
  }, [disabled, onClick, href]);

  const themes = {
    blue: {
      glowColor: 'rgba(59, 130, 246, 0.4)',
      textColor: 'text-white',
      accentColor: 'text-blue-300',
      logoBgColor: 'bg-[#14244d]' // Dark blue for KOE - This will be removed, but keeping in themes object for consistency
    },
    orange: {
      glowColor: 'rgba(249, 115, 22, 0.4)',
      textColor: 'text-white',
      accentColor: 'text-orange-300',
      logoBgColor: 'bg-[#3c1e13]' // Dark orange for ARK - This will be removed, but keeping in themes object for consistency
    },
    green: {
      glowColor: 'rgba(16, 185, 129, 0.4)',
      textColor: 'text-white',
      accentColor: 'text-emerald-300',
      logoBgColor: 'bg-[#143028]' // Dark green for INDI - This will be removed, but keeping in themes object for consistency
    }
  };

  const theme = themes[colorName];

  // Determine if card should be clickable
  const isClickable = (href || onClick) && !disabled;

  const CardContent =
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="h-full"
      style={{ animationDelay: `${delay * 150}ms` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <Card
        className={`glass-card rounded-2xl overflow-hidden transition-all duration-500 flex flex-col will-change-transform relative ${disabled ? 'opacity-50 cursor-not-allowed' : isClickable ? 'cursor-pointer' : 'cursor-default'}`}
        style={{
          minHeight: '0px',
          transform: isHovered && !disabled ? 'scale(1.02) translateY(-4px)' : 'scale(1) translateY(0)',
          boxShadow: isHovered && !disabled ? '0 14px 28px -12px rgba(0, 0, 0, 0.5)' : '0 4px 18px 0 rgba(0, 0, 0, 0.35)'
        }}
      >
        {/* Disabled overlay */}
        {disabled &&
          <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center">
            <div className="text-center p-2">
              <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-1">
                <Lock className="w-3 h-3 text-red-400" />
              </div>
              <p className="text-white font-semibold text-[10px]">Access Required</p>
              <p className="text-gray-300 text-[10px]">Requires {requiredLevel}</p>
              <p className="text-gray-400 text-[10px]">Current: {userLevel || 'guest'}</p>
            </div>
          </div>
        }

        {/* Subtle glow */}
        <div
          className="absolute inset-0 transition-all duration-300 z-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${theme.glowColor} 0%, transparent 70%)`,
            opacity: isHovered && !disabled ? 0.16 : 0.06
          }}
        />

        {/* MAIN: Just the logo image filling the card - REDUCED HEIGHT */}
        <div className="relative z-20 w-full">
          <div className="w-full h-24 sm:h-28 md:h-32 flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${engineName} Logo`}
                className="w-full h-full object-cover"
                style={{
                  filter: `drop-shadow(0 0 6px ${theme.glowColor})`,
                  transform: isHovered && !disabled ? 'scale(1.01)' : 'scale(1)',
                  transition: 'transform 200ms ease'
                }}
                loading="lazy"
              />
            ) : (
              <div className="text-white/80 text-sm sm:text-base">{engineName}</div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>;


  // Only wrap with Link if href is provided and no custom onClick handler,
  // indicating react-router-dom should handle the navigation.
  if (href && !onClick && isClickable) {
    return <Link to={href} className="will-change-transform">{CardContent}</Link>;
  }

  // Return the card content directly (it has its own onClick handler or is not clickable)
  return CardContent;
}
