import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Music, GitCompare, Search, FileAudio, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AudioFile } from '@/api/entities';
import { MixComparisons } from '@/api/entities';
import { User } from '@/api/entities';
import { format } from 'date-fns';

export default function ContextSelectorModal({ isOpen, onClose, onSelectContext, onClearContext, currentContext }) {
  const [analyses, setAnalyses] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'analyses', 'comparisons'

  useEffect(() => {
    if (isOpen) {
      loadContextOptions();
    }
  }, [isOpen]);

  const loadContextOptions = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      if (!user) return;

      const [userAnalyses, userComparisons] = await Promise.all([
        AudioFile.filter({ created_by: user.email }, '-created_date'),
        MixComparisons.filter({ created_by: user.email }, '-created_date')
      ]);

      // Only include completed analyses and comparisons
      const completedAnalyses = userAnalyses.filter(analysis => analysis.analysis_status === 'completed');
      const completedComparisons = userComparisons.filter(comparison => comparison.status === 'completed');

      setAnalyses(completedAnalyses);
      setComparisons(completedComparisons);
    } catch (error) {
      console.error('Failed to load context options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnalysis = (analysis) => {
    onSelectContext({
      type: 'analysis',
      id: analysis.id,
      data: analysis
    });
    onClose();
  };

  const handleSelectComparison = (comparison) => {
    onSelectContext({
      type: 'comparison',
      id: comparison.id,
      data: comparison
    });
    onClose();
  };

  const handleClearContext = () => {
    onClearContext();
    onClose();
  };

  // Filter and search logic
  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || filter === 'analyses';
    return matchesSearch && matchesFilter;
  });

  const filteredComparisons = comparisons.filter(comparison => {
    const matchesSearch = 
      comparison.filenameA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comparison.filenameB.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || filter === 'comparisons';
    return matchesSearch && matchesFilter;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-4xl max-h-[80vh] mx-4"
      >
        <Card className="backdrop-blur-xl bg-black/80 border border-blue-500/30">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Select Context for Chat</h2>
                <p className="text-gray-300 text-sm mt-1">
                  Choose an audio analysis or mix comparison to reference in your conversation
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by filename..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 backdrop-blur-xl bg-black/60 border-blue-500/30 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {['all', 'analyses', 'comparisons'].map(filterType => (
                  <Button
                    key={filterType}
                    variant={filter === filterType ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                    className={filter === filterType 
                      ? 'bg-blue-600 text-white' 
                      : 'backdrop-blur-xl bg-black/40 border-blue-500/30 text-white hover:bg-blue-500/10'
                    }
                  >
                    {filterType === 'all' ? 'All' : filterType === 'analyses' ? 'Analyses' : 'Comparisons'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear Context Option */}
            {currentContext && (
              <div className="mb-6">
                <Card className="bg-orange-500/10 border border-orange-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Current Context</h3>
                        <p className="text-orange-300 text-sm">
                          {currentContext.type === 'analysis' 
                            ? `Analysis: ${currentContext.data?.filename}`
                            : `Comparison: ${currentContext.data?.filenameA} vs ${currentContext.data?.filenameB}`
                          }
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearContext}
                        className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
                      >
                        Clear Context
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Content List */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-white">Loading your analyses and comparisons...</div>
                </div>
              ) : (
                <>
                  {/* Analyses */}
                  {filteredAnalyses.map((analysis) => (
                    <motion.div
                      key={`analysis-${analysis.id}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="backdrop-blur-xl bg-black/40 border border-blue-500/30 hover:border-blue-500/50 cursor-pointer"
                        onClick={() => handleSelectAnalysis(analysis)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                              <Music className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium truncate">{analysis.filename}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(analysis.created_date), 'MMM d, yyyy')}</span>
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                  Audio Analysis
                                </Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Select
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {/* Comparisons */}
                  {filteredComparisons.map((comparison) => (
                    <motion.div
                      key={`comparison-${comparison.id}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="backdrop-blur-xl bg-black/40 border border-green-500/30 hover:border-green-500/50 cursor-pointer"
                        onClick={() => handleSelectComparison(comparison)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                              <GitCompare className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium truncate">
                                {comparison.filenameA} vs {comparison.filenameB}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(comparison.created_date), 'MMM d, yyyy')}</span>
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                  Mix Comparison
                                </Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Select
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {/* Empty State */}
                  {filteredAnalyses.length === 0 && filteredComparisons.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                      <FileAudio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-white font-medium mb-2">No items found</h3>
                      <p className="text-gray-400 text-sm">
                        {searchQuery 
                          ? "Try adjusting your search or filter criteria"
                          : "Upload and analyze some tracks first to use them as context"
                        }
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-600">
              <p className="text-gray-400 text-xs text-center">
                Selected context will apply to this chat session and help KOE provide specific, data-driven advice
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}