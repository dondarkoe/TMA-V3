import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Video, 
  BookOpen, 
  Zap, 
  Music, 
  Camera,
  Clock,
  Target,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

const SHOTLIST_TEMPLATES = [
  {
    id: 'music_video',
    name: 'Music Video Template',
    icon: Music,
    description: 'Essential shots for a music video: artist performance, cutaways, and creative shots',
    shots: [
      { name: 'Establishing Wide Shot', script: 'Set the scene with your location/setup', duration: 3 },
      { name: 'Medium Performance Shot', script: 'Artist performing - main focal shot', duration: 8 },
      { name: 'Close-Up Performance', script: 'Tight shot of artist face/hands while performing', duration: 5 },
      { name: 'Instrument/Gear Close-Up', script: 'Details of equipment, hands on controls', duration: 4 },
      { name: 'Creative Angle Shot', script: 'Unique perspective - overhead, low angle, etc.', duration: 6 },
      { name: 'Cutaway/B-Roll', script: 'Supporting visuals - studio, lights, atmosphere', duration: 4 }
    ],
    totalDuration: 30,
    difficulty: 'Beginner',
    bestFor: ['Music Videos', 'Performance Content', 'Artist Showcase']
  },
  {
    id: 'social_story',
    name: 'Social Media Story',
    icon: Video,
    description: 'Perfect for behind-the-scenes and story content: close-ups, process shots, and personality',
    shots: [
      { name: 'Hook Shot', script: 'Attention-grabbing opener - face or action', duration: 2 },
      { name: 'Setup/Context Shot', script: 'Show what you\'re doing/where you are', duration: 4 },
      { name: 'Process Close-Up', script: 'Hands working, detailed action shot', duration: 6 },
      { name: 'Reaction/Personality', script: 'Your face reacting to what happened', duration: 3 },
      { name: 'Result/Reveal Shot', script: 'Show the outcome or final result', duration: 3 }
    ],
    totalDuration: 18,
    difficulty: 'Beginner',
    bestFor: ['Instagram Stories', 'TikTok', 'Behind the Scenes']
  },
  {
    id: 'tutorial',
    name: 'Tutorial/Educational',
    icon: BookOpen,
    description: 'Clear instructional shots: overview, details, step-by-step process, and results',
    shots: [
      { name: 'Introduction Shot', script: 'Medium shot introducing what you\'ll teach', duration: 5 },
      { name: 'Overview/Materials', script: 'Wide shot showing everything needed', duration: 4 },
      { name: 'Step 1 Detail', script: 'Close-up of first step/technique', duration: 8 },
      { name: 'Step 2 Detail', script: 'Close-up of second step/technique', duration: 8 },
      { name: 'Step 3 Detail', script: 'Close-up of third step/technique', duration: 8 },
      { name: 'Final Result', script: 'Show completed result/outcome', duration: 5 },
      { name: 'Recap/Call to Action', script: 'Medium shot wrapping up and engaging audience', duration: 4 }
    ],
    totalDuration: 42,
    difficulty: 'Intermediate',
    bestFor: ['YouTube Tutorials', 'Educational Content', 'How-To Videos']
  },
  {
    id: 'hype_teaser',
    name: 'Hype/Teaser',
    icon: Zap,
    description: 'Build anticipation with dynamic shots: quick cuts, dramatic angles, mystery shots',
    shots: [
      { name: 'Mystery Opening', script: 'Dark/obscured shot building intrigue', duration: 2 },
      { name: 'Quick Reveal Tease', script: 'Flash of what\'s coming - just a glimpse', duration: 1 },
      { name: 'Dramatic Low Angle', script: 'Power shot from below, building excitement', duration: 3 },
      { name: 'Detail/Texture Shot', script: 'Extreme close-up of relevant detail', duration: 2 },
      { name: 'Movement/Action', script: 'Dynamic shot with camera or subject movement', duration: 4 },
      { name: 'Final Tease', script: 'Almost reveal but cut away - leave them wanting more', duration: 3 }
    ],
    totalDuration: 15,
    difficulty: 'Advanced',
    bestFor: ['Teasers', 'Announcements', 'Hype Content']
  }
];

export default function ShotlistTemplateSelector({ onTemplateSelected }) {
  const handleUseTemplate = (template) => {
    if (template && onTemplateSelected) {
      const shots = template.shots.map((shot, index) => ({
        id: `template-${Date.now()}-${index}`,
        name: shot.name,
        script: shot.script,
        duration: shot.duration,
        description: shot.script,
        order: index + 1,
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=120&fit=crop'
      }));
      onTemplateSelected(shots);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Quick Start Templates</h3>
        <p className="text-gray-400">Click any template to instantly add shots to your list</p>
      </div>

      {/* Template Grid - Simplified for direct action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SHOTLIST_TEMPLATES.map((template) => {
          const IconComponent = template.icon;
          
          return (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="bg-black/40 border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 cursor-pointer"
                onClick={() => handleUseTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-500/20">
                        <IconComponent className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-base">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="text-xs bg-gray-600/50 text-gray-300">
                            {template.shots.length} shots
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {template.totalDuration}s
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center hover:bg-orange-700 transition-colors">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-300 text-sm mb-3">{template.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {template.bestFor.map((use, index) => (
                        <span key={index} className="px-2 py-1 bg-orange-500/10 rounded text-xs text-orange-300">
                          {use}
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {template.shots.slice(0, 3).map(shot => shot.name).join(', ')}
                      {template.shots.length > 3 && ` + ${template.shots.length - 3} more`}
                    </div>
                  </div>

                  {/* Instant action hint */}
                  <div className="mt-3 pt-3 border-t border-orange-500/20">
                    <p className="text-orange-300 text-xs font-medium">
                      💡 Click to instantly add all {template.shots.length} shots to your list
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}