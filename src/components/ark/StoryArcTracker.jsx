import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ArrowRight } from 'lucide-react';

export default function StoryArcTracker({ currentArc, emotionalState }) {
  const storyArcs = ['Chaos', 'Learning', 'Breakthrough', 'Teaching', 'Mastery'];
  const currentIndex = storyArcs.indexOf(currentArc);

  const getArcDescription = (arc) => {
    switch (arc) {
      case 'Chaos':
        return 'Exploring, experimenting, figuring things out';
      case 'Learning':
        return 'Absorbing knowledge, building skills';
      case 'Breakthrough':
        return 'Having insights, making connections';
      case 'Teaching':
        return 'Sharing knowledge, helping others';
      case 'Mastery':
        return 'Deep expertise, consistent creation';
      default:
        return 'Your creative journey';
    }
  };

  const getArcEmoji = (arc) => {
    switch (arc) {
      case 'Chaos': return '🌪️';
      case 'Learning': return '📚';
      case 'Breakthrough': return '💡';
      case 'Teaching': return '🎯';
      case 'Mastery': return '👑';
      default: return '🎭';
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-black/40 border border-orange-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-orange-400" />
          Your Creative Journey
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Arc Highlight */}
        <div className="text-center p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
          <div className="text-3xl mb-2">{getArcEmoji(currentArc)}</div>
          <h3 className="text-xl font-bold text-orange-300 mb-1">
            {currentArc} Phase
          </h3>
          <p className="text-sm text-orange-200">
            {getArcDescription(currentArc)}
          </p>
        </div>

        {/* Journey Progress */}
        <div className="space-y-3">
          <h4 className="text-white font-medium text-sm">Journey Progress:</h4>
          <div className="flex items-center justify-between">
            {storyArcs.map((arc, index) => (
              <div key={arc} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors duration-300 ${
                  index < currentIndex 
                    ? 'bg-green-500 text-white' 
                    : index === currentIndex
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {index < currentIndex ? '✓' : getArcEmoji(arc)}
                </div>
                <span className={`text-xs mt-1 ${
                  index === currentIndex ? 'text-orange-300' : 'text-gray-400'
                }`}>
                  {arc}
                </span>
                {index < storyArcs.length - 1 && (
                  <ArrowRight className={`w-3 h-3 mt-1 ${
                    index < currentIndex ? 'text-green-400' : 'text-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Emotional Context */}
        {emotionalState && (
          <div className="pt-3 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400">Confidence:</span>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-12 bg-gray-700 rounded-full h-1">
                    <div 
                      className="h-1 rounded-full bg-blue-400"
                      style={{ width: `${(emotionalState.confidence_level / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-white">{emotionalState.confidence_level}/10</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400">Clarity:</span>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-12 bg-gray-700 rounded-full h-1">
                    <div 
                      className="h-1 rounded-full bg-purple-400"
                      style={{ width: `${(emotionalState.clarity_score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-white">{emotionalState.clarity_score}/10</span>
                </div>
              </div>
            </div>
            {emotionalState.primary_emotion && (
              <p className="text-center text-sm text-gray-300 mt-2">
                Current vibe: <span className="text-orange-300">{emotionalState.primary_emotion}</span>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}