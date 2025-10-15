
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Loader2, Upload, Clock, CheckCircle, Film } from 'lucide-react';

const Step = ({ icon: Icon, title, description, status, delay = 0 }) => {
  const statusColors = {
    completed: { ring: 'border-green-500/30', bg: 'bg-green-500/20', text: 'text-green-300' },
    active: { ring: 'border-orange-500/30', bg: 'bg-orange-500/20', text: 'text-orange-300' },
    pending: { ring: 'border-white/10', bg: 'bg-white/5', text: 'text-white/60' }
  };
  const c = statusColors[status] || statusColors.pending;

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }} className="flex items-center gap-4 p-3">
      <div className={`w-12 h-12 rounded-full border ${c.ring} ${c.bg} flex items-center justify-center`}>
        {status === 'active' ? <Loader2 className="w-6 h-6 text-orange-300 animate-spin" /> :
          status === 'completed' ? <CheckCircle className="w-6 h-6 text-green-300" /> :
            <Icon className={`w-6 h-6 ${c.text}`} />}
      </div>
      <div>
        <div className={`font-semibold ${c.text}`}>{title}</div>
        <div className="text-xs text-white/60">{description}</div>
      </div>
    </motion.div>
  );
};

export default function VideoAnalysisProgress({ stage, filename }) {
  const steps = [
    { id: 'uploading', icon: Upload, title: 'Ingesting Your Vision', description: 'Securing your creative raw material...' },
    { id: 'activating', icon: Clock, title: 'Aligning The AI Array', description: "Preparing MIKKI's specialized team for deep analysis..." },
    { id: 'analyzing', icon: Film, title: 'Scrutinizing Your Content', description: 'MIKKI is dissecting every frame for nuanced insights...' },
    { id: 'completed', icon: CheckCircle, title: 'Insights Crystallized', description: 'Your personalized feedback is ready.' }
  ];

  const statusOf = (id) => {
    const order = steps.findIndex(s => s.id === id);
    const current = steps.findIndex(s => s.id === stage);
    if (order < current) return 'completed';
    if (order === current) return 'active';
    return 'pending';
  };

  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-orange-500/30 shadow-2xl">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-white mb-1">Scrutinizing Your Content</div>
          {filename && <div className="text-sm text-white/70">{filename}</div>}
        </div>
        <div className="space-y-2">
          {steps.map((s, i) => (
            <Step key={s.id} icon={s.icon} title={s.title} description={s.description} status={statusOf(s.id)} delay={i * 0.15} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-200 text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            This can take 15–90 seconds depending on file size
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
