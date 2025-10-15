
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MessageBubble from "./MessageBubble";
import { AIAssistant } from "@/api/entities";
import { GlobalAIConfig } from "@/api/entities";
import { Conversation } from "@/api/entities";
import { User } from "@/api/entities";
import { claudeChat } from "@/api/functions";
import { mikkiChat } from "@/api/functions";
import { uploadToGemini } from "@/api/functions";
import { pollGeminiFileActive } from "@/api/functions";
import { generateGeminiAnalysis } from "@/api/functions";
import { Headphones, Zap, Award, Bot, Loader2, Send, Upload, FileAudio, ArrowLeft, ArrowRight, Music, Palette, Target, BarChart3, AlertTriangle, CheckCircle, Clock, History, Mic, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { UploadFile, UploadPrivateFile, CreateFileSignedUrl } from '@/api/integrations';
import { analyzeAudio } from '@/api/functions';
import { createPageUrl } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';

import AnalysisWizard from '../upload/AnalysisWizard';
import AnalysisProgress from '../upload/AnalysisProgress';
import VideoAnalysisProgress from '../upload/VideoAnalysisProgress';
import TypingIndicator from './TypingIndicator';
import SlashCommandPalette from "./SlashCommandPalette";

import { compareMixes } from "@/api/functions";
import { generateChordProgression } from "@/api/functions";
import { generateInstantHooks } from "@/api/functions";
import { generateContentScript } from "@/api/functions";
import { claudeBrainDumpAnalyzer } from "@/api/functions";
import { UserBrainDumpEntry } from "@/api/entities";

import { invokeKoeResponse } from "@/api/functions";
import { invokeArkResponse } from "@/api/functions";
import { invokeIndiResponse } from "@/api/functions";
import { toast } from 'sonner';
import { MixComparisons } from "@/api/entities";


// Removed summarizeConversation as it's no longer directly used in this component's logic

const iconMap = { Headphones, Zap, Award, Bot };

const toolInfo = {
  'analyze_track': {
    icon: '🎧',
    title: 'Analyze Track Mode',
    description: 'Drop an audio file or describe your track to begin a technical and musical analysis.',
    color: 'blue'
  },
  'mix_comparison': {
    icon: '⚖️',
    title: 'Mix Comparison Mode',
    description: 'Upload two audio files to get a detailed comparison of their technical and sonic qualities.',
    color: 'blue'
  },
  'generate_chords': {
    icon: '🎹',
    title: 'Chord Generation Mode',
    description: 'Describe the mood, genre, and key you want, and I\'ll generate a chord progression for you.',
    color: 'blue'
  },
  'create_hooks': {
    icon: '🎯',
    title: 'Viral Hooks Mode',
    description: 'Share your content idea, and I\'ll generate 5 viral hooks to grab attention.',
    color: 'orange'
  },
  'brain_dump': {
    icon: '🧠',
    title: 'Brain Dump Mode',
    description: 'Record your thoughts or type them out. I will analyze them for creative insights.',
    color: 'orange'
  },
  'script_generator': {
    icon: '📋',
    title: 'Script Generator Mode',
    description: 'Describe your video concept, and I\'ll generate a script based on your ideas.',
    color: 'orange'
  },
  'analyze_video': {
    icon: '🎥',
    title: 'Video Analysis Mode',
    description: 'Upload a short video for MIKKI to analyze performance, pacing, framing, and content strategy.',
    color: 'orange'
  }
};


export default function DashboardChat({
  activeConversationId,
  onNewConversationCreated,
  onConversationUpdate // This prop will remain but its internal logic is removed.
}) {
  const [user, setUser] = useState(null);
  const [assistants, setAssistants] = useState([]);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [messages, setMessages] = useState([]);
  // conversationId state removed, using activeConversationId prop
  const [isLoading, setIsLoading] = useState(false);
  const [universalPrompt, setUniversalPrompt] = useState('');
  const [inputMessage, setInputMessage] = useState("");
  const [useMikkiAsDefault, setUseMikkiAsDefault] = useState(true);

  const didInitRef = React.useRef(false);
  // conversationIdRef removed

  const SLASH_COMMANDS = React.useMemo(() => ([
    { key: "/intro", title: "Introduce team", desc: "KOE, ARK, INDI quick intros" },
    { key: "/analyse", title: "Analyze track", desc: "Upload or analyze an audio file" },
    { key: "/compare", title: "Mix comparison", desc: "Compare two mixes side by side" },
    { key: "/vid", title: "Video analysis", desc: "Analyze a video clip with MIKKI" },
    { key: "/dump", title: "Brain dump", desc: "Analyze your thoughts for insights" },
    { key: "/hook", title: "Hook generation", desc: "Generate 5 viral hooks" },
    { key: "/script", title: "Script writing", desc: "Create a content script" },
    { key: "/chords", title: "Chord generation", desc: "Generate a chord progression" }
  ]), []);

  const [showCommandPalette, setShowCommandPalette] = React.useState(false);
  const [filteredCommands, setFilteredCommands] = React.useState(SLASH_COMMANDS);
  const [selectedCommandIndex, setSelectedCommandIndex] = React.useState(0);

  const sanitizeMessagesForPersist = (msgs) =>
    (Array.isArray(msgs) ? msgs : []).map((m) => {
      const sanitized = {
        role: m.role,
        content: typeof m.content === 'string' ? m.content : String(m.content || ''),
        timestamp: m.timestamp,
        ...(m.assistant_name ? { assistant_name: m.assistant_name } : {})
      };
      if (m.messageType) sanitized.messageType = m.messageType;
      // if (m.isComparisonReady) sanitized.isComparisonReady = m.isComparisonReady; // Keep the flag for persistence

      // Removed logging for mix_comparison messages as they will no longer be of this type

      return sanitized;
    });

  const [activeSpecializedTool, setActiveSpecializedTool] = useState(null);

  const navigate = useNavigate();

  const [respondingAssistant, setRespondingAssistant] = useState(null);

  const [showWizard, setShowWizard] = useState(false);
  const [wizardFile, setWizardFile] = useState(null);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('uploading');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [showMixWizard, setShowMixWizard] = useState(false);
  const [mixFileA, setMixFileA] = useState(null);
  const [mixFileB, setMixFileB] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [mixError, setMixError] = useState(null);

  const [videoFile, setVideoFile] = useState(null);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const videoInputRef = React.useRef(null);
  const [videoAnalysisStage, setVideoAnalysisStage] = useState('idle'); // Updated initial state
  const [hasAnalyzed, setHasAnalyzed] = useState(false); // New state
  const [isPolling, setIsPolling] = useState(false); // New state
  const [videoPrompt, setVideoPrompt] = useState('');

  const [analysisContext, setAnalysisContext] = useState(null);

  // showHistory, conversations, conversationsLoading states removed
  // const [showHistory, setShowHistory] = useState(false);
  // const [conversations, setConversations] = useState([]);
  // const [conversationsLoading, setConversationsLoading] = useState(false);

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const initialLoadPerformed = useRef(false);

  const dashboardUploadInputRef = React.useRef(null);
  const mixAInputRef = React.useRef(null);
  const mixBInputRef = React.useRef(null);

  React.useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const messagesRef = React.useRef([]); // This ref must be declared here

  const getDefaultAssistants = React.useCallback(() => ([
    {
      assistant_id: 'mikki',
      name: 'MIKKI',
      persona: 'Orchestrator and manager',
      description: 'Orchestrator',
      icon: 'Bot',
      is_active: true,
      color_class: 'from-gray-500 to-gray-700'
    },
    {
      assistant_id: 'koe',
      name: 'KOE',
      persona: 'Audio engineering and mix/master specialist',
      description: 'Audio expert',
      icon: 'Headphones',
      is_active: true,
      color_class: 'from-blue-600 to-blue-700'
    },
    {
      assistant_id: 'ark',
      name: 'ARK',
      persona: 'Content strategy and hooks',
      description: 'Content strategist',
      icon: 'Zap',
      is_active: true,
      color_class: 'from-orange-600 to-red-600'
    },
    {
      assistant_id: 'indi',
      name: 'INDI',
      persona: 'Brand identity and visuals',
      description: 'Brand specialist',
      icon: 'Award',
      is_active: true,
      color_class: 'from-emerald-700 to-green-700'
    }
  ]), []);

  const getMikkiAssistant = React.useCallback(() => {
    const found = assistants.find(a => a.assistant_id === 'mikki');
    if (found) return found;
    return getDefaultAssistants().find(a => a.assistant_id === 'mikki');
  }, [assistants, getDefaultAssistants]);

  // lastConvFetchRef and loadConversationHistory removed

  // Load active conversation when activeConversationId changes
  React.useEffect(() => {
    const loadActiveConversation = async () => {
      if (!activeConversationId) {
        // New chat - clear everything
        setMessages([]);
        setAnalysisContext(null);
        setActiveSpecializedTool(null);
        return;
      }

      try {
        const conversation = await Conversation.get(activeConversationId);
        setMessages(conversation.messages || []);

        // Load analysis context if exists
        const lastAnalysisReport = conversation.messages?.find((m) => m.messageType === 'analysis_report');
        if (lastAnalysisReport) {
          try {
            setAnalysisContext(JSON.parse(lastAnalysisReport.content));
          } catch (e) {
            console.error("Failed to parse analysis context from selected conversation:", e);
            setAnalysisContext(null);
          }
        } else {
          setAnalysisContext(null);
        }
        setActiveSpecializedTool(null); // Reset tool when loading a conversation
        console.log('Loaded conversation:', conversation.title);
      } catch (error) {
        console.error('Failed to load conversation:', error);
        setMessages([]);
        setAnalysisContext(null);
      }
    };

    loadActiveConversation();
  }, [activeConversationId]);


  React.useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    (async () => {
      try {
        try {
          const u = await User.me();
          setUser(u);
        } catch (_) {
          setUser(null);
        }

        try {
          const list = await AIAssistant.list();
          const active = (list || []).filter((a) => a.is_active);

          if (!active.length) {
            setAssistants(getDefaultAssistants());
          } else {
            const coreDefaults = getDefaultAssistants();
            const coreDefaultsMap = new Map(coreDefaults.map(a => [a.assistant_id, a]));
            const byId = new Map(active.map(a => [a.assistant_id, a]));
            ['mikki', 'koe', 'ark', 'indi'].forEach(id => {
              if (!byId.has(id) && coreDefaultsMap.has(id)) {
                byId.set(id, coreDefaultsMap.get(id));
              }
            });
            setAssistants(Array.from(byId.values()));
          }
        } catch (e) {
          console.warn('Failed to load assistants, using defaults:', e);
          setAssistants(getDefaultAssistants());
        }

        try {
          const configs = await GlobalAIConfig.list();
          const mainConfig = configs.find((c) => c.config_id === 'main_config');
          if (mainConfig) {
            setUniversalPrompt(mainConfig.universal_prompt || '');
          }
        } catch (error) {
          console.warn('Could not load universal prompt:', error);
        }
      } catch (e) {
        console.error('Init failed:', e);
      }
    })();
  }, [getDefaultAssistants]);

  useEffect(() => {
    // onConversationUpdate logic removed, parent component will handle this based on activeConversationId and messages
    // This prop will remain but its internal logic is removed.
    // If we want to notify parent about message count changes, parent can derive this from messages state itself.
  }, [activeConversationId, messages.length, onConversationUpdate]); // Still watch activeConversationId and messages.length for potential parent updates

  // handleSelectConversation, handleNewChat, handleDeleteConversation removed


  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isLoading, showWizard, isAnalyzingFile, showMixWizard, isComparing, isAnalyzingVideo]);

  const visibleAssistants = useMemo(() => {
    const allowed = new Set(["koe", "ark", "indi", "mikki"]);
    return (assistants || []).filter((a) => allowed.has(a.assistant_id));
  }, [assistants]);

  useEffect(() => {
    if (!selectedAssistant && visibleAssistants.length) {
      setSelectedAssistant(visibleAssistants[0]);
      return;
    }
    if (
      selectedAssistant &&
      !visibleAssistants.find((a) => a.assistant_id === selectedAssistant.assistant_id) &&
      visibleAssistants.length) {
      setSelectedAssistant(visibleAssistants[0]);
    }
  }, [visibleAssistants, selectedAssistant]);

  const isAudioFile = (file) => {
    if (!file) return false;
    const okExt = /\.(mp3|wav|flac|m4a|aac)$/i.test(file.name || "");
    const okMime = /(audio\/(mp3|mpeg|wav|flac|mp4|aac))/i.test(file.type || "");
    return okExt || okMime;
  };
  const isUnderSizeLimit = (file, mb = 50) => file && file.size <= mb * 1024 * 1024;

  const isVideoFile = (file) => {
    if (!file) return false;
    const okExt = /\.(mp4|mov|webm|mkv)$/i.test(file.name || "");
    const okMime = /(video\/(mp4|quicktime|webm|x-matroska))/i.test(file.type || "");
    return okExt || okMime;
  };
  const isUnderVideoSizeLimit = (file, mb = 200) => file && file.size <= mb * 1024 * 1024;


  const handleFileDrop = (file) => {
    if (!isAudioFile(file)) {
      setAnalysisResult({
        error: 'Please upload a valid audio file (MP3, WAV, FLAC, M4A, AAC)'
      });
      return;
    }

    if (!isUnderSizeLimit(file)) {
      setAnalysisResult({
        error: 'File is too large. Please upload files smaller than 50MB.'
      });
      return;
    }

    setWizardFile(file);
    setShowWizard(true);
    setAnalysisResult(null);
  };

  const onDashboardFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileDrop(file);
    e.target.value = "";
  };

  const handleAnalyzeWithOptions = async (options) => {
    if (!wizardFile) return;

    setIsAnalyzingFile(true);
    setShowWizard(false);
    setAnalysisResult(null);
    setAnalysisStage('uploading');

    try {
      console.log('Starting analysis process from dashboard chat...', options);

      console.log('File uploaded to Base44...');
      const { file_url } = await UploadFile({ file: wizardFile });

      setAnalysisStage('analyzing');

      console.log('Sending to backend for analysis...');
      const { data } = await analyzeAudio({
        file: file_url,
        filename: wizardFile.name,
        musicalStyle: options.musicalStyle,
        isMaster: options.isMaster
      });

      setAnalysisStage('completed');
      console.log('Analysis completed:', data);

      const now = new Date().toISOString();

      const reportMessage = {
        role: "assistant",
        content: JSON.stringify(data.audioFile),
        timestamp: now,
        messageType: 'analysis_report',
        assistant_name: "KOE",
      };

      const koeSummaryMessage = {
        role: "assistant",
        content: data.koeSummary || "Analysis completed! I've reviewed your track and the technical data looks interesting. Feel free to ask me any questions about your mix!",
        timestamp: new Date(Date.now() + 1000).toISOString(),
        assistant_name: "KOE"
      };

      const updatedMessages = [...messagesRef.current, reportMessage, koeSummaryMessage];
      setMessages(updatedMessages);

      setAnalysisContext(data.audioFile);

      try {
        if (activeConversationId) {
          await Conversation.update(activeConversationId, { messages: sanitizeMessagesForPersist(updatedMessages) });
        } else {
          const conv = await Conversation.create({
            title: `Analysis: ${wizardFile.name}`,
            messages: sanitizeMessagesForPersist(updatedMessages),
            is_pinned: false
          });
          if (onNewConversationCreated) {
            onNewConversationCreated(conv.id);
          }
        }
      } catch (convError) {
        console.error('Failed to save conversation:', convError);
      }

      setIsAnalyzingFile(false);
      setWizardFile(null);

    } catch (error) {
      console.error('Analysis failed:', error);

      let userMessage = 'Something went wrong. Please try again.';

      if (error.message.includes('Rate limit') || error.message.includes('busy')) {
        userMessage = 'The analysis service is currently busy. Please wait a few minutes and try again.';
      } else if (error.message.includes('network') || error.message.includes('internet')) {
        userMessage = 'Check your internet connection and try again.';
      } else if (error.message.includes('file') || error.message.includes('upload')) {
        userMessage = 'There was a problem with your audio file. Make sure it\'s a valid audio file and try again.';
      }

      setAnalysisResult({ error: userMessage });
      setIsAnalyzingFile(false);
    }
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    setWizardFile(null);
    setAnalysisResult(null);
  };

  const handleAnalyzeAgain = () => {
    setAnalysisResult(null);
    setWizardFile(null);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isAudioFile(file)) {
        handleFileDrop(file);
      } else if (isVideoFile(file)) {
        setActiveSpecializedTool('analyze_video');
        setVideoFile(file);
        setVideoError(null);
        setVideoAnalysisStage('idle'); // Reset stage
        setHasAnalyzed(false); // Reset analyzed status
        setIsPolling(false); // Reset polling status
        setInputMessage('');
      } else {
        setAnalysisResult({
          error: 'Please drop a valid audio or video file (MP3, WAV, FLAC, M4A, AAC, MP4, MOV, WEBM, MKV).'
        });
      }
    }
  };

  const handleToolToggle = (toolName) => {
    // RE-ENABLED: allow mix_comparison selection
    if (activeSpecializedTool === toolName) {
      setActiveSpecializedTool(null);
      setShowMixWizard(false);
      setMixFileA(null);
      setMixFileB(null);
      setMixError(null);
      setVideoFile(null);
      setVideoError(null);
      setIsAnalyzingVideo(false);
      setVideoAnalysisStage('idle');
      setHasAnalyzed(false);
      setIsPolling(false);
      setVideoPrompt('');
    } else {
      setActiveSpecializedTool(toolName);
      setShowMixWizard(false);
      setMixFileA(null);
      setMixFileB(null);
      setMixError(null);
      setVideoFile(null);
      setVideoError(null);
      setIsAnalyzingVideo(false);
      setVideoAnalysisStage('idle');
      setHasAnalyzed(false);
      setIsPolling(false);
      setVideoPrompt('');
    }
    setInputMessage('');
  };

  const getActiveToolConfig = () => {
    if (!activeSpecializedTool) return null;

    const toolConfigs = {
      'analyze_track': {
        placeholder: "Describe your track or upload audio for analysis...",
        actionFn: (message) => handleAnalyzeTrackAction(message)
      },
      'mix_comparison': {
        placeholder: "Upload two audio files using the buttons below, then click 'Start Comparison'.",
        actionFn: (message) => handleMixComparisonAction(message)
      },
      'generate_chords': {
        placeholder: "Describe the mood, genre, and key you want, and I'll generate a chord progression for you...",
        actionFn: (message) => handleGenerateChordsAction(message)
      },
      'create_hooks': {
        placeholder: "Share your content idea or topic for viral hooks...",
        actionFn: (message) => handleCreateHooksAction(message)
      },
      'brain_dump': {
        placeholder: "Share your thoughts, ideas, or creative insights...",
        actionFn: (message) => handleBrainDumpAction(message)
      },
      'script_generator': {
        placeholder: "Describe your video concept or story idea...",
        actionFn: (message) => handleScriptGeneratorAction(message)
      },
      'analyze_video': {
        placeholder: "Optionally, describe what you want from this video (e.g., \"critique pacing and hook\").",
        actionFn: (message) => handleAnalyzeVideoAction(message)
      }
    };

    return toolConfigs[activeSpecializedTool] || null;
  };

  const updateAndPersistMessages = async (newMessages, currentConvId, initialMessage, assistantName) => {
    setMessages(newMessages);

    // Removed logging for mix_comparison messages

    try {
      if (!currentConvId) {
        // Create new conversation
        const title = initialMessage?.length > 40 ? initialMessage.slice(0, 40) + "..." : initialMessage || "New Conversation";
        const sanitized = sanitizeMessagesForPersist(newMessages);

        // Removed logging for mix_comparison messages

        const conv = await Conversation.create({
          title,
          messages: sanitized,
          is_pinned: false
        });
        // Notify parent that new conversation was created
        if (onNewConversationCreated) {
          onNewConversationCreated(conv.id);
        }
        return conv.id;
      } else {
        // Update existing conversation
        const sanitized = sanitizeMessagesForPersist(newMessages);

        // Removed logging for mix_comparison messages

        await Conversation.update(currentConvId, { messages: sanitized });
        return currentConvId;
      }
    } catch (err) {
      console.error("Failed to persist conversation:", err);
      return currentConvId;
    }
  };

  const handleAnalyzeTrackAction = async (_message) => {
    setIsLoading(true);
    const hint = {
      role: "assistant",
      content: "Drop an audio file or click 'Upload Track' to analyze. You can also type a description for a general AI response.",
      timestamp: new Date().toISOString(),
      assistant_name: "KOE",
    };
    const updated = [...messagesRef.current, hint];
    await updateAndPersistMessages(updated, activeConversationId, "Track Analysis", "KOE");
    setIsLoading(false);
  };

  const handleMixComparisonAction = async (_message) => {
    // Provide a hint message for the user when tool is activated
    setIsLoading(true);
    const hint = {
      role: "assistant",
      content: "Upload two audio files (A and B) below, then click Start Comparison.",
      timestamp: new Date().toISOString(),
      assistant_name: "KOE",
    };
    const updated = [...messagesRef.current, hint];
    await updateAndPersistMessages(updated, activeConversationId, "Mix Comparison", "KOE");
    setIsLoading(false);
  };

  const handleCompareComplete = async (result) => {
    // result should include a created MixComparisons record id; if not, fallback to latest
    let comparisonId =
      result?.comparison?.id ||
      result?.comparison_id ||
      result?.id;

    if (!comparisonId) {
      const recent = await MixComparisons.list('-created_date', 1);
      comparisonId = recent?.[0]?.id || null;
    }

    const payload = {
      comparison_id: comparisonId,
      filenameA: result?.filenameA || mixFileA?.name || "Mix A",
      filenameB: result?.filenameB || mixFileB?.name || "Mix B",
    };

    const msg = {
      role: "assistant",
      content: JSON.stringify(payload),
      timestamp: new Date().toISOString(),
      assistant_name: "KOE",
      messageType: "mix_comparison_ref",
    };

    const updated = [...messagesRef.current, msg];
    await updateAndPersistMessages(updated, activeConversationId, "Mix Comparison Ready", "KOE");

    setIsComparing(false);
    setMixFileA(null);
    setMixFileB(null);
    setMixError(null);
  };

  const startMixComparison = async () => {
    setMixError(null);
    if (!mixFileA || !mixFileB) {
      setMixError("Please select both files.");
      return;
    }
    if (!isUnderSizeLimit(mixFileA) || !isUnderSizeLimit(mixFileB)) {
      setMixError("Each file must be under 50MB.");
      return;
    }

    setIsComparing(true);

    try {
      // Upload both files
      const [upA, upB] = await Promise.all([
        UploadFile({ file: mixFileA }),
        UploadFile({ file: mixFileB }),
      ]);

      // Kick off comparison via backend function
      const { data } = await compareMixes({
        fileA: upA.file_url || upA.url || upA.fileUri || upA.fileUri, // tolerate shapes
        fileB: upB.file_url || upB.url || upB.fileUri || upB.fileUri,
        filenameA: mixFileA.name,
        filenameB: mixFileB.name,
      });

      await handleCompareComplete({
        ...(data || {}),
        filenameA: mixFileA.name,
        filenameB: mixFileB.name,
      });
    } catch (e) {
      setMixError("Comparison failed. Please try again.");
      console.error("Mix comparison failed:", e);
    } finally {
      setIsComparing(false);
    }
  };

  const handleGenerateChordsAction = async (message) => {
    setIsLoading(true);
    try {
      const { data } = await generateChordProgression({
        genre: "Pop",
        key: "C Major",
        mood: message || "emotive",
        complexity: "medium",
        numChords: 4,
      });

      if (!data?.success) {
        const errMsg = data?.error || "Could not generate chords right now.";
        const msg = {
          role: "assistant",
          content: errMsg,
          timestamp: new Date().toISOString(),
          assistant_name: "KOE",
        };
        const updated = [...messagesRef.current, msg];
        await updateAndPersistMessages(updated, activeConversationId, "Chord Generator Failed", "KOE");
        return;
      }

      const payload = { result: data.result, parameters: data.parameters };
      const msg = {
        role: "assistant",
        content: JSON.stringify(payload),
        timestamp: new Date().toISOString(),
        assistant_name: "KOE",
        messageType: "koe_chords" // NEW messageType
      };

      const updated = [...messagesRef.current, msg];
      await updateAndPersistMessages(updated, activeConversationId, "Chord Generator", "KOE");
    } catch (err) {
      console.error("Chord generation failed:", err);
      const msg = {
        role: "assistant",
        content: err?.message || "Failed to generate chords.",
        timestamp: new Date().toISOString(),
        assistant_name: "KOE",
      };
      const updated = [...messagesRef.current, msg];
      await updateAndPersistMessages(updated, activeConversationId, "Chord Generator Error", "KOE");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateHooksAction = async (message) => {
    setIsLoading(true);
    try {
      const { data } = await generateInstantHooks({ request: message || "New music promo idea" });
      if (!data?.success) {
        const msg = {
          role: "assistant",
          content: data?.error || "Failed to generate hooks.",
          timestamp: new Date().toISOString(),
          assistant_name: "ARK",
        };
        const updated = [...messagesRef.current, msg];
        await updateAndPersistMessages(updated, activeConversationId, "Viral Hooks Failed", "ARK");
        return;
      }
      const hooks = data.hooks || {};
      const payload = { hooks, prompt: message || "New music promo idea" };
      const msg = {
        role: "assistant",
        content: JSON.stringify(payload),
        timestamp: new Date().toISOString(),
        assistant_name: "ARK",
        messageType: "ark_hooks"
      };
      const updated = [...messagesRef.current, msg];
      await updateAndPersistMessages(updated, activeConversationId, "Viral Hooks", "ARK");
    } catch (err) {
      console.error("Hook generation failed:", err);
      const msg = {
        role: "assistant",
        content: err?.message || "Failed to generate hooks.",
        timestamp: new Date().toISOString(),
        assistant_name: "ARK",
      };
      const updated = [...messagesRef.current, msg];
      await updateAndPersistMessages(updated, activeConversationId, "Viral Hooks Error", "ARK");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScriptGeneratorAction = async (message) => {
    setIsLoading(true);
    try {
      const { data } = await generateContentScript({ request: message || "Story about releasing a new single" });
      if (!data?.success) {
        const msg = {
          role: "assistant",
          content: data?.error || "Failed to generate script.",
          timestamp: new Date().toISOString(),
          assistant_name: "ARK",
        };
        const updated = [...messagesRef.current, msg];
        await updateAndPersistMessages(updated, activeConversationId, "Script Generator Failed", "ARK");
        return;
      }
      const script = data.script || {};
      const payload = { script, prompt: message || "Story about releasing a new single" };
      const msg = {
        role: "assistant",
        content: JSON.stringify(payload),
        timestamp: new Date().toISOString(),
        assistant_name: "ARK",
        messageType: "ark_script"
      };
      const updated = [...messagesRef.current, msg];
      await updateAndPersistMessages(updated, activeConversationId, "Script Generator", "ARK");
    } catch (err) {
      console.error("Script generation failed:", err);
      const msg = {
        role: "assistant",
        content: err?.message || "Failed to generate script.",
        timestamp: new Date().toISOString(),
        assistant_name: "ARK",
      };
      const updated = [...messagesRef.current, msg];
      await updateAndPersistMessages(updated, activeConversationId, "Script Generator Error", "ARK");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrainDumpAction = async (message) => {
    setIsLoading(true);
    try {
      const entry = await UserBrainDumpEntry.create({
        content: message || "Untitled thought",
        entry_type: "text",
        processing_status: "pending",
      });

      const { data } = await claudeBrainDumpAnalyzer({ latestBrainDumpId: entry.id });
      if (!data?.success) {
        const msg = {
          role: "assistant",
          content: data?.error || "Failed to analyze your thoughts.",
          timestamp: new Date().toISOString(),
          assistant_name: "ARK",
        };
        const updated = [...messagesRef.current, msg];
        await updateAndPersistMessages(updated, activeConversationId, "Brain Dump Failed", "ARK");
        return;
      }

      const a = data.analysis || {};
      const summary = [
        `Creative Readiness: ${a.creative_readiness_score ?? "N/A"}/100`,
        `Recommendation: ${a.recommendation || "N/A"}`,
        a.current_story_arc ? `Story Arc: ${a.current_story_arc}` : "",
        a.emotional_state
          ? `Emotions — Confidence: ${a.emotional_state.confidence_level}/10, Clarity: ${a.emotional_state.clarity_score}/10, Energy: ${a.emotional_state.energy_level}/10`
          : "",
        Array.isArray(a.dominant_themes) && a.dominant_themes.length
          ? `Themes: ${a.dominant_themes.slice(0, 5).join(", ")}`
          : "",
        Array.isArray(a.content_opportunities) && a.content_opportunities.length
          ? `Top Content Idea: "${a.content_opportunities[0].title}" — ${a.content_opportunities[0].hook_suggestion}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      const msg = {
        role: "assistant",
        content: summary,
        timestamp: new Date().toISOString(),
        assistant_name: "ARK",
      };
      const updated = [...messagesRef.current, msg];
      await updateAndPersistMessages(updated, activeConversationId, "Brain Dump", "ARK");
    } catch (err) {
      console.error("Brain dump analysis failed:", err);
      const msg = {
        role: "assistant",
        content: err?.message || "Failed to analyze your thoughts.",
        timestamp: new Date().toISOString(),
        assistant_name: "ARK",
      };
      const updated = [...messagesRef.current, msg];
      await updateAndPersistMessages(updated, activeConversationId, "Brain Dump Error", "ARK");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeVideoAction = async (_message) => {
    if (_message) {
      setVideoPrompt(_message);
    }
    const hint = {
      role: "assistant",
      content: "Upload a video clip (max 200MB). After selecting, click Start Analysis for MIKKI’s feedback.",
      timestamp: new Date().toISOString(),
      assistant_name: "MIKKI",
    };
    const updated = [...messagesRef.current, hint];
    await updateAndPersistMessages(updated, activeConversationId, "Video Analysis", "MIKKI");
  };

  const startVideoAnalysis = async (customPrompt) => {
    // Guard: prevent multiple simultaneous analyses
    if (isAnalyzingVideo || hasAnalyzed || isPolling || !user) {
      console.log('Video analysis already in progress, completed, or user not loaded');
      if (!user) setVideoError("User not found. Please refresh and try again.");
      return;
    }

    if (!videoFile) {
      setVideoError("Please select a video file first.");
      return;
    }
    if (!isVideoFile(videoFile)) {
      setVideoError("Supported video formats: MP4, MOV, WEBM, MKV.");
      return;
    }
    if (!isUnderVideoSizeLimit(videoFile, 200)) {
      setVideoError("Video too large. Max 200MB supported.");
      return;
    }

    const runId = Date.now();
    console.log(`[VideoAnalysis-${runId}] Starting analysis`);

    setIsAnalyzingVideo(true);
    setIsLoading(true);
    setVideoError(null);
    setVideoAnalysisStage('uploading');
    setHasAnalyzed(false);
    setIsPolling(false);

    try {
      // Step 1: Upload to private storage
      console.log(`[VideoAnalysis-${runId}] Step 1: Uploading to private storage`);
      const configs = await GlobalAIConfig.list();
      const mainConfig = configs.find(c => c.config_id === 'main_config');

      const { file_uri } = await UploadPrivateFile({
        file: videoFile,
        app_owner: user.email,
        app_id: mainConfig?.app_id
      });

      // Step 2: Generate signed URL
      console.log(`[VideoAnalysis-${runId}] Step 2: Generating signed URL`);
      const signedUrlRes = await CreateFileSignedUrl({
        file_uri: file_uri,
        expires_in: 600
      });

      if (!signedUrlRes.signed_url) {
        throw new Error("Failed to generate signed URL for video file");
      }

      // Step 3: Upload to Gemini
      console.log(`[VideoAnalysis-${runId}] Step 3: Uploading to Gemini`);
      setVideoAnalysisStage('processing');
      const { data: uploadRes } = await uploadToGemini({
        file: signedUrlRes.signed_url,
        filename: videoFile.name,
        runId
      });

      if (!uploadRes?.success) {
        throw new Error(uploadRes?.error || "Failed to upload video to Gemini");
      }

      const { fileName, fileUri: geminiFileUri, mimeType } = uploadRes;

      // Step 4: Poll for ACTIVE status (single shot)
      console.log(`[VideoAnalysis-${runId}] Step 4: Polling for ACTIVE status`);
      setIsPolling(true);
      const { data: pollRes } = await pollGeminiFileActive({
        fileName,
        timeoutMs: 480000,
        runId
      });
      setIsPolling(false);

      if (!pollRes?.success) {
        throw new Error(pollRes?.error || "Video processing failed or timed out");
      }

      // Step 5: Generate analysis (single shot)
      console.log(`[VideoAnalysis-${runId}] Step 5: Generating analysis`);
      setVideoAnalysisStage('analyzing');
      const { data: analysisRes } = await generateGeminiAnalysis({
        fileUri: geminiFileUri,
        mimeType,
        prompt: (customPrompt && customPrompt.trim()) ? customPrompt : (videoPrompt && videoPrompt.trim()) ? videoPrompt : undefined,
        runId
      });

      if (!analysisRes?.success || !analysisRes.analysis_json) {
        throw new Error(analysisRes?.error || "Video analysis failed to produce structured JSON");
      }

      // Step 6: Success - display results
      console.log(`[VideoAnalysis-${runId}] Step 6: Analysis completed successfully`);
      setVideoAnalysisStage('completed');
      setHasAnalyzed(true);

      const msg = {
        role: "assistant",
        content: JSON.stringify(analysisRes.analysis_json),
        timestamp: new Date().toISOString(),
        assistant_name: "MIKKI",
        messageType: "mikki_video_analysis"
      };
      const updated = [...messagesRef.current, msg];
      await updateAndPersistMessages(updated, activeConversationId, "Video Analysis", "MIKKI");

      setVideoFile(null);
      setVideoPrompt('');

      console.log(`[VideoAnalysis-${runId}] COMPLETED - Total duration: ${Date.now() - runId}ms`);

    } catch (err) {
      console.error(`[VideoAnalysis-${runId}] ERROR:`, err);

      let userErrorMessage = err?.response?.data?.error || err?.message || "Video analysis failed.";
      if (userErrorMessage.toLowerCase().includes('timeout')) {
        userErrorMessage = "Analysis timed out. The video is likely too large or complex to process within the 10-minute limit. Please try again with a smaller video file.";
      } else if (err?.message && (err.message.includes('DatabaseTimeout') || err.message.includes('544'))) {
        userErrorMessage = "Upload timed out. The server is currently busy. Please try again in a few moments or use a smaller file.";
      }

      const msg = {
        role: "assistant",
        content: userErrorMessage,
        timestamp: new Date().toISOString(),
        assistant_name: "MIKKI",
      };
      const updated = [...messagesRef.current, msg];
      await updateAndPersistMessages(updated, activeConversationId, "Video Analysis Error", "MIKKI");
      setVideoError(userErrorMessage);
      setVideoAnalysisStage('error');
    } finally {
      setTimeout(() => {
        setIsAnalyzingVideo(false);
        setIsLoading(false);
        setIsPolling(false);
      }, 500);
    }
  };

  const handleAIResponse = async (assistant, currentMessages, convId, opts = {}) => {
    if (!assistant) return;

    setRespondingAssistant(assistant);
    setIsLoading(true);

    const recentMessages = Array.isArray(currentMessages) ? currentMessages.slice(-20) : [];
    const assistantPersona = assistant.persona || "You are a helpful assistant.";
    const combinedPrompt = universalPrompt ? `${universalPrompt}\n\n${assistantPersona}` : assistantPersona;

    const conversationHistory = recentMessages
      .filter((m) => m.messageType !== 'analysis_report')
      .map((m) => (m.role === 'user' ? `User: ${m.content}` : `${m.assistant_name || 'Assistant'}: ${m.content}`))
      .join('\n');

    let finalPrompt = `${combinedPrompt}

Here is the full conversation history so far. Please respond as ${assistant.name}, taking into account everything that has been discussed:

${conversationHistory}

Your response as ${assistant.name}:`;

    if (opts && typeof opts.hint === 'string' && opts.hint.trim().length > 0) {
      finalPrompt += `

Instruction for ${assistant.name}: ${opts.hint.trim()}`;
    }

    const lastUserMessage = recentMessages.filter(m => m.role === 'user').pop();
    const userMessageContent = lastUserMessage?.content || '';

    let aiText = "";
    try {
      if (assistant.assistant_id === 'mikki') {
        const { data } = await mikkiChat({ prompt: finalPrompt });
        aiText = data?.response || "";
      } else if (assistant.assistant_id === 'koe') {
        const contextData = {
          conversation_context: recentMessages,
          user_message: userMessageContent
        };

        if (analysisContext) {
          const { data } = await claudeChat({
            prompt: finalPrompt,
            analysisDataA: analysisContext.analysis_result?.mixDiagnosisResults?.payload,
            filenameA: analysisContext.filename
          });
          aiText = data?.response || "";
        } else {
          const { data } = await invokeKoeResponse(contextData);
          aiText = data?.specialist_response || "";
        }
      } else if (assistant.assistant_id === 'ark') {
        const contextData = {
          conversation_context: recentMessages,
          user_message: userMessageContent
        };
        const { data } = await invokeArkResponse(contextData);
        aiText = data?.specialist_response || "";
      } else if (assistant.assistant_id === 'indi') {
        const contextData = {
          conversation_context: recentMessages,
          user_message: userMessageContent
        };
        const { data } = await invokeIndiResponse(contextData);
        aiText = data?.specialist_response || "";
      } else {
        const { data } = await claudeChat({ prompt: finalPrompt });
        aiText = data?.response || "";
      }
    } catch (_e) {
      console.error("AI response error:", _e);
      aiText = "Sorry, I’m having trouble responding right now.";
    }

    const aiMessage = {
      role: "assistant",
      content: aiText || "I'm sorry, I couldn't generate a response. Please try again.",
      timestamp: new Date().toISOString(),
      assistant_name: assistant.name
    };

    const finalMessages = [...currentMessages, aiMessage];
    setMessages(finalMessages);

    try {
      if (convId) {
        await Conversation.update(convId, { messages: sanitizeMessagesForPersist(finalMessages) });
      } else {
        const title = lastUserMessage?.content?.length > 40 ? lastUserMessage.content.slice(0, 40) + "..." : lastUserMessage?.content || "New Conversation";
        const conv = await Conversation.create({
          title,
          messages: sanitizeMessagesForPersist(finalMessages),
          is_pinned: false
        });
        if (onNewConversationCreated) {
          onNewConversationCreated(conv.id);
        }
      }
    } catch (persistErr) {
      console.warn('Failed to persist AI response:', persistErr);
    }

    setIsLoading(false);
    setRespondingAssistant(null);

    return aiMessage;
  };

  const parseSlashCommand = (text) => {
    if (!text || text[0] !== '/') return null;
    const parts = text.trim().split(/\s+/);
    const raw = (parts[0] || '').toLowerCase();
    const args = parts.slice(1).join(' ').trim();

    const map = {
      '/intro': 'intro',
      '/introduce_team': 'intro',
      '/analyse': 'analyse',
      '/analyze': 'analyse',
      '/compare': 'compare',
      '/vid': 'vid',
      '/dump': 'dump',
      '/hook': 'hook',
      '/script': 'script',
      '/chords': 'chords'
    };

    const cmd = map[raw];
    if (!cmd) return null;
    return { cmd, args };
  };


  const handleInputSendMessage = async () => {
    let messageToSend = inputMessage.trim();
    if (activeSpecializedTool === 'analyze_video') {
      messageToSend = (videoPrompt || '').trim();
    }

    if ((!messageToSend && activeSpecializedTool !== 'analyze_video') || isLoading || isAnalyzingFile || showMixWizard || isComparing || isAnalyzingVideo) return;

    const parsed = parseSlashCommand(messageToSend);
    if (parsed) {
      setInputMessage('');
      setVideoPrompt('');

      const now = new Date().toISOString();
      const userMsg = { role: "user", content: messageToSend, timestamp: now };
      const updated = [...messages, userMsg];
      setMessages(updated);

      let currentConvId = activeConversationId;
      currentConvId = await updateAndPersistMessages(updated, currentConvId, messageToSend, "User");

      const { cmd, args } = parsed;

      if (cmd === 'intro') {
        const ack = {
          role: "assistant",
          content: "Introducing the team.",
          timestamp: new Date(Date.now() + 200).toISOString(),
          assistant_name: "MIKKI"
        };
        const acked = [...updated, ack];
        setMessages(acked);
        try {
          if(currentConvId) {
             await Conversation.update(currentConvId, { messages: sanitizeMessagesForPersist(acked) });
          } else { // This case should be handled by updateAndPersistMessages above, but as a fallback
             const title = messageToSend.length > 40 ? messageToSend.slice(0, 40) + "..." : messageToSend || "New Conversation";
             const conv = await Conversation.create({ title, messages: sanitizeMessagesForPersist(acked), is_pinned: false });
             if (onNewConversationCreated) onNewConversationCreated(conv.id);
             currentConvId = conv.id;
          }
        } catch (err) {
          console.error('Persist ack failed:', err);
        }
        const mikkiAssistant = getMikkiAssistant();
        await handleAIResponse(mikkiAssistant, acked, currentConvId, { hint: "Introduce your specialist AI team: KOE (audio), ARK (content), and INDI (brand). Keep it concise and impactful." });
        return;
      }

      if (cmd === 'analyse') {
        setActiveSpecializedTool('analyze_track');
        await handleAnalyzeTrackAction(args || '');
        return;
      }

      if (cmd === 'compare') {
        setActiveSpecializedTool('mix_comparison'); // Enable mix comparison tool selection
        await handleMixComparisonAction(args || '');
        return;
      }

      if (cmd === 'vid') {
        setActiveSpecializedTool('analyze_video');
        setVideoPrompt(args || '');
        await handleAnalyzeVideoAction(args || '');
        return;
      }

      if (cmd === 'dump') {
        await handleBrainDumpAction(args || "");
        return;
      }

      if (cmd === 'hook') {
        await handleCreateHooksAction(args || "New music promo idea");
        return;
      }

      if (cmd === 'script') {
        await handleScriptGeneratorAction(args || "Story about releasing a new single");
        return;
      }

      if (cmd === 'chords') {
        await handleGenerateChordsAction(args || "emotive");
        return;
      }

      return;
    }

    setInputMessage("");
    setVideoPrompt('');

    const now = new Date().toISOString();
    const userMsg = { role: "user", content: messageToSend, timestamp: now };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    let currentConvId = activeConversationId;
    currentConvId = await updateAndPersistMessages(newMessages, currentConvId, messageToSend, "User");

    const toolConfig = getActiveToolConfig();
    if (activeSpecializedTool && toolConfig?.actionFn) {
      setIsLoading(true);
      await toolConfig.actionFn(messageToSend);
      setIsLoading(false);
      return;
    }

    if (useMikkiAsDefault) {
      const mikkiAssistant = getMikkiAssistant();
      await handleAIResponse(mikkiAssistant, newMessages, currentConvId);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!showCommandPalette) {
        handleInputSendMessage();
      }
    }
  };

  const acceptCommandSelection = (cmd) => {
    const next = `${cmd.key} `;
    setInputMessage(next);
    setVideoPrompt(next);
    setShowCommandPalette(false);
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        try {
          const el = inputRef.current;
          el.setSelectionRange(next.length, next.length);
        } catch (_) {}
      }
    });
  };

  const handleKeyDown = (e) => {
    if (!showCommandPalette) return;

    const max = filteredCommands.length;
    if (max === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedCommandIndex((i) => (i + 1) % max);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedCommandIndex((i) => (i - 1 + max) % max);
      return;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const cmd = filteredCommands[selectedCommandIndex] || filteredCommands[0];
      if (cmd) acceptCommandSelection(cmd);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setShowCommandPalette(false);
    }
  };

  const onInputChange = (e) => {
    const val = e.target.value;

    if (activeSpecializedTool === 'analyze_video') {
      setVideoPrompt(val);
    }
    setInputMessage(val);

    if (typeof val === 'string' && val.startsWith('/')) {
      const q = val.toLowerCase();
      const items = SLASH_COMMANDS.filter(
        c =>
          c.key.startsWith(q) ||
          c.title.toLowerCase().includes(q.slice(1)) ||
          c.desc?.toLowerCase().includes(q.slice(1))
      );
      setFilteredCommands(items);
      setSelectedCommandIndex(0);
      setShowCommandPalette(true);
    } else {
      setShowCommandPalette(false);
    }
  };

  const isInputDisabled = isLoading || isAnalyzingFile || showWizard || showMixWizard || isComparing || isAnalyzingVideo || isPolling || (!useMikkiAsDefault && !selectedAssistant && !activeSpecializedTool);

  const isSendButtonDisabled = useMemo(() => {
    if (isInputDisabled) return true;
    if (activeSpecializedTool === 'analyze_video') {
      return !videoPrompt.trim() && !videoFile;
    }
    return !inputMessage.trim();
  }, [isInputDisabled, activeSpecializedTool, inputMessage, videoPrompt, videoFile]);

  const activeToolInfo = activeSpecializedTool ? toolInfo[activeSpecializedTool] : null;

  const getToolColorClasses = useCallback((toolKey) => {
    const tool = toolInfo[toolKey];
    if (!tool || !tool.color) return '';

    const isActive = activeSpecializedTool === toolKey;
    const color = tool.color;

    if (color === 'blue') {
      return isActive ?
        'bg-blue-500/30 border-blue-400/60 text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.4)]' :
        'bg-blue-500/10 border-blue-400/30 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400/50';
    } else if (color === 'orange') {
      return isActive ?
        'bg-orange-500/30 border-orange-400/60 text-orange-200 shadow-[0_0_10px_rgba(249,115,22,0.4)]' :
        'bg-orange-500/10 border-orange-400/30 text-orange-300 hover:bg-orange-500/20 hover:border-orange-400/50';
    }
    return isActive ?
      'bg-gray-500/30 border-gray-400/60 text-gray-200 shadow-[0_0_10px_rgba(107,114,128,0.4)]' :
      'bg-gray-500/10 border-gray-400/30 text-gray-300 hover:bg-gray-500/20 hover:border-gray-400/50';
  }, [activeSpecializedTool]);

  const getActiveToolInfoBoxClasses = useCallback(() => {
    if (!activeSpecializedTool) return { bg: 'bg-gray-800/50', border: 'border-white/10', titleText: 'text-white' };
    const tool = toolInfo[activeSpecializedTool];
    if (!tool || !tool.color) return { bg: 'bg-gray-800/50', border: 'border-white/10', titleText: 'text-white' };

    const color = tool.color;
    if (color === 'blue') {
      return {
        bg: 'bg-blue-800/50',
        border: 'border-blue-400/40',
        titleText: 'text-blue-200'
      };
    } else if (color === 'orange') {
      return {
        bg: 'bg-orange-800/50',
        border: 'border-orange-400/40',
        titleText: 'text-orange-200'
      };
    }
    return { bg: 'bg-gray-800/50', border: 'border-white/10', titleText: 'text-white' };
  }, [activeSpecializedTool]);

  const activeToolInfoBoxClasses = getActiveToolInfoBoxClasses();

  return (
    <>
      {/* DashboardChatHistory component removed from here, to be managed by parent */}
      {/*
      <DashboardChatHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        conversations={conversations}
        currentConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isLoading={conversationsLoading}
        onRefresh={loadConversationHistory}
        />
      */}

      <div
        className={`flex flex-col h-full w-full relative bg-cover bg-center bg-no-repeat bg-[url('/img/bg.webp')] ${
          dragActive ? 'bg-blue-500/5' : ''}`
        }
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}>


        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar space-y-3 min-h-0">
          {showWizard && wizardFile &&
            <div className="w-full max-w-4xl mx-auto">
              <AnalysisWizard
                file={wizardFile}
                onAnalyze={handleAnalyzeWithOptions}
                onCancel={handleWizardCancel} />

            </div>
          }

          {isAnalyzingFile &&
            <div className="w-full max-w-4xl mx-auto">
              <AnalysisProgress
                stage={analysisStage}
                filename={wizardFile?.name} />

            </div>
          }

          {analysisResult?.error &&
            <div className="w-full max-w-4xl mx-auto">
              <Alert variant="destructive" className="border-red-500/30 bg-black/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>{analysisResult.error}</AlertDescription>
                <Button onClick={handleAnalyzeAgain} className="mt-4 bg-gradient-to-r from-blue-500 to-blue-400">
                  Try Again
                </Button>
              </Alert>
            </div>
          }

          {activeSpecializedTool === 'mix_comparison' && showMixWizard && !isComparing &&
            <div className="w-full max-w-4xl mx-auto">
              <div className="rounded-xl border border-blue-500/30 bg-black/50 p-6">
                <h3 className="text-white font-semibold mb-2">Mix Comparison</h3>
                <p className="text-sm text-gray-300 mb-4">Select two audio files (Max 50MB each) to compare.</p>
                {mixError && <div className="text-red-400 text-sm mb-3">{mixError}</div>}


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 p-4 rounded-lg border border-white/10 bg-black/40">
                    <span className="text-xs text-gray-400">Mix A</span>
                    <Button
                      variant="outline"
                      onClick={() => mixAInputRef.current?.click()}
                      className="border-blue-500/30 text-blue-200 hover:bg-blue-500/10"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Track A
                    </Button>
                    {mixFileA && (
                      <div className="text-xs text-gray-300 truncate">
                        <FileAudio className="inline w-4 h-4 mr-1" />
                        {mixFileA.name}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 p-4 rounded-lg border border-white/10 bg-black/40">
                    <span className="text-xs text-gray-400">Mix B</span>
                    <Button
                      variant="outline"
                      onClick={() => mixBInputRef.current?.click()}
                      className="border-blue-500/30 text-blue-200 hover:bg-blue-500/10"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Track B
                    </Button>
                    {mixFileB && (
                      <div className="text-xs text-gray-300 truncate">
                        <FileAudio className="inline w-4 h-4 mr-1" />
                        {mixFileB.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Button onClick={startMixComparison} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading || isComparing}>
                    <Upload className="w-4 h-4 mr-2" />
                    Start Comparison
                  </Button>
                  <Button variant="outline" onClick={() => { setShowMixWizard(false); setMixFileA(null); setMixFileB(null); setMixError(null); }} disabled={isLoading || isComparing}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          }

          {isComparing &&
            <div className="w-full max-w-4xl mx-auto">
              <div className="rounded-xl border border-blue-500/30 bg-black/50 p-6 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <div className="text-sm text-blue-200">Comparing mixes... This usually takes ~30–90 seconds.</div>
              </div>
            </div>
          }

          {activeSpecializedTool === 'analyze_video' && isAnalyzingVideo &&
            <div className="w-full max-w-4xl mx-auto">
              <VideoAnalysisProgress
                stage={videoAnalysisStage}
                filename={videoFile?.name}
              />
            </div>
          }


          {!showWizard && !isAnalyzingFile && !showMixWizard && !isComparing && !isAnalyzingVideo && messages.length === 0 && !isLoading && (
            <div className="h-full w-full flex flex-col items-center justify-center">
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  filter: [
                    'drop-shadow(0 0 15px rgba(255, 255, 255, 0.1)) drop-shadow(0 0 30px rgba(34, 211, 238, 0.3))',
                    'drop-shadow(0 0 25px rgba(255, 255, 255, 0.2)) drop-shadow(0 0 45px rgba(34, 211, 238, 0.4))',
                    'drop-shadow(0 0 15px rgba(255, 255, 255, 0.1)) drop-shadow(0 0 30px rgba(34, 211, 238, 0.3))',
                  ],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="mb-6"
              >
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/87fbac0bf_tmanewlogo81.png"
                  alt="TMA OS Logo"
                  className="w-28 h-28"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                />
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-2">
                Hey {user?.full_name?.split(' ')[0] || ''}, Welcome to TMA OS
              </h2>
              <p className="text-sm text-gray-400 text-center">
                {activeSpecializedTool ?
                  `${toolInfo[activeSpecializedTool]?.title || activeSpecializedTool.replace('_', ' ')} active` :
                  (useMikkiAsDefault ? "Mikki is ready! Type your message." : "Drop an audio file here to analyze, or select an AI to enable input.")
                }
              </p>
            </div>
          )}

          {!showWizard && !isAnalyzingFile && !showMixWizard && !isComparing && !isAnalyzingVideo && messages.map((m, idx) =>
            <div key={m.id || idx} className="w-full max-w-4xl mx-auto">
              <MessageBubble message={m} />
            </div>
          )}

          {isLoading && !isAnalyzingFile && !isComparing && !isAnalyzingVideo && (
            <div className="w-full max-w-4xl mx-auto">
              <TypingIndicator
                assistantName={respondingAssistant?.name?.toLowerCase() || 'mikki'}
              />
            </div>
          )}

          {dragActive && !showWizard && !isAnalyzingFile && !showMixWizard && !isComparing && !isAnalyzingVideo &&
            <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-400 rounded-2xl flex items-center justify-center z-10 pointer-events-none">
              <div className="text-center text-blue-300">
                <FileAudio className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-semibold">Drop your audio or video file here</p>
                <p className="text-sm">Audio: MP3, WAV, FLAC, M4A, AAC (Max 50MB)</p>
                <p className="text-sm">Video: MP4, MOV, WEBM, MKV (Max 200MB)</p>
              </div>
            </div>
          }
        </div>

        {!showWizard && !isAnalyzingFile &&
          <div className="p-4 pt-2 border-t border-white/10 flex-shrink-0 bg-black/20 backdrop-blur-sm relative">
            <SlashCommandPalette
              open={showCommandPalette && filteredCommands.length > 0}
              items={filteredCommands}
              selectedIndex={selectedCommandIndex}
              onSelect={acceptCommandSelection}
            />

            <AnimatePresence>
              {activeToolInfo &&
                <motion.div
                  key={activeSpecializedTool}
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="mb-3 overflow-hidden">

                  <div className={`rounded-lg p-3 flex items-start gap-3 ${activeToolInfoBoxClasses.bg} ${activeToolInfoBoxClasses.border}`}>
                    <div className="text-xl mt-1">{activeToolInfo.icon}</div>
                    <div>
                      <h4 className={`font-bold text-sm ${activeToolInfoBoxClasses.titleText}`}>{activeToolInfo.title}</h4>
                      <p className="text-gray-300 text-xs leading-snug">{activeToolInfo.description}</p>
                    </div>
                  </div>
                </motion.div>
              }
            </AnimatePresence>

            {activeSpecializedTool === 'analyze_track' && (
              <div className="mb-3 flex items-center gap-2">
                <input
                  ref={dashboardUploadInputRef}
                  type="file"
                  accept=".mp3,.wav,.flac,.m4a,.aac,audio/*"
                  onChange={onDashboardFilePick}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => dashboardUploadInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || isAnalyzingFile}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Track
                </Button>
                <span className="text-xs text-gray-400">MP3, WAV, FLAC, M4A, AAC • Max 50MB</span>
              </div>
            )}

            {/* Mix comparison UI elements - RE-ENABLED */}
            {activeSpecializedTool === 'mix_comparison' && (
              <div className="mb-3 flex items-center gap-3 flex-wrap">
                <input
                  ref={mixAInputRef}
                  type="file"
                  accept=".mp3,.wav,.flac,.m4a,.aac,audio/*"
                  onChange={(e) => { setMixFileA(e.target.files?.[0] || null); e.target.value = ""; }}
                  className="hidden"
                />
                <input
                  ref={mixBInputRef}
                  type="file"
                  accept=".mp3,.wav,.flac,.m4a,.aac,audio/*"
                  onChange={(e) => { setMixFileB(e.target.files?.[0] || null); e.target.value = ""; }}
                  className="hidden"
                />

                <Button
                  type="button"
                  onClick={() => mixAInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || isComparing}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Track A
                </Button>
                {mixFileA && (
                  <span className="text-xs text-gray-300 truncate max-w-[calc(50%-4rem)]">
                    <FileAudio className="inline w-3 h-3 mr-1" />
                    {mixFileA.name}
                  </span>
                )}

                <Button
                  type="button"
                  onClick={() => mixBInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || isComparing}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Track B
                </Button>
                {mixFileB && (
                  <span className="text-xs text-gray-300 truncate max-w-[calc(50%-4rem)]">
                    <FileAudio className="inline w-3 h-3 mr-1" />
                    {mixFileB.name}
                  </span>
                )}

                <Button
                  type="button"
                  onClick={startMixComparison}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || isComparing || !mixFileA || !mixFileB}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Start Comparison
                </Button>

                <span className="text-xs text-gray-400 basis-full">
                  MP3, WAV, FLAC, M4A, AAC • Max 50MB each
                </span>

                {mixError && <span className="text-xs text-red-400 basis-full">{mixError}</span>}
              </div>
            )}

            {activeSpecializedTool === 'analyze_video' && (
              <div className="mb-3 flex items-center gap-3 flex-wrap">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept=".mp4,.mov,.webm,.mkv,video/*"
                  onChange={(e) => { setVideoFile(e.target.files?.[0] || null); e.target.value = ""; setVideoError(null); setHasAnalyzed(false); }}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || isAnalyzingVideo || isPolling}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
                {videoFile && (
                  <span className="text-xs text-gray-300 truncate max-w-[calc(50%-4rem)]">
                    {videoFile.name} • {(videoFile.size / (1024*1024)).toFixed(1)} MB
                  </span>
                )}
                <Button
                  type="button"
                  onClick={() => startVideoAnalysis(inputMessage)}
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={isLoading || isAnalyzingVideo || !videoFile || hasAnalyzed || isPolling}
                >
                  {isAnalyzingVideo ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Start Analysis
                </Button>
                {videoError && <div className="text-xs text-red-400 basis-full">{videoError}</div>}
                <span className="text-xs text-gray-400 basis-full">
                  Supported: MP4, MOV, WEBM, MKV • Max 200MB
                </span>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleInputSendMessage(); }}
              className="flex items-center gap-2 bg-zinc-800/30 border border-zinc-700/80 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-purple-500/70 transition-all duration-300"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-10 h-10 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 flex-shrink-0 rounded-lg"
                disabled={isInputDisabled}
              >
                <Mic className="w-5 h-5" />
              </Button>

              <Input
                ref={inputRef}
                value={activeSpecializedTool === 'analyze_video' ? videoPrompt : inputMessage}
                onChange={onInputChange}
                onKeyDown={handleKeyDown}
                onKeyPress={handleKeyPress}
                placeholder={
                  getActiveToolConfig()?.placeholder || (isInputDisabled ? "Input disabled" : (useMikkiAsDefault ? "Type your message... (try /)" : "Drop an audio file or select an AI to enable input..."))
                }
                className="flex-1 h-full bg-transparent border-none text-white placeholder-gray-400 px-2 focus:ring-0 focus:ring-offset-0 text-sm"
                disabled={isInputDisabled} />


              <Button
                type="submit"
                disabled={isSendButtonDisabled}
                className="w-10 h-10 bg-zinc-900/80 hover:bg-zinc-900 text-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center">

                {isLoading ?
                  <Loader2 className="w-5 h-5 animate-spin" /> :

                  <Send className="w-5 h-5" />
                }
              </Button>
            </form>

            {!activeSpecializedTool &&
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-center text-white/60 text-xs sm:text-sm mr-2">Respond with:</span>
                {visibleAssistants.map((a) => {
                  const Icon = iconMap[a.icon] || Bot;

                  return (
                    <Button
                      key={a.assistant_id}
                      onClick={() => handleAIResponse(a, messages, activeConversationId)}
                      disabled={isInputDisabled}
                      variant="outline"
                      className={`
                        px-3 py-1.5 h-auto rounded-lg text-xs font-semibold transition-all duration-300
                        backdrop-blur-xl border text-white/80
                        bg-black/40 border-white/20
                        hover:bg-white/10 hover:text-white
                        disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed
                      `}>
                      <Icon className="w-3.5 h-3.5 mr-1.5" />
                      {a.name}
                    </Button>);
                })}
              </div>
            }

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {[
                { key: 'analyze_track', icon: '🎧', label: 'Analyze Track' },
                { key: 'mix_comparison', icon: '⚖️', label: 'Compare Mix' },
                { key: 'generate_chords', icon: '🎹', label: 'Chords' },
                { key: 'create_hooks', icon: '🎯', label: 'Hooks' },
                { key: 'brain_dump', icon: '🧠', label: 'Brain Dump' },
                { key: 'script_generator', icon: '📋', label: 'Script' },
                { key: 'analyze_video', icon: '🎥', label: 'Video' },
              ].map(tool => (
                <button
                  key={tool.key}
                  onClick={() => handleToolToggle(tool.key)}
                  disabled={isLoading || isComparing || isAnalyzingVideo || isPolling}
                  className={`px-3 py-1.5 rounded-lg border transition-all duration-200 flex items-center justify-center text-xs disabled:opacity-50 ${getToolColorClasses(tool.key)}`}
                  title={tool.label}
                >
                  <span className="mr-1.5">{tool.icon}</span> {tool.label}
                </button>
              ))}

              <div className="w-px h-6 bg-white/20 mx-2"></div>

              <button
                disabled={true}
                className="px-3 py-1.5 rounded-lg border bg-green-500/5 border-green-400/20 text-green-300/50 transition-all duration-200 flex items-center justify-center text-xs cursor-not-allowed"
                title="Brand Tools (Coming Soon)">
                <span className="mr-1.5">🎨</span> Brand
              </button>
            </div>
          </div>
        }
      </div>
    </>);

}
