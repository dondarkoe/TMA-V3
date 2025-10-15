
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowLeft, Music, BarChart3, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info, Sparkles, Loader2, MessageSquare } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { generatePersonalizedAnalysisSummary } from '@/api/functions';
import ReactMarkdown from 'react-markdown';

// Import the MusicalAnalysisSection component
import MusicalAnalysisSection from './MusicalAnalysisSection';
import ChordExtractionSection from './ChordExtractionSection';

import { ChatSession } from "@/api/entities";
import { ChatMessage } from "@/api/entities"; // Import ChatMessage entity
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Enhanced Technical Details Grid Component with more dynamic data
const TechnicalDetailsGrid = ({ analysisData }) => {
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Tooltip content for each metric
  const tooltipContent = {
    "Overall Loudness": {
      title: "Overall Loudness (LUFS)",
      explanation: "LUFS measures the perceived loudness of your entire track. Streaming platforms normalize to around -14 LUFS. Louder isn't always better - aim for the sweet spot for your genre.",
      idealRange: "Pop/EDM: -8 to -12 LUFS | Rock/Hip-hop: -7 to -10 LUFS | Jazz/Classical: -18 to -23 LUFS"
    },
    "Peak Level": {
      title: "Peak Level (dBFS)",
      explanation: "The loudest single moment in your track. Keep below -1dB to avoid clipping during format conversion. This is about headroom, not overall loudness.",
      idealRange: "Aim for -1dB to -3dB for streaming | -0.1dB to -1dB for CD mastering"
    },
    "Digital Clipping": {
      title: "Digital Clipping",
      explanation: "When audio exceeds 0dBFS, causing harsh distortion. Some genres use intentional clipping for character, but it should be a creative choice, not an accident.",
      idealRange: "None for clean genres | Minor acceptable for aggressive styles"
    },
    "Sound Width": {
      title: "Stereo Field",
      explanation: "How wide your mix sounds across speakers. Stereo width adds space and interest, but ensure mono compatibility for clubs and phones.",
      idealRange: "Wide stereo preferred, but check mono compatibility"
    },
    "Dynamic Range": {
      title: "Dynamic Range",
      explanation: "The difference between loud and quiet parts. More dynamics = more emotional impact, but less dynamics = more consistent energy. Genre-dependent choice."
    }
  };

  // Helper function to get more detailed loudness assessment
  const getLoudnessAssessment = (lufs) => {
    if (lufs === undefined || lufs === null) return { value: 'Unknown', status: 'normal', explanation: 'Loudness data not available', icon: '📊' };

    if (lufs > -8) return {
      value: `${lufs.toFixed(1)} LUFS`,
      status: 'error',
      explanation: 'Extremely loud - may cause distortion on most systems',
      icon: '🔴'
    };
    if (lufs > -12) return {
      value: `${lufs.toFixed(1)} LUFS`,
      status: 'warning',
      explanation: 'Very loud - competitive for streaming but limited headroom',
      icon: '🟡'
    };
    if (lufs > -16) return {
      value: `${lufs.toFixed(1)} LUFS`,
      status: 'good',
      explanation: 'Well-balanced loudness for most platforms',
      icon: '🟢'
    };
    if (lufs > -23) return {
      value: `${lufs.toFixed(1)} LUFS`,
      status: 'normal',
      explanation: 'Moderate loudness - good dynamic range',
      icon: '🔵'
    };
    return {
      value: `${lufs.toFixed(1)} LUFS`,
      status: 'warning',
      explanation: 'Quite quiet - may need more level for competitive loudness',
      icon: '🟡'
    };
  };

  // Helper function for peak assessment
  const getPeakAssessment = (peak) => {
    if (peak === undefined || peak === null) return { value: 'Unknown', status: 'normal', explanation: 'Peak data not available', icon: '📊' };

    if (peak > -0.1) return {
      value: `${peak.toFixed(1)} dB`,
      status: 'error',
      explanation: 'Dangerous peak levels - likely clipping',
      icon: '🚨'
    };
    if (peak > -1) return {
      value: `${peak.toFixed(1)} dB`,
      status: 'warning',
      explanation: 'Very hot peaks - minimal headroom',
      icon: '⚠️'
    };
    if (peak > -6) return {
      value: `${peak.toFixed(1)} dB`,
      status: 'good',
      explanation: 'Healthy peak levels with good headroom',
      icon: '✅'
    };
    return {
      value: `${peak.toFixed(1)} dB`,
      status: 'normal',
      explanation: 'Conservative peak levels - plenty of headroom',
      icon: '🔵'
    };
  };

  // Enhanced clipping assessment
  const getClippingAssessment = (clipping) => {
    switch(clipping) {
      case 'NONE':
        return { value: 'Clean', status: 'good', explanation: 'No digital clipping detected', icon: '✅' };
      case 'MINOR':
        return { value: 'Minor Clipping', status: 'warning', explanation: 'Some clipping detected - may add character or be problematic', icon: '⚠️' };
      case 'MODERATE':
        return { value: 'Moderate Clipping', status: 'warning', explanation: 'Noticeable clipping - check if intentional', icon: '🟡' };
      case 'MAJOR':
        return { value: 'Heavy Clipping', status: 'error', explanation: 'Significant clipping - likely needs attention', icon: '🔴' };
      default:
        return { value: clipping || 'Unknown', status: 'normal', explanation: 'Clipping status unclear', icon: '📊' };
    }
  };

  const loudnessInfo = getLoudnessAssessment(analysisData.integrated_loudness_lufs);
  const peakInfo = getPeakAssessment(analysisData.peak_loudness_dbfs);
  const clippingInfo = getClippingAssessment(analysisData.clipping);

  const metrics = [
    {
      label: "Overall Loudness",
      ...loudnessInfo
    },
    {
      label: "Peak Level",
      ...peakInfo
    },
    {
      label: "Digital Clipping",
      ...clippingInfo
    },
    {
      label: "Sound Width",
      value: analysisData.stereo_field === "STEREO" ? "Wide Stereo" : "Centered/Mono",
      explanation: analysisData.stereo_field === "STEREO" ? "Sounds nice and wide across speakers" : "Sounds more centered or mono",
      status: analysisData.stereo_field === "STEREO" ? "good" : "normal",
      icon: analysisData.stereo_field === "STEREO" ? "🎧" : "📻"
    },
    {
      label: "Dynamic Range",
      value: analysisData.if_master_drc || "Unknown",
      explanation: analysisData.if_master_drc === "GOOD" ? "Good balance of loud and quiet parts" :
                   analysisData.if_master_drc === "LIMITED" ? "Some compression applied" :
                   analysisData.if_master_drc === "POOR" ? "Very compressed or limited" : "Dynamic range unclear",
      status: analysisData.if_master_drc === "GOOD" ? "good" :
              analysisData.if_master_drc === "LIMITED" ? "normal" :
              analysisData.if_master_drc === "POOR" ? "warning" : "normal",
      icon: analysisData.if_master_drc === "GOOD" ? "🎼" :
            analysisData.if_master_drc === "LIMITED" ? "🎚️" :
            analysisData.if_master_drc === "POOR" ? "🗜️" : "📊"
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case "good": return "text-green-400";
      case "warning": return "text-yellow-400";
      case "error": return "text-red-400";
      default: return "text-blue-300";
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case "good": return "bg-green-500/10 border-green-500/20";
      case "warning": return "bg-yellow-500/10 border-yellow-500/20";
      case "error": return "bg-red-500/10 border-red-500/20";
      default: return "bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-400" />
          Technical Analysis
        </CardTitle>
        <p className="text-gray-400">Detailed breakdown of your audio's technical characteristics</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getStatusBg(metric.status)} relative`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">{metric.label}</span>
                  <button
                    onClick={() => setActiveTooltip(activeTooltip === metric.label ? null : metric.label)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-lg">{metric.icon}</span>
              </div>
              
              {/* Tooltip */}
              {activeTooltip === metric.label && tooltipContent[metric.label] && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 top-full left-0 right-0 mt-2 p-3 bg-black/90 border border-blue-500/30 rounded-lg text-xs"
                >
                  <h4 className="text-blue-300 font-semibold mb-2">{tooltipContent[metric.label].title}</h4>
                  <p className="text-gray-300 mb-2">{tooltipContent[metric.label].explanation}</p>
                  <p className="text-green-300 text-xs"><strong>Ideal Range:</strong> {tooltipContent[metric.label].idealRange}</p>
                  <button 
                    onClick={() => setActiveTooltip(null)}
                    className="absolute top-1 right-2 text-gray-400 hover:text-white"
                  >
                    &times;
                  </button>
                </motion.div>
              )}

              <p className={`font-bold text-lg ${getStatusColor(metric.status)} mb-2`}>
                {metric.value}
              </p>
              <p className="text-xs text-gray-400 leading-tight">{metric.explanation}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Tonal Profile Chart with Dynamic Values
const TonalProfileChart = ({ bassLevel, midLevel, highLevel, brightnessValue }) => {
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Tooltip content for frequency ranges
  const frequencyTooltips = {
    "Bass": {
      title: "Bass Frequencies (20-250 Hz)",
      explanation: "The foundation of your track. Controls the weight and power. Too little = thin sound, too much = muddy mix.",
      tips: "Kick drums, sub-bass, bass guitar fundamentals live here"
    },
    "Mids": {
      title: "Mid Frequencies (250-4K Hz)",
      explanation: "Where most instruments and vocals sit. The most important range for clarity and intelligibility.",
      tips: "Vocals, lead instruments, snare, most harmonic content"
    },
    "Highs": {
      title: "High Frequencies (4K-20K Hz)", 
      explanation: "Adds sparkle, air, and definition. Controls how crisp and bright your track sounds.",
      tips: "Hi-hats, cymbals, vocal sibilance, harmonic overtones"
    },
    "Brightness": {
      title: "Overall Brightness (Spectral Centroid)",
      explanation: "The 'center of mass' of your frequency spectrum. Higher = brighter sound, lower = warmer sound. It's an average frequency of the sound.",
      tips: "Measured in Hz - shows the actual tonal balance of your track. A common range for music is 2000-5000Hz."
    }
  };

  // Convert frequency levels to numerical values for more accurate representation
  const getFrequencyValue = (level) => {
    const values = {
      'VERY_LOW': 15,
      'LOW': 35,
      'MEDIUM': 55,
      'HIGH': 75,
      'VERY_HIGH': 95
    };
    return values[level] || values['MEDIUM'] || 55;
  };

  // Convert brightness value to visual scale (normalize to 0-100 range)
  const getBrightnessValue = (brightnessHz) => {
    if (brightnessHz === undefined || brightnessHz === null) return 55; // Default to middle
    // Typical brightness range is roughly 1000-8000 Hz, map to 0-100
    // Normalize brightness value to a 0-100 scale for visual representation.
    // Assuming 1000 Hz is "very dark" (0) and 8000 Hz is "very bright" (100).
    const normalized = Math.min(Math.max((brightnessHz - 1000) / 7000 * 100, 0), 100);
    return normalized;
  };

  // Get brightness category and color
  const getBrightnessInfo = (brightnessHz) => {
    if (brightnessHz === undefined || brightnessHz === null) return { category: 'Unknown', color: '#3b82f6', description: 'Not available' };
    
    if (brightnessHz < 2000) return { category: 'Warm', color: '#ea580c', description: `${Math.round(brightnessHz)}Hz - warm, mellow` };
    if (brightnessHz < 4000) return { category: 'Balanced', color: '#3b82f6', description: `${Math.round(brightnessHz)}Hz - well balanced` };
    if (brightnessHz < 6000) return { category: 'Bright', color: '#059669', description: `${Math.round(brightnessHz)}Hz - crisp, clear` };
    return { category: 'Very Bright', color: '#7c3aed', description: `${Math.round(brightnessHz)}Hz - very prominent` };
  };

  // Get more descriptive labels
  const getFrequencyDescription = (level) => {
    switch(level) {
      case 'VERY_LOW': return 'Very Weak';
      case 'LOW': return 'Below Average';
      case 'MEDIUM': return 'Balanced';
      case 'HIGH': return 'Strong';
      case 'VERY_HIGH': return 'Very Strong';
      default: return 'Balanced';
    }
  };

  // Get recommendation based on level
  const getFrequencyRecommendation = (level, freqType) => {
    const recommendations = {
      'VERY_LOW': `${freqType} needs significant boosting`,
      'LOW': `${freqType} could use some enhancement`,
      'MEDIUM': `${freqType} is well balanced`,
      'HIGH': `${freqType} is strong and present`,
      'VERY_HIGH': `${freqType} is very prominent - may dominate mix`
    };
    return recommendations[level] || `${freqType} balance unclear`;
  };

  const bassValue = getFrequencyValue(bassLevel);
  const midValue = getFrequencyValue(midLevel);
  const highValue = getFrequencyValue(highLevel);
  const brightnessVisualValue = getBrightnessValue(brightnessValue);
  const brightnessInfo = getBrightnessInfo(brightnessValue);

  const getLevelColor = (level) => {
    switch(level) {
      case 'VERY_LOW': return '#dc2626'; // red-600
      case 'LOW': return '#ea580c'; // orange-600
      case 'MEDIUM': return '#3b82f6'; // blue-500
      case 'HIGH': return '#059669'; // emerald-600
      case 'VERY_HIGH': return '#7c3aed'; // violet-600
      default: return '#3b82f6';
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center gap-3">
          <Music className="w-8 h-8 text-blue-400" />
          Frequency Balance & Brightness
        </CardTitle>
        <p className="text-gray-400">Visual representation of your track's tonal balance and spectral character</p>
      </CardHeader>
      <CardContent>
        <div className="h-80 relative bg-black/30 rounded-lg p-6 mb-6">
          {/* Y-axis labels */}
          <div className="absolute left-2 top-6 bottom-16 flex flex-col justify-between text-xs text-gray-400">
            <span>Very Strong</span>
            <span>Strong</span>
            <span>Balanced</span>
            <span>Weak</span>
            <span>Very Weak</span>
          </div>

          {/* Main chart area */}
          <div className="ml-12 mr-4 h-full relative">
            <svg viewBox="0 0 400 200" className="w-full h-full absolute inset-0">
              {/* Grid lines */}
              {[20, 50, 80, 110, 140, 170].map((y, index) => (
                <line
                  key={y}
                  x1="20"
                  y1={y}
                  x2="380"
                  y2={y}
                  stroke={index === 2 ? "rgba(59, 130, 246, 0.4)" : "rgba(59, 130, 246, 0.15)"}
                  strokeWidth={index === 2 ? "2" : "1"}
                  strokeDasharray={index === 2 ? "5,5" : "none"}
                />
              ))}

              {/* Bass bar with gradient */}
              <defs>
                <linearGradient id="bassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={getLevelColor(bassLevel)} stopOpacity="0.8"/>
                  <stop offset="100%" stopColor={getLevelColor(bassLevel)} stopOpacity="0.4"/>
                </linearGradient>
              </defs>
              <motion.rect
                x="40"
                y={180 - (bassValue * 1.5)}
                width="45"
                height={bassValue * 1.5}
                fill="url(#bassGradient)"
                stroke={getLevelColor(bassLevel)}
                strokeWidth="2"
                initial={{ height: 0 }}
                animate={{ height: bassValue * 1.5 }}
                transition={{ duration: 1.2, delay: 0.2 }}
              />

              {/* Mids bar with gradient */}
              <defs>
                <linearGradient id="midGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={getLevelColor(midLevel)} stopOpacity="0.8"/>
                  <stop offset="100%" stopColor={getLevelColor(midLevel)} stopOpacity="0.4"/>
                </linearGradient>
              </defs>
              <motion.rect
                x="130"
                y={180 - (midValue * 1.5)}
                width="45"
                height={midValue * 1.5}
                fill="url(#midGradient)"
                stroke={getLevelColor(midLevel)}
                strokeWidth="2"
                initial={{ height: 0 }}
                animate={{ height: midValue * 1.5 }}
                transition={{ duration: 1.2, delay: 0.4 }}
              />

              {/* Highs bar with gradient */}
              <defs>
                <linearGradient id="highGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={getLevelColor(highLevel)} stopOpacity="0.8"/>
                  <stop offset="100%" stopColor={getLevelColor(highLevel)} stopOpacity="0.4"/>
                </linearGradient>
              </defs>
              <motion.rect
                x="220"
                y={180 - (highValue * 1.5)}
                width="45"
                height={highValue * 1.5}
                fill="url(#highGradient)"
                stroke={getLevelColor(highLevel)}
                strokeWidth="2"
                initial={{ height: 0 }}
                animate={{ height: highValue * 1.5 }}
                transition={{ duration: 1.2, delay: 0.6 }}
              />

              {/* NEW: Brightness bar */}
              <defs>
                <linearGradient id="brightnessGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={brightnessInfo.color} stopOpacity="0.8"/>
                  <stop offset="100%" stopColor={brightnessInfo.color} stopOpacity="0.4"/>
                </linearGradient>
              </defs>
              <motion.rect
                x="310"
                y={180 - (brightnessVisualValue * 1.5)}
                width="45"
                height={brightnessVisualValue * 1.5}
                fill="url(#brightnessGradient)"
                stroke={brightnessInfo.color}
                strokeWidth="2"
                initial={{ height: 0 }}
                animate={{ height: brightnessVisualValue * 1.5 }}
                transition={{ duration: 1.2, delay: 0.8 }}
              />

              {/* Value labels on bars */}
              <text x="62" y={175 - (bassValue * 1.5)} textAnchor="middle" className="text-sm fill-white font-semibold">
                {getFrequencyDescription(bassLevel)}
              </text>
              <text x="152" y={175 - (midValue * 1.5)} textAnchor="middle" className="text-sm fill-white font-semibold">
                {getFrequencyDescription(midLevel)}
              </text>
              <text x="242" y={175 - (highValue * 1.5)} textAnchor="middle" className="text-sm fill-white font-semibold">
                {getFrequencyDescription(highLevel)}
              </text>
              <text x="332" y={175 - (brightnessVisualValue * 1.5)} textAnchor="middle" className="text-sm fill-white font-semibold">
                {brightnessInfo.category}
              </text>
            </svg>
          </div>

          {/* X-axis labels */}
          <div className="absolute bottom-2 left-12 right-4 flex justify-between text-xs text-gray-400">
            <div className="text-center flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span>Bass</span>
                <button
                  onClick={() => setActiveTooltip(activeTooltip === 'Bass' ? null : 'Bass')}
                  className="text-gray-500 hover:text-gray-300"
                >
                  <Info className="w-3 h-3" />
                </button>
              </div>
              <div className="text-[10px] text-gray-500">(20-250 Hz)</div>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span>Mids</span>
                <button
                  onClick={() => setActiveTooltip(activeTooltip === 'Mids' ? null : 'Mids')}
                  className="text-gray-500 hover:text-gray-300"
                >
                  <Info className="w-3 h-3" />
                </button>
              </div>
              <div className="text-[10px] text-gray-500">(250-4K Hz)</div>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span>Highs</span>
                <button
                  onClick={() => setActiveTooltip(activeTooltip === 'Highs' ? null : 'Highs')}
                  className="text-gray-500 hover:text-gray-300"
                >
                  <Info className="w-3 h-3" />
                </button>
              </div>
              <div className="text-[10px] text-gray-500">(4K-20K Hz)</div>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span>Brightness</span>
                <button
                  onClick={() => setActiveTooltip(activeTooltip === 'Brightness' ? null : 'Brightness')}
                  className="text-gray-500 hover:text-gray-300"
                >
                  <Info className="w-3 h-3" />
                </button>
              </div>
              <div className="text-[10px] text-gray-500">(Spectral)</div>
            </div>
          </div>

          {/* Tooltips */}
          {activeTooltip && frequencyTooltips[activeTooltip] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/90 border border-blue-500/30 rounded-lg p-4 text-sm z-10 max-w-xs"
            >
              <h4 className="text-blue-300 font-semibold mb-2">{frequencyTooltips[activeTooltip].title}</h4>
              <p className="text-gray-300 mb-2">{frequencyTooltips[activeTooltip].explanation}</p>
              <p className="text-green-300 text-xs">{frequencyTooltips[activeTooltip].tips}</p>
              <button 
                onClick={() => setActiveTooltip(null)}
                className="absolute top-1 right-2 text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </motion.div>
          )}
        </div>

        {/* Enhanced frequency explanations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-lg bg-black/30 border border-gray-600">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getLevelColor(bassLevel) }}
              ></div>
              <p className="text-white font-semibold">{getFrequencyDescription(bassLevel)}</p>
            </div>
            <p className="text-blue-300 text-sm font-medium">Bass Frequencies</p>
            <p className="text-gray-400 text-xs mt-1">{getFrequencyRecommendation(bassLevel, 'Bass')}</p>
            <p className="text-gray-500 text-xs mt-1">Kicks, sub-bass, low instruments</p>
          </div>
          <div className="p-4 rounded-lg bg-black/30 border border-gray-600">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getLevelColor(midLevel) }}
              ></div>
              <p className="text-white font-semibold">{getFrequencyDescription(midLevel)}</p>
            </div>
            <p className="text-blue-300 text-sm font-medium">Mid Frequencies</p>
            <p className="text-gray-400 text-xs mt-1">{getFrequencyRecommendation(midLevel, 'Mids')}</p>
            <p className="text-gray-500 text-xs mt-1">Vocals, leads, most instruments</p>
          </div>
          <div className="p-4 rounded-lg bg-black/30 border border-gray-600">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getLevelColor(highLevel) }}
              ></div>
              <p className="text-white font-semibold">{getFrequencyDescription(highLevel)}</p>
            </div>
            <p className="text-blue-300 text-sm font-medium">High Frequencies</p>
            <p className="text-gray-400 text-xs mt-1">{getFrequencyRecommendation(highLevel, 'Highs')}</p>
            <p className="text-gray-500 text-xs mt-1">Hi-hats, cymbals, air, sparkle</p>
          </div>
          <div className="p-4 rounded-lg bg-black/30 border border-gray-600">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: brightnessInfo.color }}
              ></div>
              <p className="text-white font-semibold">{brightnessInfo.category}</p>
            </div>
            <p className="text-blue-300 text-sm font-medium">Overall Brightness</p>
            <p className="text-gray-400 text-xs mt-1">{brightnessInfo.description}</p>
            <p className="text-gray-500 text-xs mt-1">Spectral Centroid (Hz)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// New Personalized Analysis Section Component
const PersonalizedAnalysisSection = ({ analysis }) => {
  const [personalizedSummary, setPersonalizedSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // Now stores an object { message, retryable }

  useEffect(() => {
    const loadPersonalizedSummary = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data } = await generatePersonalizedAnalysisSummary({
          analysisResult: analysis.analysis_result,
          filename: analysis.filename
        });

        if (data.success) {
          setPersonalizedSummary(data.personalized_summary);
        } else {
          // Check if it's a retryable error
          if (data.retryable) {
            setError({
              message: data.error || 'Failed to generate personalized analysis',
              retryable: true
            });
          } else {
            setError({
              message: data.error || 'Failed to generate personalized analysis',
              retryable: false
            });
          }
        }
      } catch (err) {
        console.error('Error loading personalized analysis:', err);
        
        // Check if it's a network/server error (usually retryable)
        const isServerError = err.response?.status >= 500 || 
                             String(err.message).includes('503') || 
                             String(err.message).includes('502') ||
                             String(err.message).includes('network') ||
                             String(err.message).includes('fetch') ||
                             String(err.message).includes('ECONNREFUSED');
        
        setError({
          message: isServerError 
            ? 'AI service is temporarily unavailable. Please try again in a few moments.' 
            : 'Unable to load personalized feedback. Please try again.',
          retryable: isServerError
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (analysis?.analysis_result?.mixDiagnosisResults?.payload) {
      loadPersonalizedSummary();
    }
  }, [analysis]);

  const handleRetry = () => {
    const loadPersonalizedSummary = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data } = await generatePersonalizedAnalysisSummary({
          analysisResult: analysis.analysis_result,
          filename: analysis.filename
        });

        if (data.success) {
          setPersonalizedSummary(data.personalized_summary);
        } else {
          setError({
            message: data.error || 'Failed to generate personalized analysis',
            retryable: data.retryable || false
          });
        }
      } catch (err) {
        console.error('Error loading personalized analysis:', err);
        const isServerError = err.response?.status >= 500 || 
                             String(err.message).includes('503') || 
                             String(err.message).includes('502') ||
                             String(err.message).includes('network') ||
                             String(err.message).includes('fetch') ||
                             String(err.message).includes('ECONNREFUSED');
        
        setError({
          message: isServerError 
            ? 'AI service is temporarily unavailable. Please try again in a few moments.' 
            : 'Unable to load personalized feedback. Please try again.',
          retryable: isServerError
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonalizedSummary();
  };

  if (isLoading) {
    return (
      <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Generating your personalized analysis...</p>
          <p className="text-gray-400 text-sm mt-2">This takes into account your KOE preferences</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="backdrop-blur-xl bg-black/50 border border-red-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-semibold text-red-300">Personalized Analysis Unavailable</h3>
          </div>
          <p className="text-gray-300 mb-4">{error.message}</p>
          <div className="flex gap-3">
            {error.retryable && (
              <Button
                onClick={handleRetry}
                className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
            )}
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-gray-500/30 text-gray-300 hover:bg-gray-500/10"
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!personalizedSummary) {
    return null;
  }

  return (
    <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-400" />
          KOE's Personalized Analysis
        </CardTitle>
        <p className="text-purple-300">Tailored feedback based on your sonic preferences</p>
      </CardHeader>
      <CardContent>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            className="text-white leading-relaxed"
            components={{
              h2: ({ children }) => (
                <h2 className="text-xl font-bold text-purple-300 mt-6 mb-4 flex items-center gap-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-blue-300 mt-4 mb-3">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-200 leading-relaxed mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-none text-gray-200 mb-6 space-y-2">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="text-gray-200 leading-relaxed pl-0 flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span className="flex-1">{children}</span>
                </li>
              ),
              strong: ({ children }) => (
                <strong className="text-white font-semibold">
                  {children}
                </strong>
              ),
              code: ({ children }) => (
                <code className="bg-black/30 px-2 py-1 rounded text-blue-300 text-sm">
                  {children}
                )</code>
              )
            }}
          >
            {personalizedSummary}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export default function VisualAnalysisReport({ analysis, onBack }) {
  const navigate = useNavigate();

  // NEW: state for existing session modal
  const [existingSession, setExistingSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);

  // New function to generate the initial message for KOE
  const generateKoeInitialMessage = (filename) =>
    `Hey KOE! I've just uploaded "${filename}" for analysis. Can you give me your unfiltered opinion and tell me how I can improve this track, particularly focusing on mixing and mastering? Roast me! 🔥`;

  const createAndGoToNewSession = async () => {
    setCreatingSession(true);
    try {
      const newSession = await ChatSession.create({
        name: `Analysis: ${analysis.filename}`,
        project_objective: "optimizing_current_track",
        genre: analysis.musical_style || undefined,
        linked_analysis_id: analysis.id,
        message_count: 1, // Start with 1 message
        last_message_at: new Date().toISOString()
      });

      // Send the initial message after session creation
      if (newSession && newSession.id) {
        // FIX: Use ChatMessage.create to add the first message
        await ChatMessage.create({
          chat_session_id: newSession.id,
          content: generateKoeInitialMessage(analysis.filename),
          sender: 'user',
          message_order: 1, // This is the first message
          is_llm_trigger_message: true // Set flag to trigger LLM response on load
        });
      }

      navigate(createPageUrl("KOE") + `?sessionId=${newSession.id}`);
    } catch (error) {
      console.error("Error creating or initiating chat session:", error);
      // Optionally, handle error state for the user
    } finally {
      setCreatingSession(false);
    }
  };

  const goToExistingSession = async () => {
    if (existingSession) {
      try {
        const messageCount = existingSession.message_count || 0;
        // FIX: Use ChatMessage.create to add a new message
        await ChatMessage.create({
          chat_session_id: existingSession.id,
          content: generateKoeInitialMessage(analysis.filename),
          sender: 'user',
          message_order: messageCount + 1,
          is_llm_trigger_message: true // Set flag to trigger LLM response on load
        });
        // Also update the message count and last message timestamp on the session
        await ChatSession.update(existingSession.id, {
          message_count: messageCount + 1,
          last_message_at: new Date().toISOString()
        });
        navigate(createPageUrl("KOE") + `?sessionId=${existingSession.id}`);
      } catch (error) {
        console.error("Error sending message to existing session:", error);
        // Optionally, handle error state for the user
      }
    }
  };

  const handleContinueToChat = async () => {
    // Look for existing sessions linked to this analysis, newest first
    const sessions = await ChatSession.filter(
      { linked_analysis_id: analysis.id },
      "-updated_date"
    );
    if (sessions && sessions.length > 0) {
      setExistingSession(sessions[0]);
      setShowSessionModal(true);
      return;
    }
    // None exist -> create a new one and go
    await createAndGoToNewSession();
  };

  if (!analysis?.analysis_result?.mixDiagnosisResults?.payload) {
    return (
      <div className="min-h-screen p-6 md:p-8 flex items-center justify-center">
        <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Analysis data unavailable</h2>
            <p className="text-blue-300 mb-6">Unable to load the analysis results.</p>
            <Button onClick={onBack} className="bg-gradient-to-r from-blue-500 to-blue-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const result = analysis.analysis_result.mixDiagnosisResults.payload;
  const bassFreq = result.tonal_profile?.bass_frequency || 'MEDIUM';
  const midFreq = result.tonal_profile?.mid_frequency || 'MEDIUM';
  const highFreq = result.tonal_profile?.high_frequency || 'MEDIUM';

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Sticky Back Button */}
      <div className="fixed top-24 left-6 z-[90]">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-white/90 hover:text-white hover:bg-white/20 rounded-xl backdrop-blur-xl bg-black/40 border border-white/20 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 pt-6 pl-16"
        >
          <div>
            <h1 className="text-4xl font-bold text-white">Audio Analysis Report</h1>
            <p className="text-blue-300 mt-2 text-xl">
              {analysis.filename} • {format(new Date(analysis.created_date), 'MMM d, yyyy')}
            </p>
          </div>
        </motion.div>

        {/* GET ROASTED BY KOE Button - Updated handler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <Button
            onClick={handleContinueToChat}
            className="bg-gradient-to-r from-red-500 via-purple-600 to-blue-600 hover:from-red-600 hover:via-purple-700 hover:to-blue-700 text-white font-bold text-lg px-12 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-pulse hover:animate-none border-2 border-white/20"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #8b5cf6 50%, #3b82f6 100%)',
              boxShadow: '0 10px 40px rgba(239, 68, 68, 0.3), 0 0 20px rgba(139, 92, 246, 0.2)'
            }}
          >
            <MessageSquare className="w-6 h-6 mr-3" />
            GET ROASTED BY KOE 🔥
          </Button>
        </motion.div>

        {/* Analysis Content */}
        <div className="space-y-8">
          {/* NEW: Personalized Analysis Section - First and Most Prominent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PersonalizedAnalysisSection analysis={analysis} />
          </motion.div>

          {/* FIXED: Enhanced Musical Analysis Section - Pass the full analysis object */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MusicalAnalysisSection analysis={analysis} />
          </motion.div>

          {/* Chord Extraction + MIDI Download - RE-ENABLED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <ChordExtractionSection analysis={analysis} />
          </motion.div>

          {/* Technical Details Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TechnicalDetailsGrid analysisData={result} />
          </motion.div>

          {/* Tonal Profile Chart with Brightness - Fixed data access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TonalProfileChart
              bassLevel={bassFreq}
              midLevel={midFreq}
              highLevel={highFreq}
              brightnessValue={result.librosa_brightness?.average || result.librosa_raw_data?.brightness?.average || result.librosa_raw_data?.brightness}
            />
          </motion.div>
        </div>
      </div>

      {/* NEW: Existing session modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent className="backdrop-blur-xl bg-black/70 border border-blue-500/30 text-white">
          <DialogHeader>
            <DialogTitle>Chat already exists for this analysis</DialogTitle>
            <DialogDescription className="text-blue-200">
              We found an existing chat linked to “{analysis.filename}”. You can jump into that chat or start a new one with this report attached.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 text-sm text-blue-200">
            Most recent chat: <span className="font-semibold text-white">{existingSession?.name}</span>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-3">
            <Button onClick={goToExistingSession} className="bg-blue-600 hover:bg-blue-700">
              Go to existing chat
            </Button>
            <Button
              variant="outline"
              onClick={createAndGoToNewSession}
              disabled={creatingSession}
              className="border-blue-500/40 text-white hover:bg-blue-500/10"
            >
              {creatingSession ? 'Creating…' : 'Start a new chat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
