import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, ThumbsDown, Sparkles, Lightbulb, Edit, Megaphone, CheckCircle } from 'lucide-react';

const ScoreBar = ({ label, score, max = 10 }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center text-xs">
      <span className="text-gray-300 font-medium">{label}</span>
      <span className="text-white font-semibold">{score || 0}/{max}</span>
    </div>
    <Progress value={((score || 0) / max) * 100} className="h-2" />
  </div>
);

// Helper to safely render fix items (string or object)
const renderFix = (fix) => {
  if (typeof fix === 'string') {
    return fix;
  } else if (typeof fix === 'object' && fix !== null) {
    // Handle object format like {timestamp, fix} or {time, description}
    const timestamp = fix.timestamp || fix.time || '';
    const description = fix.fix || fix.description || fix.text || '';
    if (timestamp && description) {
      return `${timestamp} → ${description}`;
    } else if (description) {
      return description;
    } else {
      // Fallback: convert object to string representation
      return JSON.stringify(fix);
    }
  }
  return 'Invalid fix format';
};

// Helper to safely render any value as a string
const safeRender = (value) => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export default function MikkiVideoAnalysisReport({ report }) {
  if (!report || typeof report !== 'object') {
    return (
      <Card className="bg-gray-900/50 border-red-500/30 text-red-300">
        <CardHeader>
          <CardTitle>Invalid Analysis Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The analysis data is missing or in an incorrect format.</p>
        </CardContent>
      </Card>
    );
  }

  // Direct key access with safe rendering
  const verdict = safeRender(report["10-Second Verdict"] || report["verdict"] || "No verdict provided.");
  const scores = report["Score"] || report["scores"] || {};
  const pacingLength = safeRender(report["Pacing/Length Calls"] || report["pacing_length"] || "-");
  const fixes = report["Top 5 Fixes"] || report["top_fixes"] || report["fixes"] || [];
  const hookRewrites = report["Hook Rewrites"] || report["hook_rewrites"] || [];
  const cta = safeRender(report["CTA"] || report["cta"] || "No CTA suggestion provided.");

  const scoreItems = [
    { label: "Hook", key: "Hook" },
    { label: "Clarity", key: "Clarity" },
    { label: "Placement", key: "Placement" },
    { label: "Pacing", key: "Pacing" },
    { label: "Value/sec", key: "Value-per-Second" },
    { label: "Emotion", key: "Emotion-Signal" },
    { label: "CTA", key: "CTA" },
  ];

  return (
    <Card className="bg-black/70 backdrop-blur-xl border border-white/10 text-white w-full max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="p-4 bg-white/5">
        <CardTitle className="text-lg font-bold text-cyan-300">MIKKI Video Analysis</CardTitle>
        <p className="text-sm text-gray-300 italic mt-1">"{verdict}"</p>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        
        {/* Scores Section */}
        <div>
          <h3 className="text-md font-semibold mb-3 text-white">Scores</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {scoreItems.map(item => {
              const score = scores[item.key] || scores[item.key.toLowerCase()] || 0;
              return (
                <ScoreBar key={item.key} label={item.label} score={score} />
              );
            })}
          </div>
        </div>

        {/* Pacing & Length */}
        <div>
          <h3 className="text-md font-semibold mb-2 text-white">Pacing & Length</h3>
          <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-300">
            {pacingLength}
          </div>
        </div>

        {/* Top Fixes */}
        {Array.isArray(fixes) && fixes.length > 0 && (
          <div>
            <h3 className="text-md font-semibold mb-3 text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Top Fixes
            </h3>
            <div className="space-y-3">
              {fixes.slice(0, 5).map((fix, index) => (
                <div key={index} className="flex items-start gap-3 bg-gray-800/30 rounded-lg p-3">
                  <Badge variant="outline" className="flex-shrink-0 text-xs">
                    {index + 1}
                  </Badge>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {safeRender(renderFix(fix))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hook Rewrites */}
        {Array.isArray(hookRewrites) && hookRewrites.length > 0 && (
          <div>
            <h3 className="text-md font-semibold mb-3 text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-green-400" />
              Hook Rewrites
            </h3>
            <div className="space-y-3">
              {hookRewrites.slice(0, 3).map((hook, index) => (
                <div key={index} className="bg-green-900/20 border-l-4 border-green-400 rounded-lg p-3">
                  <p className="text-sm text-green-100 font-medium leading-relaxed">
                    "{safeRender(hook)}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div>
          <h3 className="text-md font-semibold mb-2 text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-400" />
            Call to Action
          </h3>
          <div className="bg-purple-900/20 border border-purple-400/30 rounded-lg p-3">
            <p className="text-sm text-purple-100 leading-relaxed">
              {cta}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}