
import React, { useState, useEffect } from "react";
import { AudioFile } from "@/api/entities";
import { User } from "@/api/entities";
import { MixComparisons } from "@/api/entities"; // New import for MixComparisons entity
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Headphones,
  ArrowLeft
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";

import AnalysisCard from "../components/analyses/AnalysisCard";
import VisualAnalysisReport from "../components/analyses/VisualAnalysisReport";
import ComparisonCard from "../components/analyses/ComparisonCard"; // New import for ComparisonCard
import ComparisonResults from "../components/analyses/ComparisonResults"; // New import for ComparisonResults
import EngineLayout from '../components/layout/EngineLayout';

export default function AnalysesPage() {
  const navigate = useNavigate();
  const [audioFiles, setAudioFiles] = useState([]);
  const [mixComparisons, setMixComparisons] = useState([]); // New state for mix comparisons
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [selectedComparison, setSelectedComparison] = useState(null); // New state for selected comparison
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalyses();
  }, []);

  useEffect(() => {
    // Check for specific analysis ID in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const analysisId = urlParams.get('id');

    if (analysisId && audioFiles.length > 0) {
      const specificAnalysis = audioFiles.find(file => file.id === analysisId);
      if (specificAnalysis && specificAnalysis.analysis_status === 'completed') {
        setSelectedAnalysis(specificAnalysis);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [audioFiles]); // Dependency on audioFiles is crucial here

  const loadAnalyses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Loading analyses and comparisons...');

      // Get current user first
      const user = await User.me();
      setCurrentUser(user);
      console.log('Current user:', user?.email);

      if (user) {
        // Fetch all AudioFile records and MixComparisons concurrently
        const [allFiles, allComparisons] = await Promise.all([
          AudioFile.list(),
          MixComparisons.list()
        ]);

        console.log('All AudioFiles in database:', allFiles.length);
        console.log('All MixComparisons in database:', allComparisons.length);

        // Filter for current user's files and comparisons
        const userFiles = allFiles.filter(file => file.created_by === user.email);
        const userComparisons = allComparisons.filter(comparison => comparison.created_by === user.email);

        console.log('User files found:', userFiles.length);
        console.log('User comparisons found:', userComparisons.length);

        setAudioFiles(userFiles);
        setMixComparisons(userComparisons);
      } else {
        console.log('No user found');
        setAudioFiles([]);
        setMixComparisons([]);
      }
    } catch (error) {
      console.error('Failed to load analyses:', error);
      setError(`Failed to load analyses: ${error.message}`);
      setAudioFiles([]);
      setMixComparisons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFiles = audioFiles.filter(file => {
    if (filter === 'all') return true;
    if (filter === 'completed') return file.analysis_status === 'completed';
    if (filter === 'processing') return ['pending', 'uploading', 'analyzing'].includes(file.analysis_status);
    if (filter === 'error') return file.analysis_status === 'error';
    return false; // Should not reach here
  });

  const filteredComparisons = mixComparisons.filter(comparison => {
    if (filter === 'all') return true;
    if (filter === 'completed') return comparison.status === 'completed';
    if (filter === 'processing') return comparison.status === 'processing';
    if (filter === 'error') return comparison.status === 'error';
    return false; // Should not reach here
  });

  // Combine and sort all items by creation date
  const allFilteredItems = [
    ...filteredFiles.map(file => ({
      ...file,
      type: 'analysis',
      sortDate: file.created_date
    })),
    ...filteredComparisons.map(comparison => ({
      ...comparison,
      type: 'comparison',
      sortDate: comparison.created_date
    }))
  ].sort((a, b) => {
    // More robust date sorting
    const dateA = new Date(a.sortDate);
    const dateB = new Date(b.sortDate);

    // Handle invalid dates by pushing them to the end
    if (isNaN(dateA.getTime())) return 1;
    if (isNaN(dateB.getTime())) return -1;

    // Sort newest first (descending order)
    return dateB.getTime() - dateA.getTime();
  });

  if (selectedAnalysis) {
    return (
      <EngineLayout
        engineType="KOE"
        currentPageName="Analyses"
        defaultTool="analyses"
      >
        <VisualAnalysisReport
          analysis={selectedAnalysis}
          onBack={() => setSelectedAnalysis(null)}
        />
      </EngineLayout>
    );
  }

  if (selectedComparison) {
    return (
      <EngineLayout
        engineType="KOE"
        currentPageName="Analyses"
        defaultTool="analyses"
      >
        <ComparisonResults
          result={selectedComparison}
          onBack={() => setSelectedComparison(null)}
        />
      </EngineLayout>
    );
  }

  return (
    <EngineLayout
      engineType="KOE"
      currentPageName="Analyses"
      defaultTool="analyses"
    >
      <div className="w-full h-full p-6 space-y-8">
        {/* Header - Better spacing */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-3 leading-tight">My Analyses</h1>
            <p className="text-blue-300 text-base font-medium mb-3">Review your audio analysis and comparison history</p>
            <p className="text-gray-400 text-sm">
              Showing {allFilteredItems.length} items • Sorted by newest first
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {['all', 'completed', 'processing', 'error'].map(f => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => setFilter(f)}
                className={`transition-all duration-300 px-4 py-2 text-sm ${filter === f
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold border-0 engine-glow'
                  : 'backdrop-blur-xl bg-black/40 border-blue-500/30 text-white hover:bg-blue-500/10 premium-button'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({
                  [...audioFiles.map(file => ({ ...file, itemType: 'analysis' })),
                   ...mixComparisons.map(comparison => ({ ...comparison, itemType: 'comparison' }))]
                  .filter(item => {
                    if (f === 'all') return true;
                    if (item.itemType === 'analysis') {
                      if (f === 'completed') return item.analysis_status === 'completed';
                      if (f === 'processing') return ['pending', 'uploading', 'analyzing'].includes(item.analysis_status);
                      if (f === 'error') return item.analysis_status === 'error';
                    } else if (item.itemType === 'comparison') {
                      if (f === 'completed') return item.status === 'completed';
                      if (f === 'processing') return item.status === 'processing';
                      if (f === 'error') return item.status === 'error';
                    }
                    return false;
                  }).length
                })
              </Button>
            ))}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Content Grid - Better spacing */}
        <div className="w-full space-y-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="backdrop-blur-xl bg-black/40 border border-blue-500/20 animate-pulse min-h-[200px]">
                <CardContent className="p-6">
                  <div className="h-24 bg-black/50 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : allFilteredItems.length === 0 ? (
            <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/20">
              <CardContent className="p-12 text-center">
                <Headphones className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-3">No analyses or comparisons found for this filter</h3>
                <p className="text-blue-300 mb-6 text-sm">Upload your first audio file or create a mix comparison to get started.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to={createPageUrl("Upload")}>
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold border-0 w-full sm:w-auto px-6 py-2">
                      Analyze a Track
                    </Button>
                  </Link>
                  <Link to={createPageUrl("KOE")}>
                    <Button variant="outline" className="backdrop-blur-xl bg-black/40 border-blue-500/30 text-white hover:bg-blue-500/10 w-full sm:w-auto px-6 py-2">
                      Continue to Chat
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            allFilteredItems.map((item, index) => (
              <div key={`${item.type}-${item.id}`} className="w-full">
                {item.type === 'analysis' ? (
                  <AnalysisCard
                    file={item}
                    index={index}
                    onClick={() => item.analysis_status === 'completed' && setSelectedAnalysis(item)}
                  />
                ) : (
                  <ComparisonCard
                    comparison={item}
                    index={index}
                    onClick={() => item.status === 'completed' && setSelectedComparison(item)}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </EngineLayout>
  );
}
