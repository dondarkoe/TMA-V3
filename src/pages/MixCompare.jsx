
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Loader2, FileAudio, Upload, ArrowRight, AlertTriangle, GitCompare } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { compareMixes } from '@/api/functions';
import { claudeChat } from '@/api/functions';
import ComparisonWizard from '../components/compare/ComparisonWizard';
import ComparisonProgress from '../components/compare/ComparisonProgress';
import ComparisonResults from '../components/compare/ComparisonResults';
import EngineLayout from '../components/layout/EngineLayout';

export default function MixComparePage() {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState({ fileA: null, fileB: null });
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonStage, setComparisonStage] = useState('uploading');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const fileInputRefA = useRef(null);
  const fileInputRefB = useRef(null);
  // New state to store Claude's summary
  const [claudeSummary, setClaudeSummary] = useState(null);

  const handleFileSelect = (slot, file) => {
    setSelectedFiles(prev => ({ ...prev, [slot]: file }));
    
    // If both files are selected, show wizard
    if ((slot === 'fileA' && selectedFiles.fileB) || (slot === 'fileB' && selectedFiles.fileA)) {
      setShowWizard(true);
    }
  };

  const handleCompareWithOptions = async (options) => {
    if (!selectedFiles.fileA || !selectedFiles.fileB) return;

    setIsComparing(true);
    setComparisonResult(null);
    setClaudeSummary(null); // Reset summary at the start of a new comparison
    setComparisonStage('uploading');

    try {
      console.log('Starting mix comparison process...', options);

      // Step 1: Upload both files to Base44 storage
      console.log('Uploading files to Base44 storage...');
      const [{ file_url: fileUrlA }, { file_url: fileUrlB }] = await Promise.all([
        UploadFile({ file: selectedFiles.fileA }),
        UploadFile({ file: selectedFiles.fileB })
      ]);

      console.log('Files uploaded to Base44:', fileUrlA, fileUrlB);

      setComparisonStage('analyzing');

      // Step 2: Send to backend for comparison
      console.log('Sending to backend for comparison...');
      const { data } = await compareMixes({
        fileA: fileUrlA,
        filenameA: selectedFiles.fileA.name,
        fileB: fileUrlB,
        filenameB: selectedFiles.fileB.name,
        musicalStyle: options.musicalStyle,
        isMaster: options.isMaster
      });

      console.log('Comparison completed:', data);

      // Step 3: Generate Claude Summary
      setComparisonStage('summarizing');
      console.log('Generating Claude summary...');
      let generatedSummary = null;
      try {
        const { data: claudeResult } = await claudeChat({
          prompt: "Compare these two audio mixes and provide a friendly summary",
          analysisDataA: data.analysisA?.mixDiagnosisResults?.payload,
          analysisDataB: data.analysisB?.mixDiagnosisResults?.payload,
          filenameA: selectedFiles.fileA.name,
          filenameB: selectedFiles.fileB.name
        });
        
        if (claudeResult.success) {
          generatedSummary = claudeResult.response;
          setClaudeSummary(generatedSummary);
          console.log('Claude summary generated:', generatedSummary);
        } else {
          console.error('Claude summary failed:', claudeResult.error);
          generatedSummary = "Could not generate AI summary - please check the detailed comparison below.";
          setClaudeSummary(generatedSummary);
        }
      } catch (summaryError) {
        console.error('Failed to generate Claude summary:', summaryError);
        generatedSummary = "Could not generate AI summary due to an error.";
        setClaudeSummary(generatedSummary); 
      }
      
      setComparisonStage('completed'); 
      
      // Small delay to show completion state, then navigate directly to detailed comparison results
      setTimeout(() => {
        // Pass both original comparison data and Claude summary to results component
        setComparisonResult({ ...data, claudeSummary: generatedSummary });
        setIsComparing(false);
        setSelectedFiles({ fileA: null, fileB: null });
        setShowWizard(false);
      }, 1000);

    } catch (error) {
      console.error('Comparison failed:', error);

      let userMessage = 'Something went wrong. Please try again.';

      if (error.message.includes('Rate limit') || error.message.includes('busy')) {
        userMessage = 'The analysis service is currently busy. Please wait a few minutes and try again.';
      } else if (error.message.includes('network') || error.message.includes('internet')) {
        userMessage = 'Check your internet connection and try again.';
      } else if (error.message.includes('file') || error.message.includes('upload')) {
        userMessage = 'There was a problem with your audio files. Make sure they are valid audio files and try again.';
      }

      setComparisonResult({ error: userMessage });
      setIsComparing(false);
      setShowWizard(false);
      setClaudeSummary(null); // Clear summary on error
    }
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    setSelectedFiles({ fileA: null, fileB: null });
    setComparisonResult(null);
    setClaudeSummary(null); // Clear summary on cancel
  };

  return (
    <EngineLayout 
      engineType="KOE" 
      currentPageName="MixCompare"
      defaultTool="compare"
    >
      {/* FULL WIDTH - NO CONTAINERS - Better spacing */}
      <div className="w-full space-y-8 p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <GitCompare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
              Mix Comparison
            </h1>
          </div>
          <p className="text-blue-300 text-base font-medium mb-4">Compare two versions of your mix</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Upload two different versions and get detailed technical analysis and recommendations.
          </p>
        </div>
        
        {/* File Upload Cards - FULL WIDTH with better spacing */}
        {!isComparing && !comparisonResult && !showWizard && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full mb-8">
              {/* Mix A Upload */}
              <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30 shadow-xl">
                <CardHeader className="p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <FileAudio className="w-5 h-5 text-blue-400" />
                    Mix A {selectedFiles.fileA && '✓'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {!selectedFiles.fileA ? (
                    <div className="border-2 border-dashed border-blue-500/30 rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors">
                      <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-white mb-2 text-base">Drop your first mix here</p>
                      <p className="text-gray-400 text-sm mb-6">or click to browse</p>
                      <input
                        ref={fileInputRefA}
                        type="file"
                        accept=".wav,.mp3,.flac,audio/*"
                        onChange={(e) => e.target.files && handleFileSelect('fileA', e.target.files[0])}
                        className="hidden"
                      />
                      <Button 
                        onClick={() => fileInputRefA.current?.click()}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-2"
                      >
                        Choose File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileAudio className="w-6 h-6 text-blue-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate text-sm">{selectedFiles.fileA.name}</p>
                          <p className="text-gray-400 text-xs">{(selectedFiles.fileA.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedFiles(prev => ({ ...prev, fileA: null }))}
                        className="text-gray-400 hover:text-white flex-shrink-0 w-8 h-8 p-0"
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mix B Upload */}
              <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30 shadow-xl">
                <CardHeader className="p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <FileAudio className="w-5 h-5 text-blue-400" />
                    Mix B {selectedFiles.fileB && '✓'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {!selectedFiles.fileB ? (
                    <div className="border-2 border-dashed border-blue-500/30 rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors">
                      <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-white mb-2 text-base">Drop your second mix here</p>
                      <p className="text-gray-400 text-sm mb-6">or click to browse</p>
                      <input
                        ref={fileInputRefB}
                        type="file"
                        accept=".wav,.mp3,.flac,audio/*"
                        onChange={(e) => e.target.files && handleFileSelect('fileB', e.target.files[0])}
                        className="hidden"
                      />
                      <Button 
                        onClick={() => fileInputRefB.current?.click()}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-2"
                      >
                        Choose File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileAudio className="w-6 h-6 text-blue-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate text-sm">{selectedFiles.fileB.name}</p>
                          <p className="text-gray-400 text-xs">{(selectedFiles.fileB.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedFiles(prev => ({ ...prev, fileB: null }))}
                        className="text-gray-400 hover:text-white flex-shrink-0 w-8 h-8 p-0"
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Privacy Statement */}
            <div className="text-center py-6">
              <p className="text-gray-300 text-sm leading-relaxed max-w-3xl mx-auto">
                <span className="text-green-300 font-medium">Your privacy matters:</span> We do NOT use your uploaded songs to train any AI models. Files are processed for analysis only.<br />
                <span className="text-sky-300 font-medium">Max file size: 50MB per file</span>
              </p>
            </div>
          </>
        )}

        {/* Show wizard when both files are selected */}
        {showWizard && selectedFiles.fileA && selectedFiles.fileB && !isComparing && (
          <div className="w-full max-w-4xl mx-auto">
            <ComparisonWizard
              fileA={selectedFiles.fileA}
              fileB={selectedFiles.fileB}
              onCompare={handleCompareWithOptions}
              onCancel={handleWizardCancel}
            />
          </div>
        )}

        {/* Show comparison progress */}
        {isComparing && (
          <div className="w-full max-w-4xl mx-auto">
            <ComparisonProgress 
              stage={comparisonStage}
              filenameA={selectedFiles.fileA?.name}
              filenameB={selectedFiles.fileB?.name}
            />
          </div>
        )}

        {/* Show results */}
        {comparisonResult && (
          <div className="w-full">
            <ComparisonResults
              result={comparisonResult}
              onBack={() => {
                setComparisonResult(null);
                setClaudeSummary(null);
                setSelectedFiles({ fileA: null, fileB: null });
                setShowWizard(false);
              }}
            />
          </div>
        )}
      </div>
    </EngineLayout>
  );
}
