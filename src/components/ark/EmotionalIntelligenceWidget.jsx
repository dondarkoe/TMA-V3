import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function EmotionalIntelligenceWidget({ emotionalState, trends }) {
  if (!emotionalState) {
    return (
      <Card className="backdrop-blur-xl bg-black/40 border border-orange-500/20">
        <CardContent className="p-6 text-center text-gray-400">
          <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Emotional analysis pending</p>
        </CardContent>
      </Card>
    );
  }

  const getEmotionColor = (level) => {
    if (level >= 8) return 'text-green-400';
    if (level >= 6) return 'text-yellow-400';
    if (level >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getEmotionIcon = (emotion) => {
    const emotions = {
      excited: '🚀',
      confident: '💪',
      frustrated: '😤',
      confused: '🤔',
      inspired: '✨',
      focused: '🎯',
      creative: '🎨',
      overwhelmed: '😵',
      motivated: '🔥',
      curious: '🧐',
      satisfied: '😌',
      anxious: '😰'
    };
    return emotions[emotion] || '🎭';
  };

  const metrics = [
    { label: 'Confidence', value: emotionalState.confidence_level, color: 'blue' },
    { label: 'Clarity', value: emotionalState.clarity_score, color: 'purple' },
    { label: 'Energy', value: emotionalState.energy_level, color: 'green' },
    { label: 'Frustration', value: emotionalState.frustration_level, color: 'red', inverted: true }
  ];

  return (
    <Card className="backdrop-blur-xl bg-black/40 border border-orange-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Heart className="w-5 h-5 text-orange-400" />
          Emotional Intelligence
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Primary Emotion */}
        {emotionalState.primary_emotion && (
          <div className="text-center p-3 rounded-lg bg-gray-800/50">
            <div className="text-2xl mb-1">
              {getEmotionIcon(emotionalState.primary_emotion)}
            </div>
            <p className="text-orange-300 font-medium capitalize">
              {emotionalState.primary_emotion.replace('_', ' ')}
            </p>
          </div>
        )}

        {/* Emotional Metrics */}
        <div className="space-y-3">
          {metrics.map((metric) => {
            const displayValue = metric.inverted ? 10 - metric.value : metric.value;
            const colorClass = getEmotionColor(displayValue);
            
            return (
              <div key={metric.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{metric.label}</span>
                  <span className={`font-medium ${colorClass}`}>
                    {metric.value}/10
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      metric.color === 'blue' ? 'bg-blue-400' :
                      metric.color === 'purple' ? 'bg-purple-400' :
                      metric.color === 'green' ? 'bg-green-400' :
                      'bg-red-400'
                    }`}
                    style={{ width: `${(metric.value / 10) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Trends */}
        {trends && (
          <div className="pt-3 border-t border-gray-700">
            <h4 className="text-white text-sm font-medium mb-2">Recent Patterns:</h4>
            <div className="space-y-1 text-xs">
              {trends.confidence && (
                <div className="flex items-center gap-2 text-gray-300">
                  {trends.confidence === 'rising' ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : trends.confidence === 'falling' ? (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  ) : (
                    <Minus className="w-3 h-3 text-yellow-400" />
                  )}
                  <span>Confidence {trends.confidence}</span>
                </div>
              )}
              {trends.energy && (
                <div className="flex items-center gap-2 text-gray-300">
                  {trends.energy === 'rising' ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : trends.energy === 'falling' ? (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  ) : (
                    <Minus className="w-3 h-3 text-yellow-400" />
                  )}
                  <span>Energy {trends.energy}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}