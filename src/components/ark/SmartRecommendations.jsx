import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, AlertTriangle, Lightbulb, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartRecommendations({ interventions, onActionTaken }) {
  if (!interventions || interventions.length === 0) {
    return null;
  }

  const getInterventionIcon = (type) => {
    switch (type) {
      case 'stuck_detection': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'breakthrough_alert': return <Zap className="w-5 h-5 text-green-400" />;
      case 'consume_suggestion': return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'create_urgency': return <Lightbulb className="w-5 h-5 text-orange-400" />;
      default: return <Lightbulb className="w-5 h-5 text-gray-400" />;
    }
  };

  const getInterventionColor = (type, urgency) => {
    const baseColors = {
      stuck_detection: 'border-yellow-500/30 bg-yellow-500/10',
      breakthrough_alert: 'border-green-500/30 bg-green-500/10',
      consume_suggestion: 'border-blue-500/30 bg-blue-500/10',
      create_urgency: 'border-orange-500/30 bg-orange-500/10'
    };
    
    const urgencyOverride = urgency === 'high' ? 'border-red-500/40 bg-red-500/10' : '';
    return urgencyOverride || baseColors[type] || 'border-gray-500/30 bg-gray-500/10';
  };

  const getUrgencyBadge = (urgency) => {
    if (urgency === 'high') {
      return <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full text-xs font-medium">HIGH</span>;
    }
    if (urgency === 'medium') {
      return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium">MED</span>;
    }
    return null;
  };

  const handleActionClick = (intervention) => {
    // Mark as acknowledged (in a real app, this would update the backend)
    if (onActionTaken) {
      onActionTaken();
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-black/40 border border-orange-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-orange-400" />
          Smart Recommendations
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <AnimatePresence>
          {interventions.map((intervention, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getInterventionColor(intervention.type, intervention.urgency)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getInterventionIcon(intervention.type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium text-sm">
                      {intervention.type === 'stuck_detection' && 'Creative Stagnation Detected'}
                      {intervention.type === 'breakthrough_alert' && 'Breakthrough Momentum!'}
                      {intervention.type === 'consume_suggestion' && 'Study Recommendation'}
                      {intervention.type === 'create_urgency' && 'Create Now'}
                    </h4>
                    {getUrgencyBadge(intervention.urgency)}
                  </div>
                  
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {intervention.message}
                  </p>
                  
                  {intervention.action_items && intervention.action_items.length > 0 && (
                    <div className="space-y-1">
                      <h5 className="text-white text-xs font-medium">Action Items:</h5>
                      <ul className="space-y-1">
                        {intervention.action_items.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-xs text-gray-300 flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => handleActionClick(intervention)}
                    size="sm"
                    variant="outline"
                    className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Got it
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}