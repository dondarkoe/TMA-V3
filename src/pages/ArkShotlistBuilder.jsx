
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video, 
  Plus, 
  Save, 
  Download, 
  Trash2, 
  GripVertical,
  Clock,
  PlayCircle,
  Lightbulb,
  Sparkles,
  X,
  FileText
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ShotlistItem } from '@/api/entities';
import { UserShotlist } from '@/api/entities';
import { ContentIdea } from '@/api/entities';
import ShotlistTemplateSelector from '../components/ark/ShotlistTemplateSelector';
import ShotlistPlanningAssistant from '../components/ark/ShotlistPlanningAssistant';
import EngineLayout from '../components/layout/EngineLayout';
import ShotPreviewModal from '../components/ark/ShotPreviewModal'; // Import the new modal component

export default function ArkShotlistBuilder() {
  const [libraryItems, setLibraryItems] = useState([]);
  const [currentList, setCurrentList] = useState([]);
  const [shotlistName, setShotlistName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showPlanningAssistant, setShowPlanningAssistant] = useState(false);
  const [showContentIdeas, setShowContentIdeas] = useState(false);
  const [contentIdeas, setContentIdeas] = useState([]);
  const [selectedContentIdea, setSelectedContentIdea] = useState(null);
  const [shotRecommendations, setShotRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedShotForPreview, setSelectedShotForPreview] = useState(null); // State for modal

  useEffect(() => {
    loadData();
    
    // Check if there's a content ID in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('contentId');
    if (contentId) {
      loadContentIdea(contentId);
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [shots, ideas] = await Promise.all([
        ShotlistItem.list(),
        ContentIdea.list('-created_date', 50)
      ]);
      setLibraryItems(shots);
      setContentIdeas(ideas);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContentIdea = async (contentId) => {
    try {
      const ideas = await ContentIdea.list();
      const idea = ideas.find(i => i.id === contentId);
      if (idea) {
        setSelectedContentIdea(idea);
        setShotlistName(`${idea.title} - Shotlist`);
        setShowContentIdeas(true);
      }
    } catch (error) {
      console.error('Failed to load content idea:', error);
    }
  };

  const generateShotRecommendations = async (contentIdea) => {
    if (!contentIdea) return;
    
    setIsLoading(true);
    try {
      const { InvokeLLM } = await import('@/api/integrations');
      
      const prompt = `Based on this content script, provide shooting recommendations:

TITLE: ${contentIdea.title}
SCRIPT:
${contentIdea.full_script}

Provide 4-6 shooting recommendations in this format:
- Scene/moment description
- Suggested shot type category (like "wide shot", "close-up", "medium shot", etc.)
- Why this shot works for this moment

Return as JSON array with: scene, shot_suggestion, reasoning`;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scene: { type: "string" },
                  shot_suggestion: { type: "string" },
                  reasoning: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response?.recommendations) {
        setShotRecommendations(response.recommendations);
        setShowRecommendations(true);
        setShowContentIdeas(false);
        setSelectedContentIdea(contentIdea);
        setShotlistName(`${contentIdea.title} - Shotlist`);
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelected = (templateShots) => {
    const formattedShots = templateShots.map((shot, index) => ({
      ...shot,
      shotlistItemId: shot.id, // Templates now properly link to library items
      id: `template-${Date.now()}-${index}`,
      order: currentList.length + index + 1
    }));
    setCurrentList(prev => [...prev, ...formattedShots]);
    setShowTemplateSelector(false);
  };

  const addShotToList = (shot) => {
    const newShot = {
      ...shot,
      id: `shot-${Date.now()}`,
      shotlistItemId: shot.id,
      duration: 5,
      script: `Shot featuring ${shot.name.toLowerCase()}`,
      order: currentList.length + 1
    };
    setCurrentList(prev => [...prev, newShot]);
  };

  const removeShotFromList = (shotId) => {
    setCurrentList(prev => prev.filter(shot => shot.id !== shotId));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(currentList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setCurrentList(updatedItems);
  };

  const saveShotlist = async () => {
    if (!shotlistName.trim()) {
      alert('Please enter a name for your shotlist');
      return;
    }

    if (currentList.length === 0) {
      alert('Please add at least one shot to your list');
      return;
    }

    setIsSaving(true);
    try {
      await UserShotlist.create({
        name: shotlistName,
        shots: currentList.map(shot => ({
          shotlistItemId: shot.shotlistItemId || null,
          duration: shot.duration || 5,
          script: shot.script || '',
          order: shot.order,
          name: shot.name || '',
          description: shot.description || shot.script || '',
          imageUrl: shot.imageUrl || ''
        }))
      });
      
      alert('Shotlist saved successfully!');
      setCurrentList([]);
      setShotlistName('');
    } catch (error) {
      console.error('Failed to save shotlist:', error);
      alert('Failed to save shotlist. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const exportShotlist = () => {
    const totalDuration = currentList.reduce((sum, shot) => sum + (shot.duration || 0), 0);
    
    const exportData = {
      name: shotlistName || 'Untitled Shotlist',
      totalShots: currentList.length,
      totalDuration: `${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toString().padStart(2, '0')}`,
      shots: currentList.map((shot, index) => ({
        order: index + 1,
        name: shot.name,
        duration: `${shot.duration}s`,
        script: shot.script,
        notes: shot.description
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${shotlistName || 'shotlist'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImageClick = (shot) => {
    setSelectedShotForPreview(shot);
  };

  const categories = ['all', ...new Set(libraryItems.map(item => item.category))];
  const filteredShots = selectedCategory === 'all' 
    ? libraryItems 
    : libraryItems.filter(item => item.category === selectedCategory);

  if (!shotlistName && currentList.length === 0) {
    setShotlistName(`Shotlist ${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '/')}`);
  }

  return (
    <EngineLayout 
      engineType="ARK" 
      currentPageName="ArkShotlistBuilder"
      defaultTool="shotlist"
    >
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-xl">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Shotlist Builder</h1>
            </div>
            <p className="text-orange-300 text-lg">Plan your shots, organize your vision</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => setShowTemplateSelector(!showTemplateSelector)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Quick Templates
          </Button>
          <Button
            onClick={() => setShowPlanningAssistant(!showPlanningAssistant)}
            variant="outline"
            className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          <Button
            onClick={() => setShowContentIdeas(!showContentIdeas)}
            variant="outline"
            className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
          >
            <FileText className="w-4 h-4 mr-2" />
            Use Content Idea ({contentIdeas.length})
          </Button>
        </div>

        {/* Content Ideas Selector */}
        {showContentIdeas && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="backdrop-blur-xl bg-black/40 border border-orange-500/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-400" />
                  Your Content Ideas
                </CardTitle>
                <Button
                  onClick={() => setShowContentIdeas(false)}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentIdeas.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-400 mb-4">No content ideas yet.</p>
                    <Button
                      onClick={() => window.open('/ContentCreator', '_blank')}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Script
                    </Button>
                  </div>
                ) : (
                  contentIdeas.map((idea) => (
                    <Card key={idea.id} className="bg-black/40 border-orange-500/20 hover:border-orange-500/40 transition-all">
                      <CardContent className="p-4">
                        <h3 className="text-white font-medium mb-2 line-clamp-2">{idea.title}</h3>
                        <div className="text-sm text-gray-300 mb-3">
                          <span className="text-orange-300 font-semibold">HOOK:</span>
                          <p className="line-clamp-2">{idea.hook}</p>
                        </div>
                        <Button
                          onClick={() => generateShotRecommendations(idea)}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm"
                        >
                          Get Shot Recommendations
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Shot Recommendations */}
        {showRecommendations && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="backdrop-blur-xl bg-black/40 border border-orange-500/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-orange-400" />
                  Shot Recommendations for "{selectedContentIdea?.title}"
                </CardTitle>
                <Button
                  onClick={() => setShowRecommendations(false)}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm mb-4">
                  Based on your script, here are some shot suggestions. Browse the shot library below to find the perfect matches!
                </p>
                {shotRecommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-black/30 rounded-lg border border-orange-500/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-orange-300 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-orange-300 font-semibold mb-1">{rec.scene}</h4>
                        <p className="text-white text-sm mb-2">
                          <span className="text-orange-400">Suggested shot:</span> {rec.shot_suggestion}
                        </p>
                        <p className="text-gray-300 text-xs">{rec.reasoning}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-blue-300 text-sm">
                    💡 <strong>How to use:</strong> Scroll down to the Shot Library and look for shots that match these recommendations. Click "Add to List" on any shots you like!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Template Selector */}
        {showTemplateSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <ShotlistTemplateSelector onTemplateSelected={handleTemplateSelected} />
          </motion.div>
        )}

        {/* Custom Generator */}
        {showPlanningAssistant && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <ShotlistPlanningAssistant 
              onShotlistGenerated={(shots) => {
                const newShots = shots.map((shot, index) => {
                  const matchingLibraryItem = libraryItems.find(item => 
                    item.name.toLowerCase().includes(shot.name.toLowerCase()) ||
                    shot.name.toLowerCase().includes(item.name.toLowerCase())
                  );
                  
                  return {
                    ...shot,
                    id: `custom-${Date.now()}-${index}`,
                    shotlistItemId: matchingLibraryItem?.id || null,
                    imageUrl: matchingLibraryItem?.imageUrl || '/api/placeholder/300/200',
                    description: matchingLibraryItem?.description || shot.script,
                    order: currentList.length + index + 1
                  };
                });
                setCurrentList(prev => [...prev, ...newShots]);
                setShowPlanningAssistant(false);
              }}
            />
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shot Library - MUCH TALLER NOW! */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="backdrop-blur-xl bg-black/40 border border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-white">Shot Library</CardTitle>
                <div className="flex flex-wrap gap-2 mt-4">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category
                        ? 'bg-orange-600 text-white'
                        : 'border-orange-500/30 text-orange-300 hover:bg-orange-500/10'
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              
              {/* INCREASED HEIGHT FROM max-h-96 TO h-[800px] - MUCH TALLER! */}
              <CardContent className="h-[800px] overflow-y-auto">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array(8).fill(0).map((_, i) => (
                      <div key={i} className="bg-black/50 rounded-lg p-4 animate-pulse">
                        <div className="h-32 bg-black/50 rounded mb-2"></div>
                        <div className="h-4 bg-black/50 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredShots.map(shot => (
                      <Card key={shot.id} className="bg-black/30 border-orange-500/10 hover:border-orange-500/30 transition-all overflow-hidden">
                        {/* SHOT IMAGE - VISUAL REFERENCE */}
                        <div 
                          className="aspect-video bg-black relative overflow-hidden cursor-pointer group"
                          onClick={() => handleImageClick(shot)}
                        >
                          <img
                            src={shot.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=240&fit=crop'}
                            alt={shot.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=240&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-semibold">View Preview</span>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <Badge className="bg-orange-500/80 text-white text-xs backdrop-blur-sm">
                              {shot.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-medium text-sm line-clamp-1">{shot.name}</h3>
                            <Badge className={`text-xs ${shot.difficulty_level === 'beginner' ? 'bg-green-500/20 text-green-300' :
                              shot.difficulty_level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'}`}>
                              {shot.difficulty_level}
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-xs mb-3 line-clamp-2">
                            {shot.description}
                          </p>
                          <Button
                            onClick={() => addShotToList(shot)}
                            size="sm"
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add to List
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current Shotlist */}
          <div className="space-y-6">
            <Card className="backdrop-blur-xl bg-black/40 border border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-white">My Shotlist</CardTitle>
                <Input
                  placeholder="Shotlist name..."
                  value={shotlistName}
                  onChange={(e) => setShotlistName(e.target.value)}
                  className="bg-black/40 border-orange-500/30 text-white placeholder-gray-400"
                />
              </CardHeader>
              <CardContent className="space-y-4">
                {currentList.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Add shots to start building your list</p>
                  </div>
                ) : (
                  <>
                    {/* Visual Storyboard Preview */}
                    <div className="mb-6">
                      <h4 className="text-white text-sm font-medium mb-3">Visual Preview</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {currentList.slice(0, 4).map((shot, index) => (
                          <div key={shot.id} className="aspect-video bg-black/50 rounded overflow-hidden relative">
                            <img
                              src={shot.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=120&fit=crop'}
                              alt={shot.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1 left-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs font-medium">
                              {index + 1}
                            </div>
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
                              {shot.duration || 5}s
                            </div>
                            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-xs font-medium text-center px-2">
                                {shot.name}
                              </span>
                            </div>
                          </div>
                        ))}
                        {currentList.length > 4 && (
                          <div className="aspect-video bg-black/30 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-sm">+{currentList.length - 4} more</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="shotlist">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {currentList.map((shot, index) => (
                              <Draggable key={shot.id} draggableId={shot.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`p-3 bg-black/30 rounded-lg border border-orange-500/20 ${
                                      snapshot.isDragging ? 'border-orange-500/50' : ''
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="w-4 h-4 text-gray-400 mt-1" />
                                      </div>
                                      
                                      {/* Shot Image Preview */}
                                      <div 
                                        className="w-16 h-10 bg-black/50 rounded overflow-hidden flex-shrink-0 cursor-pointer group relative"
                                        onClick={() => handleImageClick(shot)}
                                      >
                                        <img
                                          src={shot.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=40&fit=crop'}
                                          alt={shot.name}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                      </div>
                                      
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-orange-300 font-medium text-sm">
                                            {index + 1}. {shot.name}
                                          </span>
                                          <Button
                                            onClick={() => removeShotFromList(shot.id)}
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                        <p className="text-gray-300 text-xs mb-2 line-clamp-2">
                                          {shot.script || shot.description}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                          <Clock className="w-3 h-3" />
                                          {shot.duration || 5}s
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    {/* Shotlist Summary */}
                    <div className="pt-4 border-t border-orange-500/20">
                      <div className="text-sm text-gray-300 space-y-1">
                        <div className="flex justify-between">
                          <span>Total Shots:</span>
                          <span className="text-orange-300">{currentList.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Est. Duration:</span>
                          <span className="text-orange-300">
                            {Math.floor(currentList.reduce((sum, shot) => sum + (shot.duration || 0), 0) / 60)}:
                            {(currentList.reduce((sum, shot) => sum + (shot.duration || 0), 0) % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        onClick={saveShotlist}
                        disabled={isSaving}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Shotlist
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={exportShotlist}
                        variant="outline"
                        className="w-full border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export JSON
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ShotPreviewModal 
        shot={selectedShotForPreview} 
        onClose={() => setSelectedShotForPreview(null)} 
      />
    </EngineLayout>
  );
}
