import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Lightbulb, CheckCircle, AlertTriangle, Info } from "lucide-react";

const RecommendationItem = ({ text, type = 'info', delay = 0 }) => {
  const getIcon = () => {
    switch(type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };
  
  const getColor = () => {
    switch(type) {
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-sky-400';
    }
  };
  
  const getBgColor = () => {
    switch(type) {
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'success': return 'bg-green-500/10 border-green-500/20';
      default: return 'bg-sky-500/10 border-sky-500/20';
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`flex items-start gap-3 p-4 rounded-lg border ${getBgColor()}`}
    >
      <Icon className={`w-5 h-5 ${getColor()} mt-0.5 flex-shrink-0`} />
      <p className="text-white/90 leading-relaxed">{text}</p>
    </motion.div>
  );
};

const simplifyRecommendation = (text) => {
  // Convert technical language to simple explanations
  const simplified = text
    .replace(/dBFS/g, 'volume units')
    .replace(/LUFS/g, 'loudness units')
    .replace(/compression/gi, 'squashing the sound')
    .replace(/limiter/gi, 'volume limiter tool')
    .replace(/EQ/gi, 'tone controls')
    .replace(/frequency/gi, 'sound range')
    .replace(/gain staging/gi, 'volume levels')
    .replace(/multiband/gi, 'smart')
    .replace(/dynamics/gi, 'volume changes');
    
  return simplified;
};

const getRecommendationType = (text) => {
  if (text.toLowerCase().includes('clipping') || text.toLowerCase().includes('major') || text.toLowerCase().includes('problem')) {
    return 'warning';
  }
  if (text.toLowerCase().includes('good') || text.toLowerCase().includes('perfect') || text.toLowerCase().includes('excellent')) {
    return 'success';
  }
  return 'info';
};

export default function SimpleRecommendations({ analysisData }) {
  const summary = analysisData.summary?.summary || '';
  
  // Split the summary into individual recommendations
  const recommendations = summary
    .split(/\d+\./)
    .filter(rec => rec.trim().length > 0)
    .map(rec => rec.trim())
    .slice(0, 5); // Limit to 5 recommendations

  const hasRecommendations = recommendations.length > 0;

  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-sky-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-sky-400" />
          How to Make Your Song Even Better
        </CardTitle>
        <p className="text-white/70 text-sm">
          Simple tips to improve your mix, explained in plain English
        </p>
      </CardHeader>
      <CardContent>
        {hasRecommendations ? (
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <RecommendationItem
                key={index}
                text={simplifyRecommendation(recommendation)}
                type={getRecommendationType(recommendation)}
                delay={index * 0.1}
              />
            ))}
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-4 rounded-lg bg-black/40 border border-sky-500/20"
            >
              <p className="text-white/80 text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>
                  <strong>Remember:</strong> These are just suggestions! Always trust your ears and your creative vision. 
                  Your song might sound exactly how you want it to sound.
                </span>
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-white/60">No specific recommendations available for this track.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}