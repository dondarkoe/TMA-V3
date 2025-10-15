import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Brain, Clock, AlertTriangle, Zap, Target, ChevronDown, TrendingUp, MapPin, Calendar, Info } from 'lucide-react';
import { claudeBrainDumpAnalyzer } from '@/api/functions';
import { UserBrainDumpEntry } from '@/api/entities';
import { BrainDumpInsight } from '@/api/entities';

// Enhanced Stats Card Component with better spacing and sizing
const StatsCard = ({ icon: Icon, number, label, subtitle, delay = 0, infoTitle, infoContent }) => {
  const [animatedNumber, setAnimatedNumber] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  
  useEffect(() => {
    // Only animate numbers, not strings
    if (typeof number !== 'number') {
      setAnimatedNumber(number);
      return;
    }

    const timer = setTimeout(() => {
      const duration = 1500;
      const steps = 60;
      const increment = number / steps;
      let current = 0;
      
      const counter = setInterval(() => {
        current += increment;
        if (current >= number) {
          setAnimatedNumber(number);
          clearInterval(counter);
        } else {
          setAnimatedNumber(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(counter);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [number, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="relative"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500/5 to-orange-600/10 backdrop-blur-xl border border-orange-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 group min-h-[180px]">
        <CardContent className="p-6">
          {/* Header with icon and info button */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/30 border border-orange-500/30 flex items-center justify-center group-hover:from-orange-500/30 group-hover:to-orange-600/40 transition-all duration-300">
              <Icon className="w-6 h-6 text-orange-400" />
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 hover:bg-orange-500/20 transition-all duration-200"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          
          {/* Main Number - Reduced from text-4xl to text-2xl */}
          <div className="mb-4">
            <motion.div 
              className="text-2xl font-bold text-white leading-tight"
              style={{ 
                textShadow: '0 0 20px rgba(255, 147, 41, 0.3)',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {typeof number === 'string' ? number : animatedNumber}
              {typeof number === 'number' && number >= 100 ? '+' : ''}
            </motion.div>
          </div>
          
          {/* Labels - Better spacing */}
          <div className="space-y-2">
            <div className="text-white font-semibold text-base leading-tight">
              {label}
            </div>
            <div className="text-orange-300 text-sm font-medium leading-tight">
              {subtitle}
            </div>
          </div>
          
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </CardContent>
      </Card>

      {/* Expandable Info Section */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 overflow-hidden"
          >
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/15 backdrop-blur-xl border border-orange-500/30">
              <CardContent className="p-4">
                <h4 className="text-orange-300 font-semibold mb-2">{infoTitle}</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{infoContent}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function CreativeIntelligenceDashboard({ onCreateRecommendation }) {
  const [insight, setInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasNoBrainDumps, setHasNoBrainDumps] = useState(false);

  // Simple READ operation - just load the latest insight
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Loading latest BrainDumpInsight...');

      // Just get the latest insight - that's it!
      const insights = await BrainDumpInsight.list('-created_date', 1);
      const currentInsight = insights[0] || null;
      
      setInsight(currentInsight);

      // Handle missing data scenarios
      if (!currentInsight) {
        // Check if user has brain dumps but no insights generated yet
        const brainDumps = await UserBrainDumpEntry.list('-created_date', 1);
        if (brainDumps.length === 0) {
          setHasNoBrainDumps(true);
        } else {
          setError('Analysis needed - no insights generated yet');
        }
      } else if (currentInsight.recommendation === 'CREATE' && onCreateRecommendation) {
        onCreateRecommendation(currentInsight);
      }

    } catch (err) {
      console.error('Failed to load insight:', err);
      setError(`Failed to load intelligence: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [onCreateRecommendation]);

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('Force refreshing analysis...');

      const brainDumps = await UserBrainDumpEntry.list('-created_date', 1);
      if (brainDumps.length === 0) {
        setHasNoBrainDumps(true);
        return;
      }

      const latestBrainDump = brainDumps[0];
      const { data } = await claudeBrainDumpAnalyzer({
        latestBrainDumpId: latestBrainDump.id
      });

      if (data.success) {
        console.log('New analysis completed, reloading dashboard...');
        await loadDashboardData();
      } else {
        throw new Error(data.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('Force refresh failed:', error);
      setError(`Analysis failed: ${error.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative bg-black/40 backdrop-blur-sm border border-orange-500/20 rounded-2xl overflow-hidden shadow-xl p-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-10 h-10 text-orange-500" />
            </motion.div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Loading Your Creative Intelligence
          </h3>
          <p className="text-orange-300">
            Retrieving stored insights...
          </p>
        </div>
      </div>
    );
  }

  if (hasNoBrainDumps) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative bg-black/40 backdrop-blur-sm border border-gray-500/20 rounded-2xl overflow-hidden shadow-xl p-12 text-center">
          <Brain className="w-16 h-16 mx-auto mb-6 text-gray-600" />
          <h3 className="text-xl font-semibold text-white mb-4">No Creative Intelligence Data Yet</h3>
          <p className="text-gray-400">Submit brain dump entries to activate your dashboard</p>
        </div>
      </div>
    );
  }

  if (error && !insight) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative bg-black/40 backdrop-blur-sm border border-yellow-500/20 rounded-2xl overflow-hidden shadow-xl p-12 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-yellow-500" />
          <h3 className="text-xl font-semibold text-white mb-4">Intelligence Analysis Needed</h3>
          <p className="text-yellow-300 mb-6">
            You have brain dumps but no processed insights yet.
          </p>
          <Button 
            onClick={handleForceRefresh} 
            disabled={isRefreshing}
            className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-black font-semibold px-6 py-2 rounded-lg"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Intelligence...
              </>
            ) : (
              'Generate Intelligence'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-10 overflow-y-auto custom-scrollbar px-2">
      {/* Refresh Button - Top Right */}
      <div className="flex justify-end flex-shrink-0">
        <Button
          onClick={handleForceRefresh}
          variant="ghost"
          size="icon"
          disabled={isRefreshing}
          className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-all duration-200"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Executive Stats Cards Grid - Better spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 flex-shrink-0">
        {/* Readiness Score */}
        <StatsCard
          icon={TrendingUp}
          number={insight?.creative_readiness_score || 0}
          label="Readiness Score"
          subtitle="Creative readiness"
          delay={0.1}
          infoTitle="Creative Readiness Score"
          infoContent="Measures how ready you are to create content right now. Based on your emotional state, clarity of ideas, and recent insights. Higher scores mean you should create, lower scores suggest consuming or processing first."
        />

        {/* Current Story Phase */}
        <StatsCard
          icon={MapPin}
          number={insight?.current_story_arc || 'Unknown'}
          label="Current Phase"
          subtitle="Story arc journey"
          delay={0.2}
          infoTitle="Story Arc Phase"
          infoContent="Shows where you are in your creative journey. Chaos = exploring, Learning = absorbing, Breakthrough = connecting ideas, Teaching = sharing knowledge, Mastery = expert level insights."
        />

        {/* Brain Dump Entries */}
        <StatsCard
          icon={Brain}
          number={insight?.analysis_metadata?.total_brain_dumps_analyzed || 0}
          label="Brain Dumps"
          subtitle="Total entries"
          delay={0.3}
          infoTitle="Brain Dump Count"
          infoContent="Number of raw thoughts and ideas you've captured. More entries give the AI better insight into your creative patterns, emotional states, and content opportunities. Aim for consistency over quantity."
        />

        {/* Days Since Last Content */}
        <StatsCard
          icon={Calendar}
          number={'N/A'}
          label="Content Gap"
          subtitle="Create your first"
          delay={0.4}
          infoTitle="Content Creation Timing"
          infoContent="Tracks how long since your last content creation. Helps identify if you're in a creation drought or maintaining good momentum. Regular creation builds audience and creative muscle."
        />
      </div>

      {/* Recommendation Section - Better text sizing */}
      {insight?.recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex-shrink-0"
        >
          <Card className="bg-black/40 backdrop-blur-sm border border-orange-500/20 shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-white mb-4 leading-tight">
                      {insight.recommendation === 'CREATE' ? '🚀 CREATE NOW' : 
                       insight.recommendation === 'CONSUME' ? '📚 CONSUME FIRST' : 
                       '🧠 PROCESS EMOTIONS'}
                    </h3>
                    <p className="text-gray-300 text-base leading-relaxed">
                      {insight.smart_interventions?.[0]?.message || 'No specific action available'}
                    </p>
                  </div>
                </div>
                
                {insight.recommendation === 'CREATE' && (
                  <Button className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold px-6 py-3 flex-shrink-0">
                    Start Creating
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}