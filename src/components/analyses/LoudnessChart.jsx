import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Volume2, AlertTriangle, CheckCircle } from "lucide-react";

const LoudnessMeter = ({ value, target, label, unit, description, isGood }) => {
  const percentage = Math.min(Math.max(((value + 30) / 30) * 100, 0), 100);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">{label}</h4>
        {isGood ? 
          <CheckCircle className="w-4 h-4 text-green-400" /> : 
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
        }
      </div>
      <div className="relative">
        <div className="w-full bg-black/40 rounded-full h-6 border border-sky-500/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className={`h-full rounded-full ${
              isGood ? 'bg-gradient-to-r from-green-500 to-green-400' : 
              'bg-gradient-to-r from-yellow-500 to-red-500'
            }`}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-white/60">
          <span>Quiet</span>
          <span>LOUD</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-white">{value} {unit}</p>
        <p className="text-sm text-white/70">{description}</p>
      </div>
    </div>
  );
};

export default function LoudnessChart({ analysisData }) {
  const integratedLoudness = analysisData.integrated_loudness_lufs;
  const peakLoudness = analysisData.peak_loudness_dbfs;
  
  const spotifyReduction = Math.max(0, integratedLoudness - (-14));
  const appleReduction = Math.max(0, integratedLoudness - (-16));
  
  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-sky-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-sky-400" />
          How Loud Your Song Is
        </CardTitle>
        <p className="text-white/70 text-sm">
          This shows how loud your song is and how streaming apps will handle it
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <LoudnessMeter
            value={integratedLoudness?.toFixed(1)}
            target={-14}
            label="Overall Loudness"
            unit="LUFS"
            description="How loud your whole song sounds"
            isGood={integratedLoudness > -16 && integratedLoudness < -8}
          />
          
          <LoudnessMeter
            value={peakLoudness?.toFixed(1)}
            target={0}
            label="Loudest Peak"
            unit="dBFS"
            description="The loudest single moment"
            isGood={peakLoudness < -1}
          />
        </div>
        
        {/* Streaming Platform Impact */}
        <div className="bg-black/40 rounded-lg p-4 border border-sky-500/20">
          <h4 className="text-white font-medium mb-3">What Streaming Apps Will Do</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Spotify, YouTube, Tidal:</span>
              <span className={`font-bold ${spotifyReduction > 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                {spotifyReduction > 0 ? `-${spotifyReduction.toFixed(1)} dB` : 'Perfect!'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Apple Music:</span>
              <span className={`font-bold ${appleReduction > 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                {appleReduction > 0 ? `-${appleReduction.toFixed(1)} dB` : 'Perfect!'}
              </span>
            </div>
          </div>
          <p className="text-white/60 text-xs mt-3">
            {spotifyReduction > 3 || appleReduction > 1 ? 
              "Your song might be too loud. Streaming apps will turn it down automatically." :
              "Great! Your song won't be turned down by streaming apps."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}