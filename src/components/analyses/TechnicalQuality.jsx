import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, Zap } from "lucide-react";

const QualityIndicator = ({ title, status, description, icon: Icon, delay = 0 }) => {
  const getStatusInfo = (status) => {
    const upperStatus = status?.toString().toUpperCase();
    
    if (upperStatus === 'NONE' || upperStatus === 'NORMAL' || status === false) {
      return { color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30', icon: CheckCircle, text: 'All good!' };
    } else if (upperStatus === 'MINOR' || upperStatus === 'LESS' || upperStatus === 'MORE') {
      return { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30', icon: AlertTriangle, text: 'Small issue' };
    } else if (upperStatus === 'MAJOR') {
      return { color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30', icon: AlertTriangle, text: 'Needs fixing!' };
    } else if (status === true) {
      return { color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30', icon: CheckCircle, text: 'Yes' };
    }
    
    return { color: 'text-white', bgColor: 'bg-black/40', borderColor: 'border-sky-500/20', icon: Info, text: status?.toString() || 'Unknown' };
  };

  const statusInfo = getStatusInfo(status);
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`p-4 rounded-lg ${statusInfo.bgColor} border ${statusInfo.borderColor}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${statusInfo.color}`} />
          <h4 className="text-white font-medium">{title}</h4>
        </div>
        <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
      </div>
      <p className={`text-lg font-bold ${statusInfo.color}`}>{statusInfo.text}</p>
      <p className="text-white/60 text-sm mt-1">{description}</p>
    </motion.div>
  );
};

const DynamicRangeBar = ({ value, delay = 0 }) => {
  const getDescription = (value) => {
    const upperValue = value?.toString().toUpperCase();
    switch(upperValue) {
      case 'LESS': return 'Your song has very little difference between quiet and loud parts. Try using less compression.';
      case 'MORE': return 'Your song has good dynamic range - nice difference between quiet and loud parts!';
      case 'NORMAL': return 'Your song has a normal amount of dynamic range.';
      default: return 'Dynamic range measures the difference between quiet and loud parts.';
    }
  };

  const getBarWidth = (value) => {
    const upperValue = value?.toString().toUpperCase();
    switch(upperValue) {
      case 'LESS': return 25;
      case 'MORE': return 85;
      case 'NORMAL': return 60;
      default: return 50;
    }
  };

  const getColor = (value) => {
    const upperValue = value?.toString().toUpperCase();
    switch(upperValue) {
      case 'LESS': return 'from-red-500 to-yellow-500';
      case 'MORE': return 'from-green-500 to-green-400';
      case 'NORMAL': return 'from-blue-500 to-sky-400';
      default: return 'from-gray-500 to-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-3"
    >
      <h4 className="text-white font-medium flex items-center gap-2">
        <Zap className="w-5 h-5 text-sky-400" />
        Dynamic Range (Quiet vs Loud Parts)
      </h4>
      
      <div className="relative">
        <div className="w-full bg-black/40 rounded-full h-4 border border-sky-500/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${getBarWidth(value)}%` }}
            transition={{ duration: 1.2, delay: delay + 0.3 }}
            className={`h-full rounded-full bg-gradient-to-r ${getColor(value)}`}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-white/60">
          <span>Squashed</span>
          <span>Perfect Balance</span>
          <span>Too Dynamic</span>
        </div>
      </div>
      
      <p className="text-white/70 text-sm">{getDescription(value)}</p>
    </motion.div>
  );
};

export default function TechnicalQuality({ analysisData }) {
  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-sky-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-sky-400" />
          Technical Stuff (The Nerdy Details)
        </CardTitle>
        <p className="text-white/70 text-sm">
          This checks if there are any technical problems with your song
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dynamic Range */}
        <DynamicRangeBar value={analysisData.if_master_drc} delay={0.1} />
        
        {/* Quality Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QualityIndicator
            title="Sound Breaking Up"
            status={analysisData.clipping}
            description="When your song is too loud and starts to sound bad"
            icon={AlertTriangle}
            delay={0.2}
          />
          
          <QualityIndicator
            title="Left vs Right Speaker"
            status={analysisData.stereo_field}
            description="How your song sounds in both speakers"
            icon={Info}
            delay={0.3}
          />
          
          <QualityIndicator
            title="Mono Compatibility"
            status={analysisData.mono_compatible}
            description="Will your song sound good on one speaker?"
            icon={CheckCircle}
            delay={0.4}
          />
          
          <QualityIndicator
            title="Phase Issues"
            status={analysisData.phase_issues}
            description="Technical problems that can make your song sound weird"
            icon={AlertTriangle}
            delay={0.5}
          />
        </div>

        {/* Audio Quality Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-black/40">
            <p className="text-2xl font-bold text-white">{analysisData.bit_depth}</p>
            <p className="text-xs text-white/60">Bit Depth</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-black/40">
            <p className="text-2xl font-bold text-white">{analysisData.sample_rate}</p>
            <p className="text-xs text-white/60">Sample Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}