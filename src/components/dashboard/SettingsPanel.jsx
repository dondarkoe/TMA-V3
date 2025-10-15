
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, AlertTriangle, Brain, MessageSquare, Zap, Shield, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SettingsPanel({ settings, onSettingsChange, onClose, user }) {
  // Helper function to get intelligence level text
  const getIntelligenceText = (value) => {
    if (value <= 30) return 'Basic';
    if (value <= 70) return 'Advanced';
    return 'Genius';
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-full max-w-sm bg-black border-l border-white/20 shadow-2xl p-6 z-50 overflow-y-auto custom-scrollbar"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-white">TMA Settings</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-8">
        {/* Content Protocol Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <Label className="text-sm font-semibold text-red-400">Content Protocol</Label>
          </div>
          <p className="text-xs text-gray-400">
            Control content generation boundaries.
          </p>

          {/* Unrestricted Mode Toggle */}
          <div className="border border-red-500/30 bg-red-500/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="text-sm font-medium text-red-200">Unrestricted Mode (NSFW)</Label>
                <p className="text-xs text-red-300/80 mt-1">
                  Enables generation of any content, including explicit topics.
                </p>
              </div>
              <Switch
                checked={settings.unrestricted_mode || false}
                onCheckedChange={(value) => onSettingsChange('unrestricted_mode', value)}
                className="ml-4"
              />
            </div>
          </div>
        </div>

        {/* Intelligence Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-white" />
            <Label className="text-sm font-semibold text-white">Intelligence</Label>
          </div>
          <p className="text-xs text-gray-400">
            Control cognitive sophistication and analytical depth.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-300">Cognitive Level</Label>
              <span className="text-sm font-medium text-white">
                {getIntelligenceText(settings.cognitive_level || 50)}
              </span>
            </div>
            <Slider
              value={[settings.cognitive_level || 50]}
              onValueChange={(value) => onSettingsChange('cognitive_level', value[0])}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Higher levels enable complex reasoning, sophisticated vocabulary, and deeper analysis.
            </p>
          </div>
        </div>

        {/* Response Configuration Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-white" />
            <Label className="text-sm font-semibold text-white">Response Configuration</Label>
          </div>
          <p className="text-xs text-gray-400">
            Adjust response style and behavior.
          </p>

          <div className="space-y-2">
            <Label htmlFor="response-length" className="text-sm text-gray-300">
              Response Length
            </Label>
            <Select
              value={settings.response_length || 'default'}
              onValueChange={(value) => onSettingsChange('response_length', value)}
            >
              <SelectTrigger id="response-length" className="w-full bg-gray-900/50 border-gray-700">
                <SelectValue placeholder="Select response length..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model-preference" className="text-sm text-gray-300">
              Model Preference
            </Label>
            <Select
              value={settings.model_preference || 'balanced'}
              onValueChange={(value) => onSettingsChange('model_preference', value)}
            >
              <SelectTrigger id="model-preference" className="w-full bg-gray-900/50 border-gray-700">
                <SelectValue placeholder="Select model..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">Fast & Economical</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="creative">Creative & Powerful</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Engine Behavior Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-white" />
            <Label className="text-sm font-semibold text-white">Engine Behavior</Label>
          </div>
          <p className="text-xs text-gray-400">
            Control how the AI engines interact and respond.
          </p>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm text-gray-300">Auto-Context Switching</Label>
              <p className="text-xs text-gray-500">
                Automatically switch between engines based on context.
              </p>
            </div>
            <Switch
              checked={settings.auto_context_switching || false}
              onCheckedChange={(value) => onSettingsChange('auto_context_switching', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm text-gray-300">Technical Analysis Mode</Label>
              <p className="text-xs text-gray-500">
                Prioritize technical accuracy over creativity.
              </p>
            </div>
            <Switch
              checked={settings.technical_mode || false}
              onCheckedChange={(value) => onSettingsChange('technical_mode', value)}
            />
          </div>
        </div>

        {/* NEW: Admin Settings Section */}
        {user && user.role === 'admin' && (
          <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <Label className="text-sm font-semibold text-cyan-400">Admin Controls</Label>
            </div>
            <p className="text-xs text-gray-400">
              Manage global system configurations.
            </p>
            <Link to={createPageUrl('GlobalAISettings')}>
              <Button variant="outline" className="w-full justify-start gap-2 bg-gray-900/50 border-gray-700 hover:bg-gray-800">
                <Settings2 className="w-4 h-4" />
                Global AI Settings
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
