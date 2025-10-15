import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Loader2, Upload, BarChart3, CheckCircle, FileAudio } from 'lucide-react';

const ProgressStep = ({ icon: Icon, title, description, status, delay = 0 }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'active': return 'text-blue-400';
      case 'pending': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 border-green-500/30';
      case 'active': return 'bg-blue-500/20 border-blue-500/30';
      case 'pending': return 'bg-gray-500/20 border-gray-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-4 p-4"
    >
      <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${getStatusBg()}`}>
        {status === 'active' ? (
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        ) : status === 'completed' ? (
          <CheckCircle className="w-6 h-6 text-green-400" />
        ) : (
          <Icon className={`w-6 h-6 ${getStatusColor()}`} />
        )}
      </div>
      <div>
        <h3 className={`font-semibold ${getStatusColor()}`}>{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </motion.div>
  );
};

export default function ComparisonProgress({ stage, filenameA, filenameB }) {
  const stages = [
    {
      id: 'uploading',
      icon: Upload,
      title: 'Uploading Tracks',
      description: 'Securely uploading both audio files...'
    },
    {
      id: 'analyzing',
      icon: BarChart3,
      title: 'Analyzing Both Mixes',
      description: 'AI is examining and comparing your tracks...'
    },
    {
      id: 'completed',
      icon: CheckCircle,
      title: 'Comparison Complete',
      description: 'Generating your detailed comparison report...'
    }
  ];

  const getStageStatus = (stageId) => {
    const currentIndex = stages.findIndex(s => s.id === stage);
    const stageIndex = stages.findIndex(s => s.id === stageId);
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30 shadow-2xl">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Comparing Your Tracks</h2>
          <div className="flex items-center justify-center gap-4 text-gray-300">
            <div className="flex items-center gap-2">
              <FileAudio className="w-4 h-4" />
              <span className="text-sm">{filenameA}</span>
            </div>
            <span className="text-blue-400">vs</span>
            <div className="flex items-center gap-2">
              <FileAudio className="w-4 h-4" />
              <span className="text-sm">{filenameB}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {stages.map((stageItem, index) => (
            <ProgressStep
              key={stageItem.id}
              icon={stageItem.icon}
              title={stageItem.title}
              description={stageItem.description}
              status={getStageStatus(stageItem.id)}
              delay={index * 0.2}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            <span className="text-blue-300 text-sm">This usually takes 60-90 seconds</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}