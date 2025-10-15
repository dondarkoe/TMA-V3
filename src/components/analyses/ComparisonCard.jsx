import React, { useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { FileAudio, Clock, ArrowLeftRight, ExternalLink, BarChart3, AlertTriangle, Loader2, MessageSquare } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const statusConfig = {
  completed: { color: "bg-green-500/20 text-green-300 border-green-500/30", icon: FileAudio },
  processing: { color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: Loader2 },
  error: { color: "bg-red-500/20 text-red-300 border-red-500/30", icon: AlertTriangle }
};

export default function ComparisonCard({ comparison, index, onClick }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const isCompleted = comparison.status === 'completed';
  const config = statusConfig[comparison.status] || statusConfig.processing;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={isCompleted ? { y: -2 } : {}}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="will-change-transform"
    >
      <Card 
        className={`glass-card relative overflow-hidden transition-all duration-300 will-change-transform ${
          isCompleted ? 'hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] cursor-pointer' : 'opacity-80'
        }`}
        onClick={onClick}
        style={{
          transform: isHovered && isCompleted ? 'scale(1.01) translateY(-4px)' : 'scale(1) translateY(0)',
          boxShadow: isHovered && isCompleted ? '0 20px 40px rgba(59, 130, 246, 0.15)' : '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Subtle gradient overlay on hover */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent transition-opacity duration-300"
          style={{ opacity: isHovered && isCompleted ? 1 : 0 }}
        />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl glass-card-blue flex items-center justify-center">
                <Icon className={`w-6 h-6 text-blue-300 ${comparison.status === 'processing' ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h3 className={`font-semibold text-white text-lg transition-transform duration-300 ${
                  isHovered ? 'transform translate-x-1' : ''
                }`}>Mix Comparison</h3>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock className="w-3 h-3" />
                  {format(new Date(comparison.created_date), 'MMM d, yyyy • HH:mm')}
                </div>
              </div>
            </div>
            <Badge className={`${config.color} font-medium`}>
              {comparison.status}
            </Badge>
          </div>

          {/* File comparison info */}
          <div className="mb-4 p-3 rounded-lg glass-card-blue">
            <div className="flex items-center justify-center gap-2 text-sm text-blue-300 mb-2">
              <ArrowLeftRight className="w-4 h-4" />
              <span>Comparing</span>
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-medium text-sm truncate">{comparison.filenameA}</p>
              <p className="text-gray-400 text-xs">vs</p>
              <p className="text-white font-medium text-sm truncate">{comparison.filenameB}</p>
            </div>
          </div>

          {isCompleted && comparison.analysisA?.mixDiagnosisResults?.payload && comparison.analysisB?.mixDiagnosisResults?.payload && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-3 rounded-lg glass-card-blue">
                <div className="text-sm font-bold text-white mb-1">
                  {comparison.analysisA.mixDiagnosisResults.payload.integrated_loudness_lufs?.toFixed(1) || 'N/A'} 
                  <span className="text-xs"> LUFS</span>
                </div>
                <div className="text-xs text-blue-300">Mix A Loudness</div>
              </div>
              <div className="text-center p-3 rounded-lg glass-card-blue">
                <div className="text-sm font-bold text-white mb-1">
                  {comparison.analysisB.mixDiagnosisResults.payload.integrated_loudness_lufs?.toFixed(1) || 'N/A'} 
                  <span className="text-xs"> LUFS</span>
                </div>
                <div className="text-xs text-blue-300">Mix B Loudness</div>
              </div>
            </div>
          )}

          {/* Show loading message for non-completed comparisons */}
          {!isCompleted && (
            <div className="mt-6 p-4 rounded-lg glass-card-blue text-center">
              <p className="text-blue-300 text-sm">
                {comparison.status === 'processing' && 'Analyzing both mixes...'}
                {comparison.status === 'error' && 'Something went wrong. Please try again.'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-blue-500/20">
            <div className="flex items-center gap-2 text-sm text-blue-300">
              {comparison.musicalStyle && (
                <>
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span>{comparison.musicalStyle.replace(/_/g, ' ')}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isCompleted && (
                <>
                  {/* KOE Roast Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = createPageUrl('KOE') + `?comparisonId=${comparison.id}`;
                    }}
                    className="bg-gradient-to-r from-red-500 via-purple-600 to-blue-600 hover:from-red-600 hover:via-purple-700 hover:to-blue-700 text-white font-semibold flex-1 px-3 py-1 h-auto"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    GET ROASTED BY KOE 🔥
                  </Button>
                </>
              )}
              {comparison.fileUrlA && (
                <a 
                  href={comparison.fileUrlA} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}