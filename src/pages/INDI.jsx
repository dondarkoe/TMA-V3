
import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Award, User, FileText, Target, Palette, Users } from 'lucide-react';
import KoeToolCard from '../components/koe/KoeToolCard';

export default function IndiDashboard() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-7xl mx-auto pb-4 sm:pb-8 space-y-2 sm:space-y-6 relative px-4 sm:px-6">
      {/* Sticky Back Button - Mobile optimized */}
      <div className="fixed top-20 sm:top-24 left-4 sm:left-6 z-[90]">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="text-white/90 hover:text-white hover:bg-white/20 rounded-xl backdrop-blur-xl bg-black/40 border border-white/20 shadow-lg transition-all duration-200 hover:scale-105 w-10 h-10 sm:w-11 sm:h-11"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      {/* Green Robot Character Background - Hide on mobile for performance */}
      <div className="fixed inset-0 z-0 pointer-events-none hidden md:block" style={{ opacity: 0.4 }}>
        <iframe 
          src="https://my.spline.design/1robot-Gy0UbqfxO9S1L46S65deY1me/" 
          frameBorder="0" 
          width="100%" 
          height="100%"
          loading="lazy"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            border: 'none',
            pointerEvents: 'none'
          }}
          title="Green Robot Character Background"
        />
      </div>

      <section id="tools" className="fade-in relative z-10 px-0 sm:px-4">
        <div className="text-center mb-3 sm:mb-8 px-4">
          <h2 className="text-xs sm:text-sm font-light text-white text-opacity-70 mb-1 sm:mb-2 uppercase tracking-widest">
            Brand Identity Suite
          </h2>
          <p className="text-xl sm:text-3xl md:text-4xl font-extralight text-white tracking-tight">Brand Assistant</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {/* Brand Identity Analysis */}
          <div className="lg:col-span-2">
            <KoeToolCard
              title="Brand Identity Analysis"
              description="Discover your unique brand archetype and develop a compelling artistic identity."
              icon={User}
              isActive={false}
              delay={0.1} />
          </div>
          
          {/* EPK Generator */}
          <KoeToolCard
            title="EPK Generator"
            description="Create professional Electronic Press Kits with templates and automated formatting."
            icon={FileText}
            isActive={false}
            delay={0.2} />

          {/* Target Audience */}
          <KoeToolCard
            title="Audience Targeting"
            description="Identify and understand your ideal audience demographics and preferences."
            icon={Target}
            isActive={false}
            delay={0.3} />

          {/* Visual Identity */}
          <KoeToolCard
            title="Visual Identity"
            description="Develop consistent visual branding elements including colors, fonts, and imagery."
            icon={Palette}
            isActive={false}
            delay={0.4} />
        </div>
      </section>
    </div>
  );
}
