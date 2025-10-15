import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Settings, Music } from 'lucide-react';

const DAW_OPTIONS = [
  { id: 'ableton', name: 'Ableton Live', description: 'Session and Arrangement views' },
  { id: 'fl', name: 'FL Studio', description: 'Lifetime free updates' },
  { id: 'logic', name: 'Logic Pro', description: 'Apple\'s professional DAW' },
  { id: 'pro_tools', name: 'Pro Tools', description: 'Industry standard for mixing' },
  { id: 'cubase', name: 'Cubase', description: 'Steinberg\'s complete solution' },
  { id: 'reason', name: 'Reason', description: 'Virtual rack and sequencer' },
  { id: 'studio_one', name: 'Studio One', description: 'PreSonus integrated platform' },
  { id: 'bitwig', name: 'Bitwig Studio', description: 'Modular music creation' },
  { id: 'other', name: 'Other DAW', description: 'Reaper, Garageband, etc.' }
];

export default function DawSelectorModal({ isOpen, onClose, onSelectDaw, currentDaw }) {
  const [selectedDaw, setSelectedDaw] = useState(currentDaw || null);

  const handleSelectDaw = (dawId) => {
    setSelectedDaw(dawId);
    onSelectDaw(dawId);
    onClose();
  };

  const handleClearDaw = () => {
    setSelectedDaw(null);
    onSelectDaw(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-2xl max-h-[80vh] mx-4"
      >
        <Card className="backdrop-blur-xl bg-black/80 border border-blue-500/30">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Select Your DAW</h2>
                <p className="text-gray-300 text-sm mt-1">
                  Choose your Digital Audio Workstation for DAW-specific advice
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Clear DAW Option */}
            {currentDaw && (
              <div className="mb-6">
                <Card className="bg-orange-500/10 border border-orange-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Current DAW</h3>
                        <p className="text-orange-300 text-sm">
                          {DAW_OPTIONS.find(d => d.id === currentDaw)?.name || 'Unknown DAW'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearDaw}
                        className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
                      >
                        Clear DAW
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* DAW Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
              {DAW_OPTIONS.map((daw) => (
                <motion.div
                  key={daw.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`backdrop-blur-xl cursor-pointer transition-all duration-200 ${
                      selectedDaw === daw.id || currentDaw === daw.id
                        ? 'bg-blue-500/20 border-blue-500/50'
                        : 'bg-black/40 border-blue-500/30 hover:border-blue-500/50'
                    }`}
                    onClick={() => handleSelectDaw(daw.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedDaw === daw.id || currentDaw === daw.id
                            ? 'bg-blue-500/30'
                            : 'bg-blue-500/20'
                        }`}>
                          <Music className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate">{daw.name}</h3>
                          <p className="text-gray-400 text-xs truncate">{daw.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-600">
              <p className="text-gray-400 text-xs text-center">
                KOE will provide DAW-specific plugin names, workflows, and keyboard shortcuts
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}