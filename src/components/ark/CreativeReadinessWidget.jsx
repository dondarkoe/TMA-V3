import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, BookOpen, Brain, TrendingUp, Lightbulb } from 'lucide-react';

export default function CreativeReadinessWidget({ score, recommendation, contentOpportunities = [] }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRecommendationIcon = () => {
    switch (recommendation) {
      case 'CREATE': return <Zap className="w-5 h-5 text-green-400" />;
      case 'CONSUME': return <BookOpen className="w-5 h-5 text-blue-400" />;
      case 'PROCESS': return <Brain className="w-5 h-5 text-yellow-400" />;
      default: return <TrendingUp className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRecommendationMessage = () => {
    switch (recommendation) {
      case 'CREATE':
        return {
          title: 'READY TO CREATE',
          message: 'Your insights are deep and original. Create content now.',
          action: 'Start Creating'
        };
      case 'CONSUME':
        return {
          title: 'CONSUME FIRST',
          message: 'You need more diverse perspectives before creating.',
          action: 'Study & Learn'
        };
      case 'PROCESS':
        return {
          title: 'PROCESS EMOTIONS',
          message: 'Work through your current emotional state first.',
          action: 'Reflect More'
        };
      default:
        return {
          title: 'ANALYZING...',
          message: 'Building your creative profile.',
          action: 'Continue'
        };
    }
  };

  const recMessage = getRecommendationMessage();
  const highOpportunity = contentOpportunities.find(opp => opp.urgency === 'high');

  return (
    <Card className="backdrop-blur-xl bg-black/40 border border-orange-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          Creative Readiness
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            {/* Background Circle */}
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="2"
                strokeDasharray={`${score}, 100`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {score}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              {getRecommendationIcon()}
              <span className="text-lg font-semibold text-white">
                {recMessage.title}
              </span>
            </div>
            <p className="text-sm text-gray-300">
              {recMessage.message}
            </p>
          </div>
        </div>

        {/* High Priority Content Opportunity */}
        {highOpportunity && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg bg-green-500/10 border border-green-500/30"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-green-300 font-medium mb-1">
                  Ready to Create: {highOpportunity.title}
                </h4>
                <p className="text-xs text-green-200 mb-2">
                  Hook: "{highOpportunity.hook_suggestion}"
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-300">
                    Confidence: {highOpportunity.confidence_score}/10
                  </span>
                  <span className="px-2 py-0.5 bg-green-500/20 rounded text-xs text-green-300">
                    {highOpportunity.urgency.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Button */}
        <Button 
          className={`w-full transition-colors duration-300 ${
            recommendation === 'CREATE' 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : recommendation === 'CONSUME'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
          }`}
        >
          {recMessage.action}
        </Button>
      </CardContent>
    </Card>
  );
}