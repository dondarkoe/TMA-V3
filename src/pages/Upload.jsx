
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Loader2, FileAudio, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { analyzeAudio } from '@/api/functions';
import FileUploadZone from '../components/upload/FileUploadZone';
import AnalysisWizard from '../components/upload/AnalysisWizard';
import AnalysisProgress from '../components/upload/AnalysisProgress';
import EngineLayout from '../components/layout/EngineLayout';

export default function UploadPage() {
  const navigate = useNavigate();
  const [quickAnalysisFile, setQuickAnalysisFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('uploading');
  const [dragActive, setDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const fileInputRef = useRef(null);

  async function handleAnalyzeWithOptions(options) {
    if (!quickAnalysisFile) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisStage('uploading');

    try {
      console.log('Starting guided analysis process...', options);

      // Step 1: Upload file to Base44 storage
      console.log('Uploading file to Base44 storage...');
      const { file_url } = await UploadFile({ file: quickAnalysisFile });
      console.log('File uploaded to Base44:', file_url);

      setAnalysisStage('analyzing');

      // Step 2: Send to backend for analysis with guided options
      console.log('Sending to backend for analysis...');
      const { data } = await analyzeAudio({
        file: file_url,
        filename: quickAnalysisFile.name,
        musicalStyle: options.musicalStyle,
        isMaster: options.isMaster
      });

      setAnalysisStage('completed');
      console.log('Analysis completed:', data);
      
      // Small delay to show completion state, then navigate directly to detailed report
      setTimeout(() => {
        // Navigate directly to the detailed report instead of showing mini report
        navigate(createPageUrl("Analyses") + `?id=${data.audioFile?.id}`);
      }, 1000);

    } catch (error) {
      console.error('Analysis failed:', error);

      // Show user-friendly error messages
      let userMessage = 'Something went wrong. Please try again.';

      if (error.message.includes('Rate limit') || error.message.includes('busy')) {
        userMessage = 'The analysis service is currently busy. Please wait a few minutes and try again.';
      } else if (error.message.includes('network') || error.message.includes('internet')) {
        userMessage = 'Check your internet connection and try again.';
      } else if (error.message.includes('file') || error.message.includes('upload')) {
        userMessage = 'There was a problem with your audio file. Make sure it\'s a valid audio file and try again.';
      }

      setAnalysisResult({ error: userMessage });
      setIsAnalyzing(false);
      setShowWizard(false);
    }
  }

  const handleFileDrop = (selectedFile) => {
    setQuickAnalysisFile(selectedFile);
    setAnalysisResult(null);
    setShowWizard(true);
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    setQuickAnalysisFile(null);
    setAnalysisResult(null);
  };

  const handleAnalyzeAgain = () => {
    setAnalysisResult(null);
    setShowWizard(true);
    setQuickAnalysisFile(null);
  };

  return (
    <EngineLayout 
      engineType="KOE" 
      currentPageName="Upload"
      defaultTool="upload"
    >
      <div className="w-full h-full p-6 space-y-8">
        {/* Header - Better spacing */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-3 leading-tight">
            Music Analysis
          </h1>
          <p className="text-blue-300 text-base font-medium mb-4">Professional Audio Analysis</p>
          <div className="text-gray-300 space-y-2 text-sm">
            <p>
              <span className="text-green-300 font-medium">Your privacy matters:</span> We do NOT use your uploaded songs to train any AI models. Files are processed for analysis only.
            </p>
            <p className="text-sky-300 font-medium">Max file size: 50MB</p>
          </div>
        </div>
        
        {/* Content - Better spacing */}
        {!quickAnalysisFile && !isAnalyzing && !analysisResult && (
          <FileUploadZone
            onFileSelect={(e) => e.target.files && handleFileDrop(e.target.files[0])}
            dragActive={dragActive}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileDrop(e.dataTransfer.files[0]);
              }
            }}
            fileInputRef={fileInputRef} 
          />
        )}

        {showWizard && quickAnalysisFile && !isAnalyzing && (
          <AnalysisWizard
            file={quickAnalysisFile}
            onAnalyze={handleAnalyzeWithOptions}
            onCancel={handleWizardCancel}
          />
        )}

        {isAnalyzing && (
          <AnalysisProgress 
            stage={analysisStage}
            filename={quickAnalysisFile?.name}
          />
        )}

        {analysisResult?.error && (
          <Alert variant="destructive" className="border-blue-500/30 bg-black/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>{analysisResult.error}</AlertDescription>
            <Button onClick={handleAnalyzeAgain} className="mt-4 bg-gradient-to-r from-blue-500 to-blue-400 premium-button">
              Try Again
            </Button>
          </Alert>
        )}
      </div>
    </EngineLayout>
  );
}
