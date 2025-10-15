import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, Music, BarChart3, MessageSquare, Download, ExternalLink, Clock, Drum, Key, Waves, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

// Musical Analysis Component for Detail View
const MusicalAnalysisCard = ({ analysis }) => {
  const hasLibrosaData = analysis?.librosa_tempo || 
                        analysis?.librosa_key || 
                        analysis?.librosa_energy_balance || 
                        analysis?.librosa_brightness || 
                        analysis?.librosa_dominant_notes || 
                        analysis?.librosa_duration || 
                        analysis?.librosa_beat_count;

  if (!hasLibrosaData) {
    return (
      <Card className="backdrop-blur-xl bg-black/60 border border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Music className="w-5 h-5 text-blue-400" />
            Musical Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Musical analysis data not available for this track.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper functions for interpretations
  const getTempoCategory = (bpm) => {
    if (bpm < 90) return "Slow (Hip-Hop/Chill)";
    if (bpm < 120) return "Medium (Pop/Rock)";
    if (bpm < 150) return "Fast (House/Dance)";
    return "Very Fast (D&B/Hardcore)";
  };

  const getEnergyDescription = (ratio) => {
    if (ratio > 0.7) return "Very melodic - needs more drums/rhythm";
    if (ratio >= 0.5) return "Balanced melody and rhythm";
    if (ratio >= 0.3) return "Rhythm-focused - strong groove";
    return "Very percussive - drum-heavy";
  };

  const getBrightnessDescription = (hz) => {
    if (hz < 2000) return "Dark/muddy - needs high-end clarity";
    if (hz < 4000) return "Well-balanced frequencies";
    if (hz < 6000) return "Bright - good presence";
    return "Very bright - potentially harsh";
  };

  const getDurationDescription = (seconds) => {
    if (seconds < 60) return "Short track/loop";
    if (seconds < 180) return "Standard radio length";
    if (seconds < 300) return "Extended/DJ version";
    return "Long/epic track";
  };

  return (
    <Card className="backdrop-blur-xl bg-black/60 border border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Music className="w-5 h-5 text-blue-400" />
          Musical Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Tempo */}
          {analysis.librosa_tempo && (
            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="flex items-center gap-2">
                <Drum className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Tempo</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{Math.round(analysis.librosa_tempo)} BPM</div>
                <div className="text-xs text-blue-300">{getTempoCategory(analysis.librosa_tempo)}</div>
              </div>
            </div>
          )}

          {/* Key */}
          {analysis.librosa_key && (
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Key</span>
              </div>
              <div className="text-white font-semibold">{analysis.librosa_key}</div>
            </div>
          )}

          {/* Energy Balance */}
          {analysis.librosa_energy_balance && (
            <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300">Energy Balance</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{analysis.librosa_energy_balance.ratio?.toFixed(2)}</div>
                <div className="text-xs text-orange-300">{getEnergyDescription(analysis.librosa_energy_balance.ratio)}</div>
              </div>
            </div>
          )}

          {/* Brightness */}
          {analysis.librosa_brightness && (
            <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Brightness</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{Math.round(analysis.librosa_brightness.average)} Hz</div>
                <div className="text-xs text-purple-300">{getBrightnessDescription(analysis.librosa_brightness.average)}</div>
              </div>
            </div>
          )}

          {/* Duration */}
          {analysis.librosa_duration && (
            <div className="flex items-center justify-between p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300">Duration</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{analysis.librosa_duration.toFixed(1)}s</div>
                <div className="text-xs text-cyan-300">{getDurationDescription(analysis.librosa_duration)}</div>
              </div>
            </div>
          )}

          {/* Beat Count */}
          {analysis.librosa_beat_count && (
            <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Beat Count</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{analysis.librosa_beat_count}</div>
                <div className="text-xs text-yellow-300">Detected beats</div>
              </div>
            </div>
          )}
        </div>

        {/* Dominant Notes */}
        {analysis.librosa_dominant_notes && analysis.librosa_dominant_notes.length > 0 && (
          <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <span className="text-gray-300">Dominant Notes</span>
            </div>
            <div className="flex gap-2">
              {analysis.librosa_dominant_notes.map((note, index) => (
                <Badge key={index} className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                  {note}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function AnalysisDetail({ analysis, onBack }) {
  const navigate = useNavigate();
  const [showRawData, setShowRawData] = useState(false);

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Analysis not found</p>
        <Button 
          variant="outline" 
          onClick={onBack || (() => navigate(createPageUrl('Analyses')))}
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Analyses
        </Button>
      </div>
    );
  }

  const result = analysis.analysis_result?.mixDiagnosisResults?.payload;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack || (() => navigate(createPageUrl('Analyses')))}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-white">{analysis.filename}</h1>
          <p className="text-gray-400">
            Analyzed on {format(new Date(analysis.created_date), 'PPP')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate(createPageUrl('KoeChat') + `?analysisId=${analysis.id}`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Discuss with KOE
          </Button>
        </div>
      </div>

      {/* Musical Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <MusicalAnalysisCard analysis={analysis} />
      </motion.div>

      {/* KOE's Analysis Summary */}
      {analysis.koe_summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-xl bg-black/60 border border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5 text-green-400" />
                KOE's Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="text-gray-100 leading-relaxed mb-3">{children}</p>,
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="text-blue-300">{children}</em>
                  }}
                >
                  {analysis.koe_summary}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Technical Analysis */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="backdrop-blur-xl bg-black/60 border border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="w-5 h-5 text-orange-400" />
                Technical Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Overall Loudness:</span>
                    <span className="text-white font-mono">{result.integrated_loudness_lufs?.toFixed(1) || 'N/A'} LUFS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Peak Level:</span>
                    <span className="text-white font-mono">{result.peak_loudness_dbfs?.toFixed(1) || 'N/A'} dB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Dynamic Range:</span>
                    <span className="text-white font-mono">{result.if_master_drc || 'Unknown'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Clipping:</span>
                    <span className="text-white font-mono">{result.clipping || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Stereo Field:</span>
                    <span className="text-white font-mono">{result.stereo_field || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {result.tonal_profile && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <h4 className="text-white font-semibold mb-2">Frequency Balance</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-gray-300 text-sm">Bass</div>
                      <div className="text-white font-mono">{result.tonal_profile.bass_frequency || 'Unknown'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-300 text-sm">Mid</div>
                      <div className="text-white font-mono">{result.tonal_profile.mid_frequency || 'Unknown'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-300 text-sm">High</div>
                      <div className="text-white font-mono">{result.tonal_profile.high_frequency || 'Unknown'}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Raw Data (Collapsible) */}
      {(analysis.librosa_raw_data || result) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="backdrop-blur-xl bg-black/60 border border-gray-500/30">
            <CardHeader>
              <CardTitle 
                className="flex items-center justify-between cursor-pointer text-gray-300 hover:text-white transition-colors"
                onClick={() => setShowRawData(!showRawData)}
              >
                <span>Advanced: Raw Analysis Data</span>
                <Button variant="ghost" size="sm">
                  {showRawData ? <ArrowLeft className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            {showRawData && (
              <CardContent>
                <div className="space-y-4">
                  {analysis.librosa_raw_data && (
                    <div>
                      <h4 className="text-white font-semibold mb-2">Librosa Musical Analysis</h4>
                      <pre className="bg-gray-800/50 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                        {JSON.stringify(analysis.librosa_raw_data, null, 2)}
                      </pre>
                    </div>
                  )}
                  {result && (
                    <div>
                      <h4 className="text-white font-semibold mb-2">Tonn Technical Analysis</h4>
                      <pre className="bg-gray-800/50 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );
}