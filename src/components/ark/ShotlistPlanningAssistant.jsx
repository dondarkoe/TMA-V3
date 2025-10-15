import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, X } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';

export default function ShotlistPlanningAssistant({ onShotlistGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const generateRecommendations = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const response = await InvokeLLM({
        prompt: `Based on this video concept: "${prompt}"
        
        Provide 4-6 shot recommendations. For each recommendation, suggest:
        - What scene/moment this covers
        - What type of shot would work (e.g., "wide shot", "close-up", "medium shot")  
        - Why this shot choice works for the concept
        
        Return as JSON with recommendations array.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scene: { type: "string" },
                  shot_suggestion: { type: "string" },
                  reasoning: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response?.recommendations) {
        setRecommendations(response.recommendations);
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (showRecommendations) {
    return (
      <Card className="backdrop-blur-xl bg-black/40 border border-orange-500/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" />
            Shot Recommendations for: "{prompt}"
          </CardTitle>
          <Button
            onClick={() => {
              setShowRecommendations(false);
              setRecommendations([]);
              setPrompt('');
            }}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-sm mb-4">
            Here are shot suggestions for your concept. Browse the shot library to find the perfect matches!
          </p>
          {recommendations.map((rec, index) => (
            <div key={index} className="p-4 bg-black/30 rounded-lg border border-orange-500/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-300 font-semibold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-orange-300 font-semibold mb-1">{rec.scene}</h4>
                  <p className="text-white text-sm mb-2">
                    <span className="text-orange-400">Suggested shot:</span> {rec.shot_suggestion}
                  </p>
                  <p className="text-gray-300 text-xs">{rec.reasoning}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-blue-300 text-sm">
              💡 <strong>How to use:</strong> Look through the Shot Library below and manually add shots that match these recommendations to your shotlist.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-black/40 border border-orange-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-400" />
          AI Shot Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Describe your video concept... e.g., 'music video for upbeat electronic track'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="bg-black/40 border-orange-500/30 text-white"
        />
        <Button
          onClick={generateRecommendations}
          disabled={!prompt.trim() || isGenerating}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Get Shot Recommendations
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}