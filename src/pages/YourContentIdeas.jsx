
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Trash2, 
  Video,
  Copy,
  Calendar,
  Plus,
  Filter,
  Eye, // Added Eye icon
  X, // Added X icon
  Edit3 // Added Edit3 icon
} from 'lucide-react';
import { ContentIdea } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EngineLayout from '../components/layout/EngineLayout';

export default function YourContentIdeasPage() {
  const [contentIdeas, setContentIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedScript, setSelectedScript] = useState(null); // New state for selected script

  useEffect(() => {
    loadContentIdeas();
  }, []);

  const loadContentIdeas = async () => {
    setIsLoading(true);
    try {
      const ideas = await ContentIdea.list('-created_date', 50);
      setContentIdeas(ideas);
    } catch (error) {
      console.error('Failed to load content ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContentIdea = async (id) => {
    if (!confirm('Are you sure you want to delete this content idea?')) return;
    
    try {
      await ContentIdea.delete(id);
      setContentIdeas(prev => prev.filter(idea => idea.id !== id));
      // If the deleted idea was currently open in the modal, close the modal
      if (selectedScript && selectedScript.id === id) {
        setSelectedScript(null);
      }
    } catch (error) {
      console.error('Failed to delete content idea:', error);
    }
  };

  const copyScript = (script) => {
    navigator.clipboard.writeText(script)
      .then(() => {
        // Optionally, add a toast notification here
        console.log("Script copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy script:", err);
      });
  };

  const filteredIdeas = contentIdeas.filter(idea => {
    if (filter === 'all') return true;
    if (filter === 'approved') return idea.status === 'approved';
    if (filter === 'draft') return idea.status === 'draft';
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString; // Return original string if invalid date
    }
  };

  const getContentTypeColor = (type) => {
    const colors = {
      social_media: 'bg-blue-500/20 text-blue-300',
      music_video: 'bg-purple-500/20 text-purple-300',
      educational: 'bg-green-500/20 text-green-300',
      promotional: 'bg-orange-500/20 text-orange-300',
      story: 'bg-pink-500/20 text-pink-300'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-300';
  };

  return (
    <EngineLayout 
      engineType="ARK" 
      currentPageName="YourContentIdeas"
      defaultTool="content-ideas"
    >
      <div className="h-full flex flex-col space-y-8 overflow-hidden px-4">
        
        {/* PAGE HEADER */}
        <header className="flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">Your Content Ideas</h1>
              <p className="text-orange-300 text-sm">Your collection of approved scripts ready for production</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              {filteredIdeas.length} content ideas • Sorted by newest first
            </p>
            <Link to={createPageUrl('ContentCreator')}>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-4 py-2">
                <Plus className="w-4 h-4 mr-2" />
                Create New Script
              </Button>
            </Link>
          </div>
        </header>

        {/* FILTERS */}
        <nav className="flex-shrink-0">
          <div className="flex flex-wrap gap-3">
            {['all', 'approved', 'draft'].map(f => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => setFilter(f)}
                className={`transition-all duration-300 px-4 py-2 text-sm ${filter === f
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold border-0'
                  : 'backdrop-blur-xl bg-black/40 border-orange-500/30 text-white hover:bg-orange-500/10'
                }`}
              >
                <Filter className="w-3 h-3 mr-2" />
                {f.charAt(0).toUpperCase() + f.slice(1)} ({
                  contentIdeas.filter(idea => f === 'all' || idea.status === f).length
                })
              </Button>
            ))}
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <LoadingGrid />
          ) : filteredIdeas.length === 0 ? (
            <EmptyState />
          ) : (
            <ContentGrid 
              ideas={filteredIdeas} 
              onDelete={deleteContentIdea} 
              onCopy={copyScript}
              onViewScript={setSelectedScript} // Pass setSelectedScript to ContentGrid
            />
          )}
        </main>

        {/* Script Viewing Modal */}
        {selectedScript && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-black/90 border border-orange-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-orange-500/20 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 line-clamp-1">{selectedScript.title}</h2>
                  <div className="flex items-center gap-3">
                    <Badge className={getContentTypeColor(selectedScript.content_type)}>
                      {selectedScript.content_type?.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {formatDate(selectedScript.created_date)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedScript(null)}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content - Better spacing */}
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="space-y-6">
                  <ScriptSection 
                    title="HOOK" 
                    content={selectedScript.hook}
                    description="The attention-grabbing opening statement."
                  />
                  <ScriptSection 
                    title="SITUATION" 
                    content={selectedScript.situation}
                    description="Setting the context or the initial state."
                  />
                  <ScriptSection 
                    title="DESIRE" 
                    content={selectedScript.desire}
                    description="What was wanted or aimed for."
                  />
                  <ScriptSection 
                    title="CONFLICT" 
                    content={selectedScript.conflict}
                    description="The challenge, problem, or obstacle encountered."
                  />
                  <ScriptSection 
                    title="CHANGE" 
                    content={selectedScript.change}
                    description="The transformation, solution, or action taken."
                  />
                  <ScriptSection 
                    title="RESULT" 
                    content={selectedScript.result}
                    description="The outcome, learning, or final state."
                  />
                </div>

                {/* Action Buttons - Better sizing */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8 pt-6 border-t border-orange-500/20">
                  <Button
                    onClick={() => copyScript(selectedScript.full_script)}
                    className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto px-6 py-2"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Full Script
                  </Button>
                  
                  <Link 
                    to={createPageUrl('ContentCreator') + `?edit=${selectedScript.id}`}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Script
                    </Button>
                  </Link>
                  
                  <Link 
                    to={createPageUrl('ArkShotlistBuilder') + `?contentId=${selectedScript.id}`}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Plan Shots
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </EngineLayout>
  );
}

// Script Section Component - Better spacing
const ScriptSection = ({ title, content, description }) => (
  <div className="space-y-3">
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
      <h3 className="text-orange-300 font-bold text-sm uppercase tracking-wider">
        {title}:
      </h3>
      <span className="text-gray-500 text-xs">{description}</span>
    </div>
    <div className="bg-black/40 rounded-lg p-4 border-l-4 border-orange-500/50">
      <p className="text-white leading-relaxed whitespace-pre-wrap text-sm">{content || "Not available"}</p>
    </div>
  </div>
);

// Loading skeleton component
const LoadingGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
    {Array(8).fill(0).map((_, i) => (
      <Card key={i} className="backdrop-blur-xl bg-black/60 border border-orange-500/20 animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-black/50 rounded mb-4"></div>
          <div className="h-4 bg-black/50 rounded mb-2"></div>
          <div className="h-4 bg-black/50 rounded w-2/3"></div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="flex items-center justify-center h-full">
    <Card className="backdrop-blur-xl bg-black/60 border border-orange-500/20 max-w-md">
      <CardContent className="p-12 text-center">
        <Sparkles className="w-16 h-16 text-orange-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-white mb-2">No content ideas yet</h3>
        <p className="text-gray-300 mb-6">Start creating your first script to see it here.</p>
        <Link to={createPageUrl('ContentCreator')}>
          <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Script
          </Button>
        </Link>
      </CardContent>
    </Card>
  </div>
);

// Content grid component - Better sizing
const ContentGrid = ({ ideas, onDelete, onCopy, onViewScript }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString; // Return original string if invalid date
    }
  };

  const getContentTypeColor = (type) => {
    const colors = {
      social_media: 'bg-blue-500/20 text-blue-300',
      music_video: 'bg-purple-500/20 text-purple-300',
      educational: 'bg-green-500/20 text-green-300',
      promotional: 'bg-orange-500/20 text-orange-300',
      story: 'bg-pink-500/20 text-pink-300'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-300';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
      {ideas.map((idea, index) => (
        <motion.div
          key={idea.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="backdrop-blur-xl bg-black/60 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 h-full flex flex-col group cursor-pointer min-h-[300px]">
            
            {/* Card Header - Clickable for modal */}
            <CardHeader className="pb-3 p-4" onClick={() => onViewScript(idea)}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-white text-base mb-3 line-clamp-2 group-hover:text-orange-300 transition-colors leading-tight">
                    {idea.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {formatDate(idea.created_date)}
                  </div>
                </div>
                <Badge className={getContentTypeColor(idea.content_type)}>
                  {idea.content_type?.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            
            {/* Card Content - Clickable for modal */}
            <CardContent className="pt-0 p-4 flex-1 flex flex-col" onClick={() => onViewScript(idea)}>
              {/* Script Preview */}
              <div className="bg-black/40 rounded-lg p-3 mb-4 flex-1 group-hover:bg-black/50 transition-colors">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-orange-300 font-semibold uppercase text-xs">HOOK:</span>
                    <p className="text-white mt-1 line-clamp-2 text-sm">{idea.hook}</p>
                  </div>
                  <div>
                    <span className="text-orange-300 font-semibold uppercase text-xs">RESULT:</span>
                    <p className="text-white mt-1 line-clamp-2 text-sm">{idea.result}</p>
                  </div>
                </div>
                
                {/* View Full Script Indicator */}
                <div className="mt-3 pt-3 border-t border-orange-500/20">
                  <div className="flex items-center gap-1 text-orange-400 text-xs group-hover:text-orange-300">
                    <Eye className="w-3 h-3" />
                    <span>Click to view full script</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Prevent modal from opening when these buttons are clicked */}
              <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                <Button
                  onClick={() => onCopy(idea.full_script)}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-orange-500/30 text-orange-300 hover:bg-orange-500/10 text-xs px-3 py-2"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Link 
                  to={createPageUrl('ArkShotlistBuilder') + `?contentId=${idea.id}`}
                  className="flex-1"
                >
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-3 py-2"
                  >
                    <Video className="w-3 h-3 mr-1" />
                    Plan
                  </Button>
                </Link>
                <Button
                  onClick={() => onDelete(idea.id)}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
