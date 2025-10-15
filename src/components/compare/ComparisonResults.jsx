import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle, BarChart3, Sparkles } from 'lucide-react';

// Helper component for displaying a single metric in a comparative row
const ComparisonRow = ({ label, valueA, valueB, unit = '', interpretation, icon: Icon, valueAClassName = '', valueBClassName = '' }) => {
  const getDifferenceIcon = () => {
    if (!interpretation) return null;

    if (interpretation.includes('exceeds threshold')) {
      const diff = parseFloat(valueA) - parseFloat(valueB);
      if (diff > 0) return <TrendingUp className="w-4 h-4 text-orange-400" />;
      if (diff < 0) return <TrendingDown className="w-4 h-4 text-blue-400" />;
    }
    if (interpretation.includes('differ') || interpretation.includes('Values are similar')) {
      if (valueA !== valueB) return <Minus className="w-4 h-4 text-yellow-400" />;
    }
    return null;
  };

  const formattedValueA = !isNaN(parseFloat(valueA)) ? `${parseFloat(valueA).toFixed(1)}${unit}` : valueA;
  const formattedValueB = !isNaN(parseFloat(valueB)) ? `${parseFloat(valueB).toFixed(1)}${unit}` : valueB;

  return (
    <div className="grid grid-cols-3 items-center py-3 border-b border-white/5 last:border-b-0">
      <div className="flex items-center gap-2 text-white font-medium text-sm">
        {Icon && <Icon className="w-4 h-4 text-blue-400" />}
        {label}
      </div>
      <div className={`text-center font-semibold text-white ${valueAClassName}`}>{formattedValueA}</div>
      <div className={`text-center font-semibold text-white ${valueBClassName}`}>{formattedValueB}</div>
    </div>
  );
};

export default function ComparisonResults({ result, onCompareAgain }) {
  if (!result) return null;

  if (result.error) {
    return (
      <Alert variant="destructive" className="mt-8 border-blue-500/30 bg-black/50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Comparison Failed</AlertTitle>
        <AlertDescription>{result.error}</AlertDescription>
        <Button onClick={onCompareAgain} className="mt-4 bg-gradient-to-r from-blue-500 to-blue-400">
          Try Again
        </Button>
      </Alert>
    );
  }

  const analysisA = result.analysisA?.mixDiagnosisResults?.payload;
  const analysisB = result.analysisB?.mixDiagnosisResults?.payload;

  if (!analysisA || !analysisB) {
    return (
      <Alert variant="destructive" className="mt-8 border-blue-500/30 bg-black/50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Invalid Comparison Data</AlertTitle>
        <AlertDescription>The analysis completed, but the comparison data is missing or in an unexpected format.</AlertDescription>
      </Alert>
    );
  }

  // Helper function to interpret differences
  const interpretDifference = (valueA, valueB, threshold = 1.0, label = '') => {
    if (isNaN(valueA) || isNaN(valueB)) {
      return valueA !== valueB ? 'Values differ.' : 'Values are the same.';
    }
    const diff = Math.abs(valueA - valueB);
    return diff > threshold ? `Difference of ${diff.toFixed(1)} exceeds threshold of ${threshold}` : 'Values are similar.';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-8">
      {/* KOE's Analysis Card - Now using saved summary */}
      <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            ✨ KOE's Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result.koeComparisonSummary ? (
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                {result.koeComparisonSummary}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-500/10 border border-gray-500/30 rounded-lg">
              <p className="text-gray-300">KOE comparison analysis was not available for this comparison.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Side-by-Side Comparison Results */}
      <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30 shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              📊 Side-by-Side Comparison
            </CardTitle>
            <Button variant="outline" onClick={onCompareAgain} className="border-blue-500/30 text-blue-300">
              Compare Again
            </Button>
          </div>
          
          {/* Column Headers */}
          <div className="grid grid-cols-3 gap-4 mt-6 pb-3 border-b border-blue-500/30">
            <div className="text-sm font-medium text-gray-400">Metric</div>
            <div className="text-center text-sm font-medium text-blue-300">
              {result.comparison?.filenameA}
            </div>
            <div className="text-center text-sm font-medium text-blue-300">
              {result.comparison?.filenameB}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loudness Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              🔊 Loudness
            </h3>
            <div className="space-y-2">
              <ComparisonRow
                label="Overall Loudness"
                valueA={analysisA.integrated_loudness_lufs?.toFixed(1) || 'N/A'}
                valueB={analysisB.integrated_loudness_lufs?.toFixed(1) || 'N/A'}
                unit=" LUFS"
                interpretation={interpretDifference(
                  analysisA.integrated_loudness_lufs, 
                  analysisB.integrated_loudness_lufs, 
                  1.0
                )}
              />
              <ComparisonRow
                label="Loudest Moment"
                valueA={analysisA.peak_loudness_dbfs?.toFixed(1) || 'N/A'}
                valueB={analysisB.peak_loudness_dbfs?.toFixed(1) || 'N/A'}
                unit=" dB"
                interpretation={interpretDifference(
                  analysisA.peak_loudness_dbfs, 
                  analysisB.peak_loudness_dbfs, 
                  1.0
                )}
              />
            </div>
          </div>

          {/* Quality Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              ✨ Sound Quality
            </h3>
            <div className="space-y-2">
              {/* Sound Breaking Up (Clipping) */}
              <div className="grid grid-cols-3 items-center py-3 border-b border-white/5">
                <div className="text-white font-medium text-sm">Sound Breaking Up</div>
                <div className="text-center">
                  <Badge className={analysisA.clipping === 'NONE' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                    {analysisA.clipping || 'Unknown'}
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge className={analysisB.clipping === 'NONE' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                    {analysisB.clipping || 'Unknown'}
                  </Badge>
                </div>
              </div>

              <ComparisonRow
                label="Sound Balance"
                valueA={analysisA.if_master_drc || 'N/A'}
                valueB={analysisB.if_master_drc || 'N/A'}
                interpretation={analysisA.if_master_drc !== analysisB.if_master_drc ? 'Values differ.' : 'Values are the same.'}
              />
            </div>
          </div>

          {/* Sound Character */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              🎵 Sound Character
            </h3>
            <div className="space-y-2">
              <ComparisonRow
                label="Sound Width"
                valueA={analysisA.stereo_field || 'N/A'}
                valueB={analysisB.stereo_field || 'N/A'}
                interpretation={analysisA.stereo_field !== analysisB.stereo_field ? 'Values differ.' : 'Values are the same.'}
              />
              <ComparisonRow
                label="Bass Level"
                valueA={analysisA.tonal_profile?.bass_frequency || 'N/A'}
                valueB={analysisB.tonal_profile?.bass_frequency || 'N/A'}
                interpretation={analysisA.tonal_profile?.bass_frequency !== analysisB.tonal_profile?.bass_frequency ? 'Values differ.' : 'Values are the same.'}
              />
              <ComparisonRow
                label="Mid Level"
                valueA={analysisA.tonal_profile?.mid_frequency || 'N/A'}
                valueB={analysisB.tonal_profile?.mid_frequency || 'N/A'}
                interpretation={analysisA.tonal_profile?.mid_frequency !== analysisB.tonal_profile?.mid_frequency ? 'Values differ.' : 'Values are the same.'}
              />
              <ComparisonRow
                label="High Level"
                valueA={analysisA.tonal_profile?.high_frequency || 'N/A'}
                valueB={analysisB.tonal_profile?.high_frequency || 'N/A'}
                interpretation={analysisA.tonal_profile?.high_frequency !== analysisB.tonal_profile?.high_frequency ? 'Values differ.' : 'Values are the same.'}
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center pt-6">
            <Button 
              onClick={onCompareAgain}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-8 py-3"
            >
              📊 Compare Another Set of Mixes
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}