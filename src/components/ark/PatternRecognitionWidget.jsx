import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Calendar, Brain, AlertCircle } from 'lucide-react';

export default function PatternRecognitionWidget({ patterns, themes, knowledgeGaps }) {
  if (!patterns && !themes && !knowledgeGaps) {
    return (
      <Card className="backdrop-blur-xl bg-black/40 border border-orange-500/20">
        <CardContent className="p-6 text-center text-gray-400">
          <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Pattern analysis pending</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-black/40 border border-orange-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-orange-400" />
          Pattern Recognition
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Dominant Themes */}
        {themes && themes.length > 0 && (
          <div>
            <h4 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              Recurring Themes
            </h4>
            <div className="flex flex-wrap gap-2">
              {themes.slice(0, 5).map((theme, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-500/30"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Creative Patterns */}
        {patterns && (
          <div className="space-y-3">
            {patterns.best_creation_days && patterns.best_creation_days.length > 0 && (
              <div>
                <h4 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  Peak Creation Days
                </h4>
                <div className="flex flex-wrap gap-1">
                  {patterns.best_creation_days.map((day, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs border border-green-500/30"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patterns.recurring_blocks && patterns.recurring_blocks.length > 0 && (
              <div>
                <h4 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  Common Blocks
                </h4>
                <div className="space-y-1">
                  {patterns.recurring_blocks.slice(0, 3).map((block, index) => (
                    <div 
                      key={index}
                      className="text-xs text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/30"
                    >
                      {block}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {patterns.breakthrough_indicators && patterns.breakthrough_indicators.length > 0 && (
              <div>
                <h4 className="text-white text-sm font-medium mb-2">Breakthrough Patterns:</h4>
                <div className="space-y-1">
                  {patterns.breakthrough_indicators.slice(0, 2).map((indicator, index) => (
                    <div 
                      key={index}
                      className="text-xs text-blue-300 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/30"
                    >
                      {indicator}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Knowledge Gaps */}
        {knowledgeGaps && knowledgeGaps.length > 0 && (
          <div className="pt-3 border-t border-gray-700">
            <h4 className="text-white text-sm font-medium mb-2">Areas to Explore:</h4>
            <div className="space-y-1">
              {knowledgeGaps.slice(0, 3).map((gap, index) => (
                <div 
                  key={index}
                  className="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded"
                >
                  {gap}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}