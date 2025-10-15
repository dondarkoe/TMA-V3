import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { motion } from "framer-motion";
import { Music } from "lucide-react";

const getFrequencyLevel = (level) => {
  switch(level?.toUpperCase()) {
    case 'LOW': return 1;
    case 'LESS': return 2;
    case 'MEDIUM': return 3;
    case 'MORE': return 4;
    case 'HIGH': return 5;
    default: return 3;
  }
};

const getFrequencyDescription = (level) => {
  switch(level?.toUpperCase()) {
    case 'LOW': return 'Not enough';
    case 'LESS': return 'A bit low';
    case 'MEDIUM': return 'Just right';
    case 'MORE': return 'A bit much';
    case 'HIGH': return 'Too much';
    default: return 'Unknown';
  }
};

const getFrequencyColor = (level) => {
  switch(level?.toUpperCase()) {
    case 'LOW': return 'text-red-400';
    case 'LESS': return 'text-yellow-400';
    case 'MEDIUM': return 'text-green-400';
    case 'MORE': return 'text-yellow-400';
    case 'HIGH': return 'text-red-400';
    default: return 'text-white';
  }
};

export default function TonalProfileChart({ analysisData }) {
  const tonalProfile = analysisData.tonal_profile || {};
  
  const chartData = [
    {
      frequency: 'Bass',
      value: getFrequencyLevel(tonalProfile.bass_frequency),
      fullMark: 5,
    },
    {
      frequency: 'Low Mids',
      value: getFrequencyLevel(tonalProfile.low_mid_frequency),
      fullMark: 5,
    },
    {
      frequency: 'High Mids',
      value: getFrequencyLevel(tonalProfile.high_mid_frequency),
      fullMark: 5,
    },
    {
      frequency: 'Highs',
      value: getFrequencyLevel(tonalProfile.high_frequency),
      fullMark: 5,
    },
  ];

  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-sky-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Music className="w-5 h-5 text-sky-400" />
          What Your Song Sounds Like
        </CardTitle>
        <p className="text-white/70 text-sm">
          This shows the balance between low sounds (bass) and high sounds (treble)
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-64"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="rgba(59, 130, 246, 0.3)" />
                <PolarAngleAxis 
                  dataKey="frequency" 
                  tick={{ fill: '#e5e7eb', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 5]} 
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Level"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="rgba(59, 130, 246, 0.3)"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Frequency Breakdown */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/40">
                <span className="text-white">Bass (Low Sounds)</span>
                <span className={`font-bold ${getFrequencyColor(tonalProfile.bass_frequency)}`}>
                  {getFrequencyDescription(tonalProfile.bass_frequency)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/40">
                <span className="text-white">Low Mids (Warmth)</span>
                <span className={`font-bold ${getFrequencyColor(tonalProfile.low_mid_frequency)}`}>
                  {getFrequencyDescription(tonalProfile.low_mid_frequency)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/40">
                <span className="text-white">High Mids (Presence)</span>
                <span className={`font-bold ${getFrequencyColor(tonalProfile.high_mid_frequency)}`}>
                  {getFrequencyDescription(tonalProfile.high_mid_frequency)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/40">
                <span className="text-white">Highs (Brightness)</span>
                <span className={`font-bold ${getFrequencyColor(tonalProfile.high_frequency)}`}>
                  {getFrequencyDescription(tonalProfile.high_frequency)}
                </span>
              </div>
            </div>

            <div className="bg-sky-500/10 rounded-lg p-3 border border-sky-500/20">
              <p className="text-white/80 text-sm">
                <strong>What this means:</strong> A balanced song usually has "Just right" for all frequencies. 
                If something says "Not enough" or "Too much", you might want to adjust your EQ.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}