import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ShotPreviewModal({ shot, onClose }) {
  if (!shot) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative bg-black/60 border border-orange-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Image Section */}
          <div className="md:w-3/5 flex-shrink-0 bg-black">
            <img
              src={shot.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop'}
              alt={shot.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Details Section */}
          <div className="md:w-2/5 flex flex-col p-6 overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-bold text-white mb-2">{shot.name}</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-orange-500/80 text-white backdrop-blur-sm flex items-center gap-1">
                <Camera className="w-3 h-3" /> {shot.category}
              </Badge>
              <Badge className={`flex items-center gap-1 ${
                shot.difficulty_level === 'beginner' ? 'bg-green-500/20 text-green-300' :
                shot.difficulty_level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                <Star className="w-3 h-3" /> {shot.difficulty_level}
              </Badge>
            </div>
            
            <p className="text-gray-300 text-sm mb-6">{shot.description}</p>
            
            {shot.use_cases && shot.use_cases.length > 0 && (
              <div>
                <h3 className="text-orange-400 font-semibold mb-3">Best Use Cases:</h3>
                <ul className="space-y-2">
                  {shot.use_cases.map((useCase, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}