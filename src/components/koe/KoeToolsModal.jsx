import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Music, BarChart3, GitCompare, Wrench } from 'lucide-react';
import { createPageUrl } from '@/utils';
import KoeToolCard from './KoeToolCard';

export default function KoeToolsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-2 sm:inset-4 md:inset-8 bg-black/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - More compact on mobile */}
          <div className="sticky top-0 bg-black/90 backdrop-blur-xl border-b border-blue-500/30 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">KOE Production Tools</h2>
                <p className="text-blue-300 text-sm sm:text-base">Additional features to enhance your workflow</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 sm:w-10 sm:h-10"
              >
                <X className="w-4 h-4 sm:w-6 sm:h-6" />
              </Button>
            </div>
          </div>

          {/* Tools Grid - Much more compact on mobile */}
          <div className="p-3 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {/* Music Analysis Tool */}
              <KoeToolCard
                title="Music Analysis"
                description="Upload your track for in-depth analysis of mixing, mastering, and frequency balance."
                icon={Music}
                href={createPageUrl("Upload")}
                isActive={true}
                delay={0.1}
              />
              
              {/* My Analyses */}
              <KoeToolCard
                title="My Analyses"
                description="Review the results of your previously analyzed audio files."
                icon={BarChart3}
                href={createPageUrl("Analyses")}
                isActive={true}
                delay={0.2}
              />

              {/* Mix Comparison */}
              <KoeToolCard
                title="Mix Comparison"
                description="Compare two versions of your mix side-by-side with AI-powered insights."
                icon={GitCompare}
                href={createPageUrl("MixCompare")}
                isActive={true}
                delay={0.25}
              />

              {/* Audio Utilities */}
              <KoeToolCard
                title="Audio Utilities"
                description="A suite of essential tools including format conversion, metadata editing, and more."
                icon={Wrench}
                isActive={false}
                delay={0.3}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}