
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle, BarChart3, Sparkles, MessageSquare, Music, Volume2, Key, Drumstick, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';

// Visual Comparison Component
const VisualComparisonGrid = ({ analysisA, analysisB, librosaA, librosaB, filenameA, filenameB }) => {
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Tooltip explanations for each metric
  const metricTooltips = {
    'Overall Loudness (LUFS)': {
      explanation: 'How loud your track sounds overall. Streaming platforms normalize around -14 LUFS. Lower numbers = louder masters.',
      ideal: 'Match your reference track\'s loudness for fair comparison'
    },
    'Peak Level (dB)': {
      explanation: 'The loudest single moment in your track. Should stay below -1dB to avoid clipping during format conversion.',
      ideal: 'Keep between -0.1dB to -3dB for headroom'
    },
    'Bass Level': {
      explanation: 'How much low-end energy (20-250Hz) is in your mix. Affects the weight and power of your track.',
      ideal: 'Should complement your genre and reference track'
    },
    'Mid Level': {
      explanation: 'Mid-frequency content (250Hz-4kHz) where vocals and most instruments live. Critical for clarity.',
      ideal: 'Usually the most important frequency range to get right'
    },
    'High Level': {
      explanation: 'High-frequency content (4kHz+) that adds sparkle, air, and definition to your mix.',
      ideal: 'Balance brightness without harshness'
    },
    'Dynamic Range': {
      explanation: 'The difference between loud and quiet parts. More dynamics = emotional impact, less = consistency.',
      ideal: 'Depends on genre - EDM can be limited, acoustic should be dynamic'
    },
    'Detected Key': {
      explanation: 'The musical key AI detected in your track. Useful for harmonic compatibility and mood.',
      ideal: 'Should match your reference if aiming for similar vibe'
    },
    'Brightness (Hz)': {
      explanation: 'The "center of mass" of your frequency spectrum. Higher = brighter sound, lower = warmer.',
      ideal: 'Compare to reference - huge impact on perceived character'
    },
    'Dominant Notes': {
      explanation: 'The most prominent musical notes in your track. Shows harmonic content and key centers.',
      ideal: 'Should align with your intended key and chord progressions'
    },
    'Energy Balance': {
      explanation: 'Whether harmonic (tonal) or percussive (rhythmic) elements dominate your mix.',
      ideal: 'Should match the energy style of your reference track'
    }
  };
  
  // Helper function to get comparison indicator
  const getComparisonIcon = (valueA, valueB, higherIsBetter = true) => {
    if (valueA === undefined || valueB === undefined || valueA === null || valueB === null) {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }
    
    if (valueA === valueB) return <Minus className="w-4 h-4 text-gray-400" />;
    
    const aIsHigher = valueA > valueB;
    if (higherIsBetter) {
      return aIsHigher ? 
        <TrendingUp className="w-4 h-4 text-green-400" /> : 
        <TrendingDown className="w-4 h-4 text-red-400" />;
    } else {
      return aIsHigher ? 
        <TrendingDown className="w-4 h-4 text-red-400" /> : 
        <TrendingUp className="w-4 h-4 text-green-400" />;
    }
  };

  const formatValue = (value) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') return value.toFixed(2);
    if (Array.isArray(value)) return value.join(', ');
    return value.toString();
  };

  // Technical metrics with tooltips
  const technicalMetrics = [
    { 
      label: 'Overall Loudness (LUFS)', 
      valueA: analysisA?.mixDiagnosisResults?.payload?.integrated_loudness_lufs, 
      valueB: analysisB?.mixDiagnosisResults?.payload?.integrated_loudness_lufs,
      higherIsBetter: false 
    },
    { 
      label: 'Peak Level (dB)', 
      valueA: analysisA?.mixDiagnosisResults?.payload?.peak_loudness_dbfs, 
      valueB: analysisB?.mixDiagnosisResults?.payload?.peak_loudness_dbfs,
      higherIsBetter: false 
    },
    { 
      label: 'Bass Level', 
      valueA: analysisA?.mixDiagnosisResults?.payload?.tonal_profile?.bass_frequency, 
      valueB: analysisB?.mixDiagnosisResults?.payload?.tonal_profile?.bass_frequency,
      isText: true 
    },
    { 
      label: 'Mid Level', 
      valueA: analysisA?.mixDiagnosisResults?.payload?.tonal_profile?.mid_frequency, 
      valueB: analysisB?.mixDiagnosisResults?.payload?.tonal_profile?.mid_frequency,
      isText: true 
    },
    { 
      label: 'High Level', 
      valueA: analysisA?.mixDiagnosisResults?.payload?.tonal_profile?.high_frequency, 
      valueB: analysisB?.mixDiagnosisResults?.payload?.tonal_profile?.high_frequency,
      isText: true 
    },
    { 
      label: 'Dynamic Range', 
      valueA: analysisA?.mixDiagnosisResults?.payload?.if_master_drc, 
      valueB: analysisB?.mixDiagnosisResults?.payload?.if_master_drc,
      isText: true 
    },
  ];

  // UPDATED: Musical metrics - REMOVED tempo and duration, kept only meaningful comparison data
  const musicalMetrics = [
    { 
      label: 'Detected Key', 
      valueA: librosaA?.estimated_key, 
      valueB: librosaB?.estimated_key,
      isText: true,
      icon: <Key className="w-4 h-4" />
    },
    { 
      label: 'Brightness (Hz)', 
      valueA: librosaA?.brightness?.average ? Math.round(librosaA.brightness.average) : null, 
      valueB: librosaB?.brightness?.average ? Math.round(librosaB.brightness.average) : null,
      higherIsBetter: null,
      icon: <Sparkles className="w-4 h-4" />
    },
    { 
      label: 'Dominant Notes', 
      valueA: librosaA?.dominant_notes?.slice(0, 3).join(', '), 
      valueB: librosaB?.dominant_notes?.slice(0, 3).join(', '), 
      isText: true,
      icon: <Music className="w-4 h-4" />
    },
    { 
      label: 'Energy Balance', 
      valueA: librosaA?.energy_balance?.dominant, 
      valueB: librosaB?.energy_balance?.dominant,
      isText: true,
      icon: <Volume2 className="w-4 h-4" />
    },
  ];

  return (
    <div className="space-y-8">
      {/* Technical Comparison */}
      <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Technical Mix Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-4 text-sm font-semibold text-gray-300 border-b border-gray-600 pb-2">
              <div>Metric</div>
              <div className="text-center">{filenameA}</div>
              <div className="text-center">{filenameB}</div>
            </div>
            
            {technicalMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`grid grid-cols-3 gap-4 items-center p-3 rounded-lg bg-black/30 border border-gray-700 relative`}
              >
                <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                  <span>{metric.label}</span>
                  <button
                    onClick={() => setActiveTooltip(activeTooltip === metric.label ? null : metric.label)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                  
                  {/* Tooltip */}
                  {activeTooltip === metric.label && metricTooltips[metric.label] && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 top-full left-0 right-0 mt-2 p-4 bg-black/95 border border-blue-500/30 rounded-lg text-xs"
                    >
                      <p className="text-gray-200 mb-2">{metricTooltips[metric.label].explanation}</p>
                      <p className="text-blue-300 text-xs"><strong>For Comparison:</strong> {metricTooltips[metric.label].ideal}</p>
                      <button 
                        onClick={() => setActiveTooltip(null)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      >
                        ×
                      </button>
                    </motion.div>
                  )}
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <span className="text-white font-semibold">{formatValue(metric.valueA)}</span>
                  {!metric.isText && metric.higherIsBetter !== null && (
                    <div className="ml-2">{getComparisonIcon(metric.valueA, metric.valueB, metric.higherIsBetter)}</div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-white font-semibold">{formatValue(metric.valueB)}</span>
                  {!metric.isText && metric.higherIsBetter !== null && (
                    <div className="ml-2">{getComparisonIcon(metric.valueB, metric.valueA, metric.higherIsBetter)}</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Musical Comparison - UPDATED without tempo/duration */}
      <Card className="backdrop-blur-xl bg-black/50 border border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <Music className="w-6 h-6 text-purple-400" />
            Musical Analysis Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-4 text-sm font-semibold text-gray-300 border-b border-gray-600 pb-2">
              <div>Musical Element</div>
              <div className="text-center">{filenameA}</div>
              <div className="text-center">{filenameB}</div>
            </div>
            
            {musicalMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`grid grid-cols-3 gap-4 items-center p-3 rounded-lg bg-purple-900/20 border border-purple-700/30 relative`}
              >
                <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                  {metric.icon}
                  <span>{metric.label}</span>
                  <button
                    onClick={() => setActiveTooltip(activeTooltip === metric.label ? null : metric.label)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                  
                  {/* Tooltip */}
                  {activeTooltip === metric.label && metricTooltips[metric.label] && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 top-full left-0 right-0 mt-2 p-4 bg-black/95 border border-purple-500/30 rounded-lg text-xs"
                    >
                      <p className="text-gray-200 mb-2">{metricTooltips[metric.label].explanation}</p>
                      <p className="text-purple-300 text-xs"><strong>For Comparison:</strong> {metricTooltips[metric.label].ideal}</p>
                      <button 
                        onClick={() => setActiveTooltip(null)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      >
                        ×
                      </button>
                    </motion.div>
                  )}
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <span className="text-white font-semibold">{formatValue(metric.valueA)}</span>
                  {!metric.isText && metric.higherIsBetter !== null && (
                    <div className="ml-2">{getComparisonIcon(metric.valueA, metric.valueB, metric.higherIsBetter)}</div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-white font-semibold">{formatValue(metric.valueB)}</span>
                  {!metric.isText && metric.higherIsBetter !== null && (
                    <div className="ml-2">{getComparisonIcon(metric.valueB, metric.valueA, metric.higherIsBetter)}</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function ComparisonResults({ comparison, onClose, inline = false }) {
  const navigate = useNavigate();

  // handleKoeRoast function and its associated button are removed as per instructions.

  if (!comparison) return null;

  if (comparison.error) {
    return (
      <Alert variant="destructive" className="mt-8 border-blue-500/30 bg-black/50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Comparison Failed</AlertTitle>
        <AlertDescription>{comparison.error}</AlertDescription>
        {!inline && (
          <Button onClick={onClose} className="mt-4 bg-gradient-to-r from-blue-500 to-blue-400">
            Try Again
          </Button>
        )}
      </Alert>
    );
  }

  const analysisA = comparison.analysisA?.mixDiagnosisResults?.payload;
  const analysisB = comparison.analysisB?.mixDiagnosisResults?.payload;
  const librosaA = comparison.librosaA;
  const librosaB = comparison.librosaB;

  // FIXED: Check for both possible field names for KOE summary
  const koeAnalysis = comparison.koeComparisonSummary || comparison.koe_comparison_summary;

  // This check ensures that VisualComparisonGrid only receives valid analysis data,
  // making it "resilient" by not rendering it if core data is missing.
  if (!analysisA || !analysisB) {
    return (
      <Alert variant="destructive" className="mt-8 border-blue-500/30 bg-black/50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Invalid Comparison Data</AlertTitle>
        <AlertDescription>The analysis completed, but the comparison data is missing or in an unexpected format. Please ensure both files were processed correctly.</AlertDescription>
        {!inline && (
          <Button onClick={onClose} className="mt-4 bg-gradient-to-r from-blue-500 to-blue-400">
            Compare New Tracks
          </Button>
        )}
      </Alert>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${inline ? 'mt-2' : 'mt-8'} space-y-8`}>
      {/* KOE's Analysis Card */}
      <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30 shadow-2xl">
        <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              🎯 KOE's Comprehensive Analysis
            </CardTitle>
        </CardHeader>
        <CardContent>
          {koeAnalysis ? (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-blue-300 mt-6 mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-blue-300 mt-6 mb-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-purple-300 mt-4 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-200 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-none text-gray-200 mb-4 space-y-2 pl-4">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-200 leading-relaxed flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
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
                    </code>
                  )
                }}
              >
                {koeAnalysis}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <p className="text-red-300 font-semibold">KOE Analysis Unavailable</p>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                The AI analysis couldn't be generated for this comparison. This might be due to API limits or a temporary service issue.
              </p>
              {!inline && (
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 text-sm"
                >
                  Try Refreshing
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visual Comparison Grid - WITH PROPER LIBROSA DATA */}
      <VisualComparisonGrid 
        analysisA={comparison.analysisA}
        analysisB={comparison.analysisB}
        librosaA={librosaA}
        librosaB={librosaB}
        filenameA={comparison.filenameA || 'Mix A'}
        filenameB={comparison.filenameB || 'Mix B'}
      />

      {/* Back Button - hide in inline mode */}
      {!inline && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Compare More Tracks
          </Button>
        </div>
      )}
    </motion.div>
  );
}
