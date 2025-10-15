import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  Download,
  Play,
  Plus,
  Filter } from
'lucide-react';
import { UserShotlist } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EngineLayout from '../components/layout/EngineLayout';

export default function MyShotlistsPage() {
  const [shotlists, setShotlists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShotlist, setSelectedShotlist] = useState(null);

  useEffect(() => {
    loadShotlists();
  }, []);

  const loadShotlists = async () => {
    setIsLoading(true);
    try {
      const lists = await UserShotlist.list('-created_date', 50);
      setShotlists(lists);
    } catch (error) {
      console.error('Failed to load shotlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteShotlist = async (id) => {
    if (!confirm('Are you sure you want to delete this shotlist?')) return;

    try {
      await UserShotlist.delete(id);
      setShotlists((prev) => prev.filter((list) => list.id !== id));
    } catch (error) {
      console.error('Failed to delete shotlist:', error);
    }
  };

  const exportShotlist = (shotlist) => {
    const totalDuration = shotlist.shots.reduce((sum, shot) => sum + (shot.duration || 0), 0);

    const exportData = {
      name: shotlist.name,
      totalShots: shotlist.shots.length,
      totalDuration: `${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toString().padStart(2, '0')}`,
      shots: shotlist.shots.map((shot, index) => ({
        order: shot.order || index + 1,
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
    a.download = `${shotlist.name || 'shotlist'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTotalDuration = (shots) => {
    const total = shots.reduce((sum, shot) => sum + (shot.duration || 0), 0);
    return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
  };

  // Shotlist Detail View
  if (selectedShotlist) {
    return (
      <EngineLayout
        engineType="ARK"
        currentPageName="MyShotlists"
        defaultTool="shotlist">

        <div className="w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button
                onClick={() => setSelectedShotlist(null)}
                variant="ghost"
                className="text-orange-300 hover:bg-orange-500/10 mb-4">

                ← Back to My Shotlists
              </Button>
              <h1 className="text-3xl font-bold text-white">{selectedShotlist.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-gray-300">
                <div className="flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  {selectedShotlist.shots.length} shots
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {getTotalDuration(selectedShotlist.shots)}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedShotlist.created_date)}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => exportShotlist(selectedShotlist)}
                variant="outline"
                className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10">

                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={() => deleteShotlist(selectedShotlist.id)}
                variant="ghost"
                className="text-red-400 hover:bg-red-500/10">

                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Visual Storyboard */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Visual Storyboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedShotlist.shots.
              sort((a, b) => (a.order || 0) - (b.order || 0)).
              map((shot, index) =>
              <Card key={index} className="bg-black/40 border-orange-500/20 overflow-hidden">
                  <div className="aspect-video bg-black relative">
                    <img
                    src={shot.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=240&fit=crop'}
                    alt={shot.name}
                    className="w-full h-full object-cover" />

                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                      {shot.order || index + 1}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {shot.duration || 5}s
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="text-white font-medium mb-2">{shot.name}</h4>
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {shot.script || shot.description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </EngineLayout>);

  }

  // Main Shotlists List View
  return (
    <EngineLayout
      engineType="ARK"
      currentPageName="MyShotlists"
      defaultTool="shotlist">

      <div className="w-full space-y-8">
        {/* Header */}
        <div className="mx-6 my-6 flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-xl">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">My Shotlists</h1>
            </div>
            <p className="text-orange-300 text-lg">Your saved visual storyboards and shot sequences</p>
            <p className="text-gray-400 mt-2">
              {shotlists.length} shotlists • Sorted by newest first
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to={createPageUrl('ArkShotlistBuilder')}>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Create New Shotlist
              </Button>
            </Link>
          </div>
        </div>

        {/* Shotlists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ?
          Array(4).fill(0).map((_, i) =>
          <Card key={i} className="backdrop-blur-xl bg-black/60 border border-orange-500/20 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-black/50 rounded mb-4"></div>
                  <div className="h-4 bg-black/50 rounded mb-2"></div>
                  <div className="h-4 bg-black/50 rounded w-2/3"></div>
                </CardContent>
              </Card>
          ) :
          shotlists.length === 0 ?
          <div className="col-span-full">
              <Card className="backdrop-blur-xl bg-black/60 border border-orange-500/20">
                <CardContent className="p-12 text-center">
                  <Video className="w-16 h-16 text-orange-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-white mb-2">No shotlists yet</h3>
                  <p className="text-gray-300 mb-6">Create your first visual storyboard to get started.</p>
                  <Link to={createPageUrl('ArkShotlistBuilder')}>
                    <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Your First Shotlist
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div> :

          shotlists.map((shotlist, index) =>
          <motion.div
            key={shotlist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}>

                <Card className="backdrop-blur-xl bg-black/60 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2">
                          {shotlist.name}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            {shotlist.shots.length} shots
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getTotalDuration(shotlist.shots)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(shotlist.created_date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Visual Preview - First 4 shots */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {shotlist.shots.
                  sort((a, b) => (a.order || 0) - (b.order || 0)).
                  slice(0, 4).
                  map((shot, idx) =>
                  <div key={idx} className="aspect-video bg-black/50 rounded overflow-hidden relative">
                          <img
                      src={shot.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=120&fit=crop'}
                      alt={shot.name}
                      className="w-full h-full object-cover" />

                          <div className="absolute top-1 left-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
                            {shot.order || idx + 1}
                          </div>
                        </div>
                  )}
                      {shotlist.shots.length > 4 &&
                  <div className="aspect-video bg-black/30 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">+{shotlist.shots.length - 4}</span>
                        </div>
                  }
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                    onClick={() => setSelectedShotlist(shotlist)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white">

                        <Play className="w-4 h-4 mr-2" />
                        View Storyboard
                      </Button>
                      <Button
                    onClick={() => exportShotlist(shotlist)}
                    variant="outline"
                    className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10">

                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                    onClick={() => deleteShotlist(shotlist.id)}
                    variant="ghost"
                    className="text-red-400 hover:bg-red-500/10">

                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
          )
          }
        </div>
      </div>
    </EngineLayout>);

}