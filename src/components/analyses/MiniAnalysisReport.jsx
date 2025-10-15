import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileAudio, BarChart3, Music, TrendingUp, TrendingDown, Minus, Key, Clock, Volume2, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const formatValue = (value) => {
  if (value === undefined || value === null) return 'N/A';
  if (typeof value === 'number') return value.toFixed(1);
  return value.toString();
};

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'GOOD': 
    case 'NONE': 
      return 'text-green-400';
    case 'LIMITED':
    case 'MINOR': 
      return 'text-yellow-400';
    case 'MODERATE': 
      return 'text-orange-400';
    case 'POOR':
    case 'MAJOR': 
      return 'text-red-400';
    default: 
      return 'text-blue-300';
  }
};

const getStatusIcon = (status) => {
  switch (status?.toUpperCase()) {
    case 'GOOD': 
    case 'NONE': 
      return <CheckCircle className="w-3 h-3 text-green-400" />;
    case 'LIMITED':
    case 'MINOR':
    case 'MODERATE': 
      return <AlertCircle className="w-3 h-3 text-yellow-400" />;
    case 'POOR':
    case 'MAJOR': 
      return <AlertCircle className="w-3 h-3 text-red-400" />;
    default: 
      return <BarChart3 className="w-3 h-3 text-blue-300" />;
  }
};

const MetricCard = ({ label, value, status, icon: Icon, color }) => (
  <div className="bg-black/20 rounded-lg p-3 border border-white/10">
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-300 text-xs font-medium">{label}</span>
      {status && getStatusIcon(status)}
    </div>
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-blue-300" />}
      <span className={`font-semibold text-sm ${color || 'text-white'}`}>{value}</span>
    </div>
  </div>
);

export default function MiniAnalysisReport({ analysis }) {
  if (!analysis || !analysis.analysis_result || !analysis.analysis_result.mixDiagnosisResults || !analysis.analysis_result.mixDiagnosisResults.payload) {
    return (
      <Card className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 max-w-md">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Analysis data not available</span>
        </div>
      </Card>
    );
  }

  const result = analysis.analysis_result.mixDiagnosisResults.payload;
  const librosa = analysis.librosa_raw_data;

  return (
    <Card className="bg-gradient-to-br from-blue-900/60 to-blue-800/60 border border-blue-500/50 shadow-xl text-white max-w-2xl">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-blue-400/30">
          <div className="w-8 h-8 rounded-full bg-blue-500/50 flex items-center justify-center">
            <FileAudio className="w-4 h-4 text-blue-200" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm">{analysis.filename}</h3>
            <p className="text-blue-200 text-xs">
              {analysis.musical_style} • {analysis.is_master ? 'Master' : 'Mix'} • Analyzed {format(new Date(analysis.created_date), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>

        {/* Technical Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MetricCard 
            label="Loudness" 
            value={`${formatValue(result.integrated_loudness_lufs)} LUFS`}
            status={result.integrated_loudness_lufs > -10 ? 'POOR' : result.integrated_loudness_lufs > -16 ? 'GOOD' : 'LIMITED'}
            icon={Volume2}
            color={getStatusColor(result.integrated_loudness_lufs > -10 ? 'POOR' : result.integrated_loudness_lufs > -16 ? 'GOOD' : 'LIMITED')}
          />
          <MetricCard 
            label="Peak Level" 
            value={`${formatValue(result.peak_loudness_dbfs)} dBFS`}
            status={result.peak_loudness_dbfs > -1 ? 'POOR' : 'GOOD'}
            icon={TrendingUp}
            color={getStatusColor(result.peak_loudness_dbfs > -1 ? 'POOR' : 'GOOD')}
          />
          <MetricCard 
            label="Clipping" 
            value={result.clipping || 'Unknown'}
            status={result.clipping}
            icon={Zap}
            color={getStatusColor(result.clipping)}
          />
          <MetricCard 
            label="Dynamic Range" 
            value={result.if_master_drc || 'Unknown'}
            status={result.if_master_drc}
            icon={BarChart3}
            color={getStatusColor(result.if_master_drc)}
          />
        </div>

        {/* Frequency Balance */}
        {result.tonal_profile && (
          <div className="mb-4">
            <h4 className="text-blue-200 text-xs font-medium mb-2 flex items-center gap-2">
              <Music className="w-3 h-3" />
              Frequency Balance
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/20 rounded p-2 text-center border border-white/10">
                <div className="text-orange-300 text-xs">Bass</div>
                <div className="text-white text-sm font-semibold">{result.tonal_profile.bass_frequency || 'N/A'}</div>
              </div>
              <div className="bg-black/20 rounded p-2 text-center border border-white/10">
                <div className="text-yellow-300 text-xs">Mid</div>
                <div className="text-white text-sm font-semibold">{result.tonal_profile.mid_frequency || 'N/A'}</div>
              </div>
              <div className="bg-black/20 rounded p-2 text-center border border-white/10">
                <div className="text-cyan-300 text-xs">High</div>
                <div className="text-white text-sm font-semibold">{result.tonal_profile.high_frequency || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Musical Analysis */}
        {librosa && (
          <div className="mb-4">
            <h4 className="text-purple-200 text-xs font-medium mb-2 flex items-center gap-2">
              <Key className="w-3 h-3" />
              Musical Analysis
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {librosa.estimated_key && (
                <div className="bg-purple-900/20 rounded p-2 border border-purple-500/20">
                  <div className="text-purple-200 text-xs">Key</div>
                  <div className="text-white text-sm font-semibold">{librosa.estimated_key}</div>
                </div>
              )}
              {librosa.tempo && (
                <div className="bg-purple-900/20 rounded p-2 border border-purple-500/20">
                  <div className="text-purple-200 text-xs">Tempo</div>
                  <div className="text-white text-sm font-semibold">{formatValue(librosa.tempo)} BPM</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stereo Field */}
        {result.stereo_field && (
          <div className="bg-black/20 rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-xs font-medium flex items-center gap-2">
                <BarChart3 className="w-3 h-3" />
                Stereo Field
              </span>
              <span className="text-white text-sm font-semibold">{result.stereo_field}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}