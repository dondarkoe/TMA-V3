
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowLeft, Volume2, Music, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

// Simple volume meter with kid-friendly language
const VolumeMeter = ({ value, label, description, isGood }) => {
  const percentage = Math.min(Math.max(((value + 30) / 30) * 100, 0), 100);
  
  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-2xl">{label}</h3>
          {isGood ? 
            <CheckCircle className="w-8 h-8 text-blue-400" /> : 
            <AlertTriangle className="w-8 h-8 text-blue-400" />
          }
        </div>
        
        <div className="relative mb-8">
          <div className="w-full bg-black/50 rounded-full h-16 border border-blue-500/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 2, delay: 0.5 }}
              className={`h-full rounded-full ${
                isGood ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 
                'bg-gradient-to-r from-blue-400 to-blue-500'
              }`}
            />
          </div>
          <div className="flex justify-between mt-4 text-lg text-white/70">
            <span>😴 Quiet</span>
            <span>🎯 Perfect</span>
            <span>🔥 Too Loud</span>
          </div>
        </div>
        
        <div className="text-center bg-black/40 rounded-xl p-8 border border-blue-500/30">
          <p className="text-5xl font-bold text-white mb-4">{value}</p>
          <p className="text-white text-xl">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Simple frequency bars
const SoundBalance = ({ bassLevel, midLevel, highLevel }) => {
  const getBarHeight = (level) => {
    if (level === 'HIGH') return 90;
    if (level === 'MEDIUM') return 60;
    if (level === 'LOW') return 30;
    return 15;
  };

  const getBarColor = (level) => {
    if (level === 'HIGH') return 'from-blue-600 to-blue-400';
    if (level === 'MEDIUM') return 'from-blue-500 to-blue-400';
    if (level === 'LOW') return 'from-blue-400 to-blue-300';
    return 'from-gray-500 to-gray-300';
  };

  const SoundBar = ({ label, level, emoji, delay }) => (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-20 h-56 bg-black/50 rounded-xl border border-blue-500/30 flex items-end p-3">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${getBarHeight(level)}%` }}
          transition={{ duration: 1.5, delay }}
          className={`w-full rounded-lg bg-gradient-to-t ${getBarColor(level)}`}
        />
      </div>
      <div className="text-center">
        <p className="text-3xl mb-2">{emoji}</p>
        <p className="text-white font-bold text-xl">{label}</p>
        <p className="text-blue-300 text-lg font-semibold">{level}</p>
      </div>
    </div>
  );

  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center gap-3">
          <Music className="w-8 h-8 text-blue-400" />
          How Does Your Song Sound?
        </CardTitle>
        <p className="text-blue-300 text-lg">Are the low sounds, middle sounds, and high sounds balanced?</p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around items-end py-12">
          <SoundBar label="Bass" level={bassLevel} emoji="🎵" delay={0.2} />
          <SoundBar label="Mids" level={midLevel} emoji="🎶" delay={0.4} />
          <SoundBar label="Highs" level={highLevel} emoji="✨" delay={0.6} />
        </div>
        <div className="bg-black/40 rounded-lg p-6 border border-blue-500/30">
          <p className="text-white text-xl text-center">
            {bassLevel === 'MEDIUM' && midLevel === 'MEDIUM' && highLevel === 'MEDIUM' 
              ? "🎉 Awesome! Your song sounds really balanced!"
              : "🔧 Your song might sound better if you adjust some of the sound levels."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Quality check cards
const QualityCheck = ({ clipping, dynamicRange, stereoField }) => {
  const getIssueInfo = (issue) => {
    const issueStr = issue?.toString().toUpperCase();
    if (issueStr.includes('NONE') || issueStr.includes('GOOD')) {
      return { icon: CheckCircle, color: 'text-blue-400', bgColor: 'bg-blue-500/20', status: 'Great!', emoji: '✅' };
    }
    if (issueStr.includes('MINOR') || issueStr.includes('LESS')) {
      return { icon: AlertTriangle, color: 'text-blue-300', bgColor: 'bg-blue-500/10', status: 'Small Problem', emoji: '⚠️' };
    }
    if (issueStr.includes('MAJOR') || issueStr.includes('PROBLEM')) {
      return { icon: XCircle, color: 'text-blue-200', bgColor: 'bg-blue-500/5', status: 'Needs Help', emoji: '❌' };
    }
    return { icon: CheckCircle, color: 'text-gray-400', bgColor: 'bg-gray-500/20', status: 'Unknown', emoji: '❓' };
  };

  const QualityCard = ({ title, description, issue, explanation, emoji }) => {
    const { icon: Icon, color, bgColor, status } = getIssueInfo(issue);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`p-8 rounded-xl ${bgColor} border border-blue-500/30`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{emoji}</span>
            <h4 className="text-white font-bold text-xl">{title}</h4>
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
        <p className="text-white/90 text-lg mb-4">{description}</p>
        <div className="flex items-center gap-3">
          <span className={`font-bold text-lg ${color}`}>{status}</span>
          <span className="text-white/70">•</span>
          <span className="text-white/70">{explanation}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center gap-3">
          <Volume2 className="w-8 h-8 text-blue-400" />
          Is Your Song Healthy?
        </CardTitle>
        <p className="text-blue-300 text-lg">Let's check if there are any problems with your music</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <QualityCard
          title="Sound Breaking Up"
          description="Does your music sound crunchy or broken?"
          issue={clipping}
          explanation={clipping?.toString().toUpperCase().includes('NONE') ? 
            "Your music sounds clean!" : 
            "Some parts might sound broken or crunchy"
          }
          emoji="🔊"
        />
        
        <QualityCard
          title="Loud and Quiet Parts" 
          description="Are there good differences between loud and quiet parts?"
          issue={dynamicRange}
          explanation={dynamicRange?.toString().toUpperCase().includes('GOOD') ?
            "Perfect! Your song has nice ups and downs" :
            "Your song might be squished too much"
          }
          emoji="📊"
        />
        
        <QualityCard
          title="Left and Right Speakers"
          description="Does your song use both speakers well?"
          issue={stereoField}
          explanation={stereoField?.toString().includes('STEREO') ?
            "Great! Your song sounds wide" :
            "Your song could sound bigger"
          }
          emoji="🎧"
        />
      </CardContent>
    </Card>
  );
};

export default function SimpleAnalysisReport({ analysis, onBack }) {
  if (!analysis?.analysis_result?.mixDiagnosisResults?.payload) {
    return (
      <div className="min-h-screen p-6 md:p-8 flex items-center justify-center">
        <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30">
          <CardContent className="p-12 text-center">
            <XCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
            <p className="text-blue-300 mb-6">We couldn't find the results for this song.</p>
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
  const integratedLoudness = result.integrated_loudness_lufs || 0;
  const peakLoudness = result.peak_loudness_dbfs || 0;
  const clipping = result.clipping || 'UNKNOWN';
  const dynamicRange = result.if_master_drc || 'UNKNOWN';
  const stereoField = result.stereo_field || 'UNKNOWN';
  const bassFreq = result.tonal_profile?.bass_frequency || 'MEDIUM';
  const midFreq = result.tonal_profile?.mid_frequency || 'MEDIUM';
  const highFreq = result.tonal_profile?.high_frequency || 'MEDIUM';

  const hasLibrosaData = analysis?.librosa_tempo || 
                        analysis?.librosa_key || 
                        analysis?.librosa_energy_balance || 
                        analysis?.librosa_brightness || 
                        analysis?.librosa_dominant_notes || 
                        analysis?.librosa_duration || 
                        analysis?.librosa_beat_count;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white">🎵 Your Song Report</h1>
              <p className="text-blue-300 mt-2 text-xl">
                {analysis.filename} • {format(new Date(analysis.created_date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Musical Analysis Section - NEW */}
        {hasLibrosaData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-2xl">
                  <Music className="w-8 h-8 text-blue-400" />
                  Musical Analysis
                </CardTitle>
                <p className="text-blue-300 text-lg">Detailed insights about your song's musical properties.</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analysis.librosa_tempo && (
                    <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                      <div className="text-4xl font-bold text-white">{Math.round(analysis.librosa_tempo)}</div>
                      <div className="text-blue-300 text-lg">BPM</div>
                    </div>
                  )}
                  {analysis.librosa_key && (
                    <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                      <div className="text-2xl font-bold text-white">{analysis.librosa_key}</div>
                      <div className="text-green-300 text-lg">Key</div>
                    </div>
                  )}
                  {analysis.librosa_energy_balance && analysis.librosa_energy_balance.ratio !== undefined && (
                    <div className="text-center p-4 bg-orange-500/10 rounded-xl border border-orange-500/30">
                      <div className="text-2xl font-bold text-white">{analysis.librosa_energy_balance.ratio?.toFixed(2)}</div>
                      <div className="text-orange-300 text-lg">Energy Balance</div>
                    </div>
                  )}
                  {analysis.librosa_brightness && analysis.librosa_brightness.average !== undefined && (
                    <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                      <div className="text-2xl font-bold text-white">{Math.round(analysis.librosa_brightness.average)}</div>
                      <div className="text-purple-300 text-lg">Brightness (Hz)</div>
                    </div>
                  )}
                  {analysis.librosa_duration && (
                    <div className="text-center p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                      <div className="text-2xl font-bold text-white">{format(new Date(0, 0, 0, 0, 0, analysis.librosa_duration), 'mm:ss')}</div>
                      <div className="text-red-300 text-lg">Duration</div>
                    </div>
                  )}
                  {analysis.librosa_beat_count && (
                    <div className="text-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                      <div className="text-2xl font-bold text-white">{Math.round(analysis.librosa_beat_count)}</div>
                      <div className="text-yellow-300 text-lg">Beat Count</div>
                    </div>
                  )}
                  {analysis.librosa_dominant_notes && analysis.librosa_dominant_notes.length > 0 && (
                    <div className="col-span-2 md:col-span-4 text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                      <div className="text-2xl font-bold text-white">
                        {analysis.librosa_dominant_notes.join(', ')}
                      </div>
                      <div className="text-blue-300 text-lg">Dominant Notes</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analysis Content */}
        <div className="space-y-8">
          {/* Volume Meters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: hasLibrosaData ? 0.2 : 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <VolumeMeter
              value={`${integratedLoudness.toFixed(1)}`}
              label="How Loud Is Your Song?"
              description="This is how loud your whole song sounds"
              isGood={integratedLoudness > -18 && integratedLoudness < -8}
            />
            
            <VolumeMeter
              value={`${peakLoudness.toFixed(1)}`}
              label="Loudest Moment"
              description="This is the loudest part in your song"
              isGood={peakLoudness < -1}
            />
          </motion.div>

          {/* Sound Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: hasLibrosaData ? 0.3 : 0.2 }}
          >
            <SoundBalance 
              bassLevel={bassFreq}
              midLevel={midFreq} 
              highLevel={highFreq}
            />
          </motion.div>

          {/* Quality Check */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: hasLibrosaData ? 0.4 : 0.3 }}
          >
            <QualityCheck
              clipping={clipping}
              dynamicRange={dynamicRange}
              stereoField={stereoField}
            />
          </motion.div>

          {/* Streaming Platform Impact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: hasLibrosaData ? 0.5 : 0.4 }}
          >
            <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-3">
                  🎧 What Will Happen on Streaming Platforms?
                </CardTitle>
                <p className="text-blue-300 text-lg">Spotify and other platforms automatically adjust volume</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/30">
                    <h4 className="text-white font-bold text-xl mb-2">🎵 Spotify & YouTube</h4>
                    <div className="text-4xl font-bold mb-2">
                      {Math.max(0, integratedLoudness - (-14)) > 3 ? (
                        <span className="text-blue-300">They'll turn it down</span>
                      ) : (
                        <span className="text-blue-400">Perfect!</span>
                      )}
                    </div>
                    <p className="text-white/80">
                      {Math.max(0, integratedLoudness - (-14)) > 3 ? 
                        "Your song will be made quieter" : 
                        "Your song will stay the same volume"
                      }
                    </p>
                  </div>
                  
                  <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/30">
                    <h4 className="text-white font-bold text-xl mb-2">🍎 Apple Music</h4>
                    <div className="text-4xl font-bold mb-2">
                      {Math.max(0, integratedLoudness - (-16)) > 1 ? (
                        <span className="text-blue-300">They'll turn it down</span>
                      ) : (
                        <span className="text-blue-400">Perfect!</span>
                      )}
                    </div>
                    <p className="text-white/80">
                      {Math.max(0, integratedLoudness - (-16)) > 1 ? 
                        "Your song will be made quieter" : 
                        "Your song will stay the same volume"
                      }
                    </p>
                  </div>
                </div>
                
                <div className="bg-black/40 rounded-lg p-6 border border-blue-500/30 mt-6">
                  <p className="text-white text-xl text-center">
                    {(Math.max(0, integratedLoudness - (-14)) > 3 || Math.max(0, integratedLoudness - (-16)) > 1) ? 
                      "💡 Try making your song a little quieter so streaming apps don't turn it down!" :
                      "🎉 Amazing! Your song is perfect for streaming!"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
