import React, { useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { FileAudio, Clock, TrendingUp, ExternalLink, BarChart3, AlertTriangle, Loader2, MessageSquare } from "lucide-react";
import { createPageUrl } from '@/utils';

const statusConfig = {
  completed: { color: "bg-green-500/20 text-green-300 border-green-500/30", icon: FileAudio },
  analyzing: { color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: Loader2 },
  uploading: { color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: Loader2 },
  pending: { color: "bg-gray-500/20 text-gray-300 border-gray-500/30", icon: Clock },
  error: { color: "bg-red-500/20 text-red-300 border-red-500/30", icon: AlertTriangle }
};

export default function AnalysisCard({ file, analysis, index, onClick, onKoeRoast }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // FIXED: Handle both prop names for backward compatibility
  const item = file || analysis;

  if (!item) {
    console.error('AnalysisCard: No file or analysis prop provided');
    return null;
  }

  const isCompleted = item.analysis_status === 'completed';
  const config = statusConfig[item.analysis_status] || statusConfig.pending;
  const Icon = config.icon;

  // Extract analysis data if available
  const analysisData = item.analysis_result?.mixDiagnosisResults?.payload;

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
                <Icon className={`w-6 h-6 text-blue-300 ${['analyzing', 'uploading'].includes(item.analysis_status) ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h3 className={`font-semibold text-white text-lg transition-transform duration-300 ${
                  isHovered ? 'transform translate-x-1' : ''
                }`}>{item.filename}</h3>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock className="w-3 h-3" />
                  {format(new Date(item.created_date), 'MMM d, yyyy • HH:mm')}
                </div>
              </div>
            </div>
            <Badge className={`${config.color} font-medium`}>
              {item.analysis_status}
            </Badge>
          </div>

          {isCompleted && analysisData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 rounded-lg glass-card-blue">
                <div className="text-2xl font-bold text-white mb-1">
                  {analysisData.peak_loudness_dbfs?.toFixed(1) || 'N/A'} <span className="text-sm">dBFS</span>
                </div>
                <div className="text-xs text-blue-300">Loudest Moment</div>
              </div>
              <div className="text-center p-3 rounded-lg glass-card-blue">
                <div className="text-2xl font-bold text-blue-300 mb-1">
                  {analysisData.integrated_loudness_lufs?.toFixed(1) || 'N/A'} <span className="text-sm">LUFS</span>
                </div>
                <div className="text-xs text-blue-300">Overall Loudness</div>
              </div>
              <div className="text-center p-3 rounded-lg glass-card-blue">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {analysisData.if_master_drc || 'N/A'}
                </div>
                <div className="text-xs text-blue-300">Sound Balance</div>
              </div>
              <div className="text-center p-3 rounded-lg glass-card-blue">
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {analysisData.clipping || 'N/A'}
                </div>
                <div className="text-xs text-blue-300">Sound Quality</div>
              </div>
            </div>
          )}

          {/* Show loading message for non-completed analyses */}
          {!isCompleted && (
            <div className="mt-6 p-4 rounded-lg glass-card-blue text-center">
              <p className="text-blue-300 text-sm">
                {item.analysis_status === 'analyzing' && 'AI is checking your track...'}
                {item.analysis_status === 'uploading' && 'Uploading your song...'}
                {item.analysis_status === 'pending' && 'Your song is waiting to be checked...'}
                {item.analysis_status === 'error' && 'Something went wrong. Please try again.'}
              </p>
            </div>
          )}

          {isCompleted && (
            <div className="mt-6">
              {/* KOE Roast Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card onClick from triggering
                  window.location.href = createPageUrl('KOE') + `?analysisId=${item.id}`;
                }}
                className="bg-gradient-to-r from-red-500 via-purple-600 to-blue-600 hover:from-red-600 hover:via-purple-700 hover:to-blue-700 text-white font-semibold w-full"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                GET ROASTED BY KOE 🔥
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-blue-500/20">
            <div className="flex items-center gap-2 text-sm text-blue-300">
              {item.musical_style && (
                <>
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span>{item.musical_style.replace(/_/g, ' ')}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isCompleted && (
                <div className="flex items-center gap-1 text-xs text-blue-300">
                  <BarChart3 className="w-3 h-3" />
                  View Details
                </div>
              )}
              {item.file_url && (
                <a 
                  href={item.file_url}
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