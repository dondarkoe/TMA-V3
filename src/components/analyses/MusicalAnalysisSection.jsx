import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Music, Key, Volume2, Hash, Zap, Info } from 'lucide-react';
import { motion } from 'framer-motion';

// Visual Brightness Meter Component
const BrightnessMeter = ({ brightness, onClick }) => {
  // Normalize brightness to 0-100 scale (1000Hz = very warm, 8000Hz = very bright)
  const normalizedValue = Math.min(Math.max((brightness - 1000) / 7000 * 100, 0), 100);
  
  const getBrightnessLabel = (hz) => {
    if (hz < 2000) return { label: 'Warm & Mellow', color: '#ea580c' };
    if (hz < 4000) return { label: 'Balanced', color: '#3b82f6' };
    if (hz < 6000) return { label: 'Bright & Clear', color: '#059669' };
    return { label: 'Very Bright', color: '#7c3aed' };
  };

  const brightnessInfo = getBrightnessLabel(brightness);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{brightnessInfo.label}</span>
        <span className="text-xs text-gray-400">{Math.round(brightness)} Hz</span>
      </div>
      
      {/* Visual brightness bar */}
      <div 
        className="relative h-3 rounded-full overflow-hidden cursor-pointer transition-all duration-200 hover:h-4"
        onClick={onClick}
      >
        {/* Background gradient from warm to bright */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-blue-500 to-purple-500" />
        
        {/* Indicator */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transform -translate-x-0.5 transition-all duration-300"
          style={{ 
            left: `${normalizedValue}%`,
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)'
          }}
        />
      </div>
      
      {/* Scale labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Warm</span>
        <span>Balanced</span>
        <span>Bright</span>
      </div>
    </div>
  );
};

// Energy Balance Visualization Component
const EnergyBalanceChart = ({ energyBalance, onClick }) => {
  const { harmonic = 0, percussive = 0, dominant } = energyBalance;
  const total = harmonic + percussive;
  const harmonicPercent = total > 0 ? (harmonic / total) * 100 : 50;
  const percussivePercent = total > 0 ? (percussive / total) * 100 : 50;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white capitalize">{dominant} Dominant</span>
        <span className="text-xs text-gray-400">
          H:{harmonic.toFixed(2)} P:{percussive.toFixed(2)}
        </span>
      </div>
      
      {/* Visual balance bar */}
      <div 
        className="relative h-4 rounded-full overflow-hidden cursor-pointer transition-all duration-200 hover:h-5"
        onClick={onClick}
      >
        <div className="flex h-full">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
            style={{ width: `${harmonicPercent}%` }}
          />
          <div 
            className="bg-gradient-to-r from-red-400 to-red-500 transition-all duration-300"
            style={{ width: `${percussivePercent}%` }}
          />
        </div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between text-xs">
        <span className="text-blue-400">Harmonic ({harmonicPercent.toFixed(0)}%)</span>
        <span className="text-red-400">Percussive ({percussivePercent.toFixed(0)}%)</span>
      </div>
    </div>
  );
};

// Dominant Notes Display Component
const DominantNotesDisplay = ({ notes, onClick }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">Key Notes</span>
        <span className="text-xs text-gray-400">{notes.length} detected</span>
      </div>
      
      <div 
        className="flex flex-wrap gap-2 cursor-pointer"
        onClick={onClick}
      >
        {notes.map((note, index) => (
          <motion.div
            key={note}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Badge 
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-3 py-1 text-sm hover:from-green-500 hover:to-emerald-500 transition-all duration-200"
            >
              {note}
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Key Display Component
const KeyDisplay = ({ musicKey, onClick }) => {
  const [keyNote, mode] = musicKey.split(' ');
  
  return (
    <div 
      className="text-center cursor-pointer group transition-all duration-200 hover:scale-105"
      onClick={onClick}
    >
      <div className="text-4xl font-bold text-purple-300 mb-2 group-hover:text-purple-200 transition-colors">
        {keyNote}
      </div>
      <div className="text-sm text-purple-400 uppercase tracking-wider">
        {mode}
      </div>
    </div>
  );
};

export default function MusicalAnalysisSection({ analysis }) {
  console.log('[MusicalAnalysisSection] Full analysis object received:', analysis);
  
  // Check for only the fields we're actually displaying
  const hasLibrosaData = analysis && (
    (analysis.librosa_key !== null && analysis.librosa_key !== undefined) ||
    (analysis.librosa_energy_balance !== null && analysis.librosa_energy_balance !== undefined) ||
    (analysis.librosa_brightness !== null && analysis.librosa_brightness !== undefined) ||
    (analysis.librosa_dominant_notes && Array.isArray(analysis.librosa_dominant_notes) && analysis.librosa_dominant_notes.length > 0)
  );

  console.log('[MusicalAnalysisSection] hasLibrosaData result:', hasLibrosaData);

  if (!hasLibrosaData) {
    return (
      <Card className="backdrop-blur-xl bg-black/50 border border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-orange-400" />
            Musical Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Music className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Musical Analysis Not Available</h3>
            <p className="text-gray-500 text-sm">
              Musical data could not be retrieved for this file.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-orange-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Music className="w-5 h-5 text-orange-400" />
          Musical Analysis
        </CardTitle>
        <p className="text-orange-300 text-sm">Click on any element to learn what it means</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Musical Key */}
          {(analysis.librosa_key !== null && analysis.librosa_key !== undefined) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg p-6 border border-purple-500/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Musical Key</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="ml-auto text-purple-400 hover:text-purple-300 transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-black/90 border border-purple-500/30 text-white">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-300">Musical Key</h4>
                      <p className="text-sm text-gray-300">
                        The musical key determines which notes and chords will sound harmonious together. 
                        It's like the "home base" of your song - the tonal center that everything revolves around.
                      </p>
                      <p className="text-xs text-purple-200">
                        <strong>Your key:</strong> {analysis.librosa_key} means your song primarily uses the notes from this scale.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <KeyDisplay 
                musicKey={analysis.librosa_key}
                onClick={() => {}} // Handled by popover
              />
            </motion.div>
          )}

          {/* Brightness */}
          {(analysis.librosa_brightness?.average !== null && analysis.librosa_brightness?.average !== undefined) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-lg p-6 border border-yellow-500/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <Volume2 className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium">Brightness</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="ml-auto text-yellow-400 hover:text-yellow-300 transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-black/90 border border-yellow-500/30 text-white">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-yellow-300">Brightness</h4>
                      <p className="text-sm text-gray-300">
                        Brightness measures how much high-frequency content is in your track. 
                        Think of it like the difference between a warm, mellow sound vs a crisp, sparkly one.
                      </p>
                      <p className="text-xs text-yellow-200">
                        <strong>Higher values (4000+ Hz):</strong> Crisp, bright, lots of cymbals/hi-hats<br />
                        <strong>Lower values (2000- Hz):</strong> Warm, mellow, more bass-focused
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <BrightnessMeter 
                brightness={analysis.librosa_brightness.average}
                onClick={() => {}} // Handled by popover
              />
            </motion.div>
          )}

          {/* Energy Balance */}
          {(analysis.librosa_energy_balance?.dominant !== null && analysis.librosa_energy_balance?.dominant !== undefined) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-lg p-6 border border-red-500/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-red-400" />
                <span className="text-white font-medium">Energy Balance</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="ml-auto text-red-400 hover:text-red-300 transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-black/90 border border-red-500/30 text-white">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-300">Energy Balance</h4>
                      <p className="text-sm text-gray-300">
                        This shows whether your track is more driven by sustained sounds (like vocals, pads) 
                        or by rhythmic hits (like drums, percussion).
                      </p>
                      <p className="text-xs text-red-200">
                        <strong>Harmonic:</strong> Sustained, melodic elements (vocals, synths, chords)<br />
                        <strong>Percussive:</strong> Sharp, rhythmic elements (drums, claps, stabs)
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <EnergyBalanceChart 
                energyBalance={analysis.librosa_energy_balance}
                onClick={() => {}} // Handled by popover
              />
            </motion.div>
          )}

          {/* Dominant Notes */}
          {(analysis.librosa_dominant_notes && Array.isArray(analysis.librosa_dominant_notes) && analysis.librosa_dominant_notes.length > 0) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg p-6 border border-green-500/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">Dominant Notes</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="ml-auto text-green-400 hover:text-green-300 transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-black/90 border border-green-500/30 text-white">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-300">Dominant Notes</h4>
                      <p className="text-sm text-gray-300">
                        These are the musical notes that appear most frequently in your track. 
                        They give you an idea of which pitches are most prominent in your mix.
                      </p>
                      <p className="text-xs text-green-200">
                        <strong>Tip:</strong> These notes should typically align with your song's key and chord progression.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <DominantNotesDisplay 
                notes={analysis.librosa_dominant_notes}
                onClick={() => {}} // Handled by popover
              />
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}