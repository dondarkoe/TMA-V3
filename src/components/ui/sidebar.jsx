import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sidebar Context for state management
const SidebarContext = createContext({
  isOpen: false,
  toggle: () => {},
  close: () => {},
  open: () => {},
  isMobile: false
});

// Provider component that manages sidebar state
export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Make sure window is available (for SSR)
      if (typeof window !== 'undefined') {
        const mobile = window.innerWidth < 768; // md breakpoint
        setIsMobile(mobile);
        
        // Auto-close sidebar on resize to desktop
        if (!mobile && isOpen) {
          setIsOpen(false);
        }
        
        console.log('Mobile check:', { mobile, width: window.innerWidth }); // Debug log
      }
    };

    // Initial check with slight delay to ensure proper detection
    const timer = setTimeout(checkMobile, 100);
    
    window.addEventListener('resize', checkMobile);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isOpen]);

  const toggle = () => {
    console.log('Sidebar toggle:', { isMobile, currentlyOpen: isOpen }); // Debug log
    setIsOpen(!isOpen);
  };
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close, open, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Hook to use sidebar context
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

// Main Sidebar component
export function Sidebar({ children, className = '', ...props }) {
  const { isOpen, close, isMobile } = useSidebar();

  console.log('Sidebar render:', { isOpen, isMobile }); // Debug log

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {/* Desktop: always show, Mobile: only when open */}
      <AnimatePresence mode="wait">
        {(!isMobile || isOpen) && (
          <motion.aside
            key="sidebar"
            initial={isMobile ? { x: -320 } : { opacity: 1 }}
            animate={isMobile ? { x: 0 } : { opacity: 1 }}
            exit={isMobile ? { x: -320 } : { opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`
              ${isMobile ? 'fixed left-0 top-0 h-full z-50' : 'relative z-10'}
              w-80 flex-shrink-0 ${className}
            `}
            {...props}
          >
            {children}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// Sidebar Header component
export function SidebarHeader({ children, className = '', ...props }) {
  return (
    <div 
      className={`flex-shrink-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Sidebar Content component (scrollable area)
export function SidebarContent({ children, className = '', ...props }) {
  return (
    <div 
      className={`flex-1 overflow-y-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Sidebar Footer component
export function SidebarFooter({ children, className = '', ...props }) {
  return (
    <div 
      className={`flex-shrink-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Sidebar Group component (for organizing content)
export function SidebarGroup({ children, className = '', ...props }) {
  return (
    <div 
      className={`${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Sidebar Menu component
export function SidebarMenu({ children, className = '', ...props }) {
  return (
    <nav 
      className={`space-y-1 ${className}`}
      {...props}
    >
      {children}
    </nav>
  );
}

// Sidebar Menu Item component
export function SidebarMenuItem({ children, className = '', ...props }) {
  return (
    <div 
      className={`${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Sidebar Menu Button component
export function SidebarMenuButton({ 
  children, 
  isActive = false, 
  onClick,
  className = '', 
  ...props 
}) {
  const { close, isMobile } = useSidebar();
  
  const handleClick = (e) => {
    // Call the original onClick if provided
    if (onClick) {
      onClick(e);
    }
    
    // Auto-close sidebar on mobile when navigation item is clicked
    if (isMobile) {
      close();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-white/15 border border-white/30 text-white shadow-lg' 
          : 'text-white/80 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20'
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// Mobile Sidebar Trigger (hamburger menu button)
export function SidebarTrigger({ className = '', ...props }) {
  const { toggle, isMobile } = useSidebar();

  console.log('SidebarTrigger render:', { isMobile }); // Debug log

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Hamburger clicked!'); // Debug log
        toggle();
      }}
      className={`
        md:hidden p-3 rounded-xl backdrop-blur-xl bg-black/70 border border-white/30 
        text-white/90 hover:text-white hover:bg-black/90 shadow-2xl 
        transition-all duration-200 ${className}
      `}
      {...props}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}