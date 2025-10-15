
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User as UserIcon, Loader2, Sparkles, X, Minimize2, ArrowLeft, List, Target, Music, GitCompare, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AudioFile } from '@/api/entities';
import { ChatSession } from '@/api/entities';
import { ChatMessage } from '@/api/entities';
import { User } from '@/api/entities';
import { MixComparisons } from '@/api/entities';
import { koeRagChatbot } from '@/api/functions';
import ChatSessionManager from './ChatSessionManager';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { UploadFile } from '@/api/integrations';
import { analyzeAudio } from '@/api/functions';
import ContextSelectorModal from './ContextSelectorModal';

export default function KoeChatbotWithSessions({
  isOpen = true,
  onClose,
  onMinimize,
  isEmbedded = false,
  className = "",
  hideSessionHeader = false,
  onBackToWelcome,
  preSelectedSession = null,
  initialMessage = null,
  linkedAnalysisId = null, // ADDED PROP
  linkedComparisonId = null // ADDED PROP
}) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('sessions');
  const [currentSession, setCurrentSession] = useState(preSelectedSession);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState(initialMessage || '');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisContext, setAnalysisContext] = useState(null);
  const [comparisonContext, setComparisonContext] = useState(null);
  const [showContextSelector, setShowContextSelector] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const [messageOrderCounter, setMessageOrderCounter] = useState(1);

  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [sessions, setSessions] = useState([]);

  // CIRCUIT BREAKER STATE
  const [circuitBreakerState, setCircuitBreakerState] = useState({
    failures: 0,
    lastFailureTime: null,
    isOpen: false,
    nextRetryTime: null
  });
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  // Circuit breaker constants
  const MAX_FAILURES = 3;
  const CIRCUIT_OPEN_TIME = 30000; // 30 seconds
  const INITIAL_RETRY_DELAY = 1000; // 1 second
  const MAX_RETRY_DELAY = 10000; // 10 seconds

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      requestAnimationFrame(() => {
        const { scrollHeight, clientHeight } = messagesContainerRef.current;
        messagesContainerRef.current.scrollTo({
          top: scrollHeight - clientHeight,
          behavior: 'smooth'
        });
      });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 150);
    return () => clearTimeout(timeoutId);
  }, [messages, isAnalyzingFile, isUploadingImage]);

  // Circuit breaker helper functions
  const isCircuitOpen = useCallback(() => {
    if (!circuitBreakerState.isOpen) return false;

    if (Date.now() > circuitBreakerState.nextRetryTime) {
      // Circuit breaker timeout expired, allow next attempt (half-open state effectively)
      console.log('[Circuit Breaker] Half-open state: allowing next request after timeout.');
      setCircuitBreakerState(prev => ({
        ...prev,
        isOpen: false, // Allows one attempt, if it fails, it goes back to full open. If succeeds, resets to closed.
        failures: 0 // Reset failures for this half-open attempt
      }));
      return false;
    }

    console.log(`[Circuit Breaker] Circuit is open. Blocking request. Retrying in ${Math.ceil((circuitBreakerState.nextRetryTime - Date.now()) / 1000)}s.`);
    return true;
  }, [circuitBreakerState]);

  const recordFailure = useCallback((error) => {
    const isRateLimited = error.message?.includes('429') || error.response?.status === 429;

    setCircuitBreakerState(prev => {
      const newFailures = prev.failures + 1;
      const shouldOpenCircuit = newFailures >= MAX_FAILURES || isRateLimited;

      let retryDelay = INITIAL_RETRY_DELAY;
      if (isRateLimited) {
        // Exponential backoff for rate limiting
        retryDelay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, newFailures), MAX_RETRY_DELAY);
      }

      console.log(`[Circuit Breaker] Failure ${newFailures}/${MAX_FAILURES}, isRateLimited: ${isRateLimited}, shouldOpen: ${shouldOpenCircuit}, nextRetry in ${retryDelay / 1000}s`);

      return {
        failures: newFailures,
        lastFailureTime: Date.now(),
        isOpen: shouldOpenCircuit,
        nextRetryTime: shouldOpenCircuit ? Date.now() + (isRateLimited ? retryDelay : CIRCUIT_OPEN_TIME) : null
      };
    });
  }, []);

  const recordSuccess = useCallback(() => {
    if (circuitBreakerState.failures > 0 || circuitBreakerState.isOpen) {
      console.log('[Circuit Breaker] Success recorded. Resetting circuit.');
    }
    setCircuitBreakerState({
      failures: 0,
      lastFailureTime: null,
      isOpen: false,
      nextRetryTime: null
    });
  }, [circuitBreakerState]);

  const loadSessions = useCallback(async () => {
    try {
      const user = await User.me();
      if (!user) {
        console.log('No user found for loading sessions.');
        setSessions([]);
        recordSuccess(); // No user isn't an API failure, it's just no sessions.
        return;
      }

      console.log(`[KoeChatbotWithSessions] Loading sessions for user email: ${user.email}`);
      // FIX: Use created_by (user's email) instead of user_id
      const userFilteredSessions = await ChatSession.filter({ created_by: user.email }, '-updated_date');
      const validSessions = userFilteredSessions.filter(session => {
        try {
          return session && session.id && session.name && session.created_date;
        } catch (validationError) {
          console.warn('Filtering out corrupted session:', session?.id, validationError.message);
          return false;
        }
      });

      console.log(`[KoeChatbotWithSessions] Found ${validSessions.length} valid sessions`);
      setSessions(validSessions);
      recordSuccess(); // Record successful API call

    } catch (error) {
      console.error('Error loading sessions:', error);
      recordFailure(error);
      setSessions([]);
      throw error; // Re-throw to handle in caller if needed for higher-level error messages
    }
  }, [recordSuccess, recordFailure]);

  // Helper to get the next message order for saving to DB
  const getNextMessageOrder = useCallback(async (sessionId) => {
    try {
      const latestMessage = await ChatMessage.filter(
        { chat_session_id: sessionId },
        '-message_order', // order by message_order descending
        1 // limit to 1
      );
      // If no messages, start with 1. Otherwise, increment the latest order.
      return latestMessage.length > 0 ? (latestMessage[0].message_order || 0) + 1 : 1;
    } catch (error) {
      console.error("Error getting next message order:", error);
      // Fallback to a simple increment if DB fetch fails, to ensure unique order for display and subsequent saves
      return (messages.length * 2) + 1; // Arbitrary value to make it distinct and large
    }
  }, [messages]);

  const sendMessage = useCallback(async (overrideMessage = null) => {
    const msgToSend = overrideMessage || inputMessage;
    if (!msgToSend.trim() || isLoading || isAnalyzingFile || isUploadingImage) return;

    if (isCircuitOpen()) {
      console.log('[Circuit Breaker] Blocking sendMessage - circuit is open');
      const errorMessageObj = {
        id: Date.now(),
        type: 'bot',
        content: "I'm experiencing high traffic right now. Please wait a moment and try again! 🤖",
        messageType: 'text',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessageObj]);
      return;
    }

    if (!currentSession) {
      console.error("Attempted to send message without a current session.");
      const errorMessageObj = {
        id: Date.now(),
        type: 'bot',
        content: "Sorry, I need an active session to chat. Please try starting a new chat or selecting one.",
        messageType: 'text',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessageObj]);
      return;
    }

    const lastBot = [...messages].reverse().find(m => m.type === 'bot');
    const isMenu = lastBot?.messageType === 'menu';
    const isStep = lastBot?.messageType === 'step';
    const isConfirmation = lastBot?.messageType === 'confirmation'; // Added for confirmation
    const isDiscovery = lastBot?.messageType === 'discovery'; // Added for discovery
    const isNumeric = /^\s*[1-4]\s*$/.test(msgToSend);

    let payloadMessage = msgToSend;
    let userAction = null;

    if (isNumeric && isMenu) {
      userAction = { type: 'menu_select', value: Number(msgToSend.trim()) };
    }
    if (isNumeric && isStep) {
      userAction = { type: 'step_action', value: Number(msgToSend.trim()) };
    }
    // Handle confirmation responses
    if (isConfirmation && (msgToSend === 'Confirm' || msgToSend === 'Suggest another approach' || msgToSend === 'Different sound please')) {
      userAction = { type: 'confirmation_response', value: msgToSend };
    }
    // Discovery responses typically act as new messages, not structured actions, unless specified
    // So no explicit userAction for isDiscovery here, unless quick replies need special handling
    // which the backend should pick up from lastMessageType.

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: msgToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    setInputMessage('');
    setIsLoading(true);

    try {
      let sessionToUse = currentSession;
      if (!currentSession.id || !currentSession.session_state ||
        (isStep && (!currentSession.recipe_id || !currentSession.daw || !currentSession.session_state.ui_mode))) {

        try {
          const freshSession = await ChatSession.get(currentSession.id);
          if (freshSession) {
            sessionToUse = freshSession;
            setCurrentSession(freshSession); // Update currentSession state
            recordSuccess(); // ChatSession.get success
          }
        } catch (refetchError) {
          console.error('[SEND] Failed to refetch session:', refetchError);
          recordFailure(refetchError); // ChatSession.get failed
        }
      }

      const userMessageOrder = await getNextMessageOrder(sessionToUse.id); // Use getNextMessageOrder for user message
      setMessageOrderCounter(userMessageOrder + 1); // Update for frontend consistency

      // DEFENSIVE: Try to create user message with error handling
      try {
        await ChatMessage.create({
          chat_session_id: sessionToUse.id,
          sender: 'user',
          content: msgToSend,
          message_order: userMessageOrder
        });
        recordSuccess(); // ChatMessage.create success
      } catch (msgError) {
        console.error('[SEND] Failed to create user message:', msgError);
        recordFailure(msgError);
        // Continue anyway - we'll try to save the bot response
      }

      const conversationHistory = [...messages, userMessage].slice(-4).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      }));

      const recentMessages = [...messages, userMessage].filter(Boolean).slice(-4);
      const recentImageUrls = recentMessages
        .filter(msg => msg.type === 'user' && msg.imageUrl)
        .map(msg => msg.imageUrl);

      const sessionContext = {
        sessionId: sessionToUse.id || null,
        name: sessionToUse.name || null,
        project_objective: sessionToUse.project_objective || null,
        genre: sessionToUse.genre || null,
        current_mode: sessionToUse.current_mode || null,
        recipe_id: sessionToUse.recipe_id || null,
        current_step_number: sessionToUse.current_step_number || 0,
        daw: sessionToUse.daw || currentUser?.preferred_daw || null,
        last_buttons: Array.isArray(sessionToUse.last_buttons) ? sessionToUse.last_buttons : [], // Typo fixed here
        linked_analysis_id: sessionToUse.linked_analysis_id || null,
        linked_comparison_id: sessionToUse.linked_comparison_id || null, // FIX: Typo sessionToToUse -> sessionToUse
        session_state: {
          ui_mode: sessionToUse.session_state?.ui_mode || null,
          kb_cache: Array.isArray(sessionToUse.session_state?.kb_cache) ? sessionToUse.session_state.kb_cache : [],
          kb_cache_updated: sessionToUse.session_state?.kb_cache_updated || null,
          kb_hits: sessionToUse.session_state?.kb_hits || 0,
          kb_misses: sessionToUse.session_state?.kb_misses || 0,
          json_repairs: sessionToUse.session_state?.json_repairs || 0,
          stuck_events: sessionToUse.session_state?.stuck_events || 0,
          kb_cache_topic: sessionToUse.session_state?.kb_cache_topic || null,
          discovery_count: sessionToUse.session_state?.discovery_count || 0, // Added
          last_topic: sessionToUse.session_state?.last_topic || null, // Added
          topic_changes: sessionToUse.session_state?.topic_changes || 0 // Added
        }
      };

      let sessionAnalysisContext = null;
      if (sessionToUse.linked_analysis_id) {
        try {
          const linkedAnalysis = await AudioFile.get(sessionToUse.linked_analysis_id);
          if (linkedAnalysis && linkedAnalysis.analysis_status === 'completed') {
            sessionAnalysisContext = {
              filename: linkedAnalysis.filename,
              koe_summary: linkedAnalysis.koe_summary,
              analysis_result: linkedAnalysis.analysis_result
            };
          }
          recordSuccess(); // AudioFile.get success
        } catch (err) {
          console.error('Failed to load linked analysis for session:', err);
          recordFailure(err); // AudioFile.get failed
        }
      }

      let sessionComparisonContext = null;
      if (sessionToUse.linked_comparison_id) {
        try {
          const linkedComparison = await MixComparisons.get(sessionToUse.linked_comparison_id);
          if (linkedComparison && linkedComparison.status === 'completed') {
            sessionComparisonContext = linkedComparison;
          }
          recordSuccess(); // MixComparisons.get success
        } catch (error) {
          console.log('Could not load comparison context:', error);
          recordFailure(error); // MixComparisons.get failed
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      let response;
      try {
        response = await koeRagChatbot({
          message: payloadMessage,
          userAction: userAction,
          lastMessageType: lastBot?.messageType,
          lastOptions: lastBot?.content?.options || null,
          conversationHistory: conversationHistory,
          sessionContext: sessionContext,
          userSkillLevel: currentUser?.music_journey_stage || 'intermediate',
          analysisContext: sessionAnalysisContext,
          comparisonContext: sessionComparisonContext,
          imageUrls: recentImageUrls.length > 0 ? recentImageUrls : null
        }, { signal: controller.signal });
        recordSuccess(); // koeRagChatbot success
        clearTimeout(timeoutId);
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.error('[KOE] Request timeout after 12 seconds');
          throw new Error('Request timed out - please try again');
        }
        throw error;
      }

      if (response && response.data && response.data.success) {
        let botMessageContent;
        let messageType = 'text';

        if (response.data.response && typeof response.data.response === 'object' && response.data.response.type) {
          botMessageContent = response.data.response;
          messageType = response.data.response.type;
        } else {
          botMessageContent = response.data.response || 'No response received';
          messageType = 'text';
        }

        // Proper content normalization for all message types
        const uiContent = (() => {
          if (messageType === 'text') {
            return typeof botMessageContent === 'object'
              ? (botMessageContent.message || JSON.stringify(botMessageContent))
              : String(botMessageContent);
          } else {
            // For structured types (menu, discovery, confirmation, step), keep the full object
            return botMessageContent;
          }
        })();

        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: uiContent, // Now properly normalized for UI
          messageType: messageType,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);

        // Save full JSON back-end for persistence (keep original structure)
        const contentToSave =
          typeof botMessageContent === 'object' ? JSON.stringify(botMessageContent) : String(botMessageContent);

        const botMessageOrder = await getNextMessageOrder(sessionToUse.id); // Get order for bot message
        setMessageOrderCounter(botMessageOrder + 1); // Update for frontend consistency

        // DEFENSIVE: Try to create bot message with error handling
        try {
          await ChatMessage.create({
            chat_session_id: sessionToUse.id,
            sender: 'bot',
            content: contentToSave,
            message_order: botMessageOrder
          });
          recordSuccess(); // ChatMessage.create success
        } catch (msgError) {
          console.error('[SEND] Failed to create bot message:', msgError);
          recordFailure(msgError);
          // Continue anyway - message is shown in UI
        }

        // DEFENSIVE: Try to update session with comprehensive error handling
        try {
          await ChatSession.update(sessionToUse.id, {
            last_message_at: new Date().toISOString(),
            message_count: botMessageOrder
          });
          recordSuccess(); // ChatSession.update success
        } catch (sessionUpdateError) {
          console.error('[SEND] Failed to update ChatSession:', sessionUpdateError);
          recordFailure(sessionUpdateError);

          // Check if session still exists
          try {
            const sessionCheck = await ChatSession.get(sessionToUse.id);
            if (!sessionCheck) {
              console.error('[SEND] Session no longer exists, attempting to create new session');
              // Session doesn't exist - we should create a new one
              const user = currentUser || await User.me(); // Try to get user if not already available
              if (user) {
                const newSession = await ChatSession.create({
                  name: sessionToUse.name || 'Recovered Session',
                  project_objective: sessionToUse.project_objective || 'optimizing_current_track',
                  genre: sessionToUse.genre || 'electronic',
                  linked_analysis_id: sessionToUse.linked_analysis_id || null,
                  linked_comparison_id: sessionToUse.linked_comparison_id || null,
                  daw: sessionToUse.daw || user?.preferred_daw || null,
                  created_by: user.email // Ensure created_by is set for new session
                });
                setCurrentSession(newSession);
                recordSuccess();
                console.log('[SEND] Created new session:', newSession.id);
              } else {
                console.error('[SEND] User not available, cannot create new session after update failure.');
              }
            } else {
              console.log('[SEND] Session still exists, but update failed. Will continue.');
            }
          } catch (sessionCheckError) {
            console.error('[SEND] Session recovery attempt failed:', sessionCheckError);
            recordFailure(sessionCheckError);
            // At this point, we'll continue with the current session object
            // The user can start a new chat if needed
          }
        }

        // DEFENSIVE: Try to refresh session state with error handling
        try {
          const freshSession = await ChatSession.get(sessionToUse.id);
          if (freshSession) {
            setCurrentSession(freshSession);
            recordSuccess(); // ChatSession.get success
          }
        } catch (err) {
          console.error('Failed to refresh session state:', err);
          recordFailure(err);
          // Continue without refreshing - not critical for user experience
        }
      } else {
        throw new Error(response?.data?.error || 'Failed to get response from KOE');
      }
      recordSuccess(); // Overall sendMessage success
    } catch (error) {
      console.error('Chat error:', error);
      recordFailure(error); // Record failure for circuit breaker

      let errorMessage = 'Sorry, I encountered an error. Please try again.';

      if (error.response && error.response.status === 429) {
        errorMessage = 'Whoa, slow down there! I\'m getting hammered with requests. Try again in a moment!😅';
      } else if (error.response && error.response.data) {
        const backendError = error.response.data;
        if (backendError.error) {
          errorMessage = backendError.error;
        }
      } else if (error.message) {
        if (error.message.includes('timeout')) {
          errorMessage = 'I\'m taking longer than usual to respond. Please try again with a shorter message. 🤖';
        } else if (error.message.includes('503')) {
          errorMessage = 'I\'m pretty swamped right now! Give me like 30 seconds and try again. Even AI needs coffee breaks! ☕';
        } else if (error.message.includes('502')) {
          errorMessage = 'My brain had a hiccup! Try again in a few seconds - should be good to go! 🧠';
        } else if (error.message.includes('500') || error.message.includes('network')) {
          errorMessage = 'Something went wrong on my end. Try again in a few seconds! 🔧';
        }
      }

      const errorMessageObj = {
        id: Date.now() + 1,
        type: 'bot',
        content: errorMessage,
        messageType: 'text',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessageObj]);
      setInputMessage(msgToSend);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, isAnalyzingFile, isUploadingImage, currentSession, messages, currentUser, isCircuitOpen, recordSuccess, recordFailure, getNextMessageOrder]);

  const handleQuickReply = useCallback((replyContent) => {
    sendMessage(replyContent);
  }, [sendMessage]);

  // Handle select session and message loading
  const handleSelectSession = useCallback(async (session) => {
    try {
      if (!session || !session.id) {
        console.error('Invalid session passed to handleSelectSession:', session);
        return;
      }

      setCurrentSession(session);
      setCurrentView('chat');

      try {
        if (session.linked_analysis_id) {
          const linkedAnalysis = await AudioFile.get(session.linked_analysis_id);
          if (linkedAnalysis && linkedAnalysis.analysis_status === 'completed') {
            setAnalysisContext(linkedAnalysis);
            setComparisonContext(null);
          }
          recordSuccess(); // AudioFile.get success
        } else if (session.linked_comparison_id) {
          const linkedComparison = await MixComparisons.get(session.linked_comparison_id);
          if (linkedComparison && linkedComparison.status === 'completed') {
            setComparisonContext(linkedComparison);
            setAnalysisContext(null);
          }
          recordSuccess(); // MixComparisons.get success
        } else {
          setAnalysisContext(null);
          setComparisonContext(null);
        }
      } catch (contextError) {
        console.warn('Failed to load session context:', contextError);
        recordFailure(contextError); // Context loading failed
        setAnalysisContext(null);
        setComparisonContext(null);
      }

      try {
        const sessionMessages = await ChatMessage.filter({ chat_session_id: session.id }, 'message_order');
        recordSuccess(); // ChatMessage.filter success

        const maxOrder = sessionMessages.length > 0
          ? Math.max(...sessionMessages.map(m => m.message_order || 0))
          : 0;
        setMessageOrderCounter(maxOrder + 1);

        const formattedMessages = sessionMessages
          .filter(msg => msg && msg.id)
          .map(msg => {
            try {
              let content;
              let messageType = 'text';

              if (typeof msg.content === 'string') {
                try {
                  const parsedContent = JSON.parse(msg.content);
                  if (parsedContent && parsedContent.type) {
                    // Properly handle all structured message types
                    if (['text', 'menu', 'step', 'confirmation', 'discovery'].includes(parsedContent.type)) {
                      messageType = parsedContent.type;
                      content = parsedContent; // Keep full object for structured types
                    } else {
                      // Unknown typed payload: fallback to string
                      messageType = 'text';
                      content = msg.content;
                    }
                  } else {
                    // Not a typed JSON payload
                    content = msg.content;
                    messageType = 'text';
                  }
                } catch {
                  // Not JSON, keep as plain text
                  content = msg.content;
                  messageType = 'text';
                }
              } else if (typeof msg.content === 'object' && msg.content?.type) {
                // Already an object with type
                if (['text', 'menu', 'step', 'confirmation', 'discovery'].includes(msg.content.type)) {
                  messageType = msg.content.type;
                  content = msg.content;
                } else {
                  messageType = 'text';
                  content = msg.content.message || JSON.stringify(msg.content);
                }
              } else {
                content = String(msg.content || '');
                messageType = 'text';
              }

              return {
                id: msg.id,
                type: msg.sender || 'bot',
                content: content,
                messageType: messageType,
                timestamp: new Date(msg.created_date || Date.now())
              };
            } catch (msgError) {
              console.warn('Error formatting individual message:', msg?.id, msgError.message);
              return {
                id: msg?.id || `corrupted-${Date.now()}`,
                type: 'bot',
                content: 'Error: This message could not be loaded due to corruption.',
                messageType: 'text',
                timestamp: new Date()
              };
            }
          });

        setMessages(formattedMessages);
        setTimeout(() => inputRef.current?.focus(), 100);
      } catch (error) {
        console.error('Error loading session messages:', error);
        recordFailure(error); // ChatMessage.filter failed
        setMessages([]);
        setMessageOrderCounter(1);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      recordSuccess(); // Overall handleSelectSession success
    } catch (error) {
      console.error('Error in handleSelectSession outer try-catch:', error);
      recordFailure(error); // Outer error
    }
  }, [inputRef, setMessages, setMessageOrderCounter, setAnalysisContext, setComparisonContext, setCurrentSession, setCurrentView, recordSuccess, recordFailure]);

  // Handle preSelectedSession
  useEffect(() => {
    if (preSelectedSession && !currentSession) {
      handleSelectSession(preSelectedSession);
    }
  }, [preSelectedSession, handleSelectSession, currentSession]);

  const initializeNewChat = useCallback(async (objective = 'optimizing_current_track', genre = 'electronic', firstMessage = null) => {
    if (isCircuitOpen()) {
      console.log('[Circuit Breaker] Blocking initializeNewChat - circuit is open');
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: "I'm experiencing high traffic right now. Please wait a moment and try again! 🤖",
        messageType: 'text',
        timestamp: new Date()
      };
      setMessages([errorMessage]);
      return;
    }

    try {
      let user = currentUser;
      if (!user) {
        try {
          user = await User.me();
          setCurrentUser(user);
          recordSuccess(); // User.me() success
        } catch (error) {
          console.error('Failed to fetch user for chat initialization:', error);
          recordFailure(error); // User.me() failed
          const errorMessage = {
            id: Date.now(),
            type: 'bot',
            content: "I had trouble loading your profile. Please refresh the page and try again! 🤖",
            messageType: 'text',
            timestamp: new Date()
          };
          setMessages([errorMessage]);
          return;
        }
      }

      if (!user) {
        const errorMessage = {
          id: Date.now(),
          type: 'bot',
          content: "Authentication required. Please log in and try again! 🤖",
          messageType: 'text',
          timestamp: new Date()
        };
        setMessages([errorMessage]);
        return;
      }

      if (typeof objective !== 'string' || !objective.trim()) {
        console.warn('Invalid or missing objective, using default');
        objective = 'optimizing_current_track';
      }

      if (typeof genre !== 'string' || !genre.trim()) {
        console.warn('Invalid or missing genre, using default');
        genre = 'electronic';
      }

      const sessionName = firstMessage
        ? `Chat: ${firstMessage.substring(0, 30)}${firstMessage.length > 30 ? '...' : ''}`
        : `New KOE Session`;

      const newSession = await ChatSession.create({
        name: sessionName,
        project_objective: objective,
        genre: user?.music_genre || genre,
        linked_analysis_id: null,
        linked_comparison_id: null,
        daw: user?.preferred_daw || null, // Set DAW from user preferences
        created_by: user.email // Ensure created_by is set for new session
      });
      recordSuccess(); // ChatSession.create success

      console.log(`[KoeChatbotWithSessions] Created new session: ${newSession.id}`);

      setCurrentSession(newSession);
      setCurrentView('chat');
      setMessages([]);
      // setMessageOrderCounter(1); // Will be set by actual first message

      setAnalysisContext(null);
      setComparisonContext(null);

      // Load sessions without blocking, but catch error. Circuit breaker in loadSessions will handle it.
      try {
        await loadSessions();
      } catch (sessionError) {
        console.warn('Failed to load sessions after creating new chat:', sessionError);
        // Don't block the chat creation if session loading fails, circuit breaker will manage.
      }

      // If user provided a first message, send it; otherwise request initial menu
      if (firstMessage) {
        setTimeout(() => {
          sendMessage(firstMessage);
        }, 50);
        return;
      }

      const response = await koeRagChatbot({
        message: '__INITIALIZE_MENU__',
        userAction: null,
        lastMessageType: null,
        lastOptions: null,
        conversationHistory: [],
        sessionContext: {
          sessionId: newSession.id || null,
          name: newSession.name || null,
          project_objective: newSession.project_objective || null,
          genre: newSession.genre || null,
          current_mode: newSession.current_mode || null,
          recipe_id: newSession.recipe_id || null,
          current_step_number: newSession.current_step_number || 0,
          daw: newSession.daw || null, // Use the DAW set during session creation
          last_buttons: newSession.last_buttons || [],
          linked_analysis_id: newSession.linked_analysis_id || null,
          linked_comparison_id: newSession.linked_comparison_id || null,
          session_state: {
            ui_mode: null,
            kb_cache: [],
            kb_cache_updated: null,
            kb_hits: 0,
            kb_misses: 0,
            json_repairs: 0,
            stuck_events: 0,
            kb_cache_topic: null,
            discovery_count: 0, // Added
            last_topic: null, // Added
            topic_changes: 0 // Added
          }
        },
        userSkillLevel: user?.music_journey_stage || 'intermediate',
        analysisContext: null,
        comparisonContext: null,
        imageUrls: null
      });
      recordSuccess(); // koeRagChatbot success

      if (response?.data?.success && response.data.response?.type === 'menu') {
        const initialMenuMessage = {
          id: Date.now(),
          type: 'bot',
          content: response.data.response,
          messageType: 'menu',
          timestamp: new Date()
        };

        setMessages([initialMenuMessage]);

        const contentToSave = JSON.stringify(response.data.response);
        const nextOrder = await getNextMessageOrder(newSession.id); // Use getNextMessageOrder here
        await ChatMessage.create({
          chat_session_id: newSession.id,
          sender: 'bot',
          content: contentToSave,
          message_order: nextOrder
        });
        recordSuccess(); // ChatMessage.create success

        setMessageOrderCounter(nextOrder + 1); // Update counter based on actual next order

        await ChatSession.update(newSession.id, {
          last_message_at: new Date().toISOString(),
          message_count: nextOrder, // Use nextOrder for message_count
          ...(response.data.session_state && {
            current_mode: response.data.session_state.current_mode,
            recipe_id: response.data.session_state.recipe_id,
            current_step_number: response.data.session_state.current_step_number,
            daw: response.data.session_state.daw,
            last_buttons: response.data.session_state.last_buttons,
            session_state: {
              ui_mode: response.data.session_state.ui_mode || null,
              discovery_count: response.data.session_state.discovery_count || 0, // Added
              last_topic: response.data.session_state.last_topic || null, // Added
              topic_changes: response.data.session_state.topic_changes || 0 // Added
            }
          })
        });
        recordSuccess(); // ChatSession.update success

        try {
          const freshSession = await ChatSession.get(newSession.id);
          setCurrentSession(freshSession);
          recordSuccess(); // ChatSession.get success
        } catch (err) {
          console.error('Failed to refresh initial session state:', err);
          recordFailure(err); // ChatSession.get failed
        }
      } else {
        throw new Error('Failed to load initial menu from backend or response not a menu type');
      }
      recordSuccess(); // Overall initializeNewChat success

      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (error) {
      console.error('Error initializing chat:', error);
      recordFailure(error); // Overall initialization failed
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: "Sorry, I had trouble setting up our chat session. Please try again in a moment! 🤖",
        messageType: 'text',
        timestamp: new Date()
      };
      setMessages([errorMessage]);
    }
  }, [currentUser, loadSessions, sendMessage, inputRef, setCurrentSession, setCurrentView, setMessages, setAnalysisContext, setComparisonContext, isCircuitOpen, recordSuccess, recordFailure, getNextMessageOrder]);

  // NEW: Function to load roast content
  const loadRoastContent = useCallback(async (sessionToUse = null) => {
    const session = sessionToUse || currentSession;

    if (!session?.id) {
      console.warn('Cannot load roast content: No session provided.', { sessionToUse, currentSession: currentSession?.id });
      return;
    }

    console.log('Loading roast content for session:', session.id, { linkedAnalysisId, linkedComparisonId });

    try {
      let roastContent = null;
      let associatedEntity = null;
      let roastType = '';

      if (linkedAnalysisId) {
        console.log('Loading analysis roast content for ID:', linkedAnalysisId);
        try {
          const analyses = await AudioFile.filter({ id: linkedAnalysisId });
          recordSuccess();
          associatedEntity = analyses?.[0];

          if (associatedEntity?.koe_summary) {
            roastContent = associatedEntity.koe_summary;
            roastType = 'analysis';
            console.log('✅ Loaded analysis roast content:', roastContent.substring(0, 100) + '...');
          } else if (associatedEntity?.analysis_status === 'completed' && associatedEntity?.analysis_result) {
            // If no koe_summary but analysis is complete, we might need to generate it
            console.log('⚠️ Analysis complete but no koe_summary found. Analysis result exists.');
            roastContent = `Hey! I've got your analysis results for "${associatedEntity.filename}" but it looks like I haven't given you the full roast treatment yet. Let me dig into this track and give you some real feedback! 🔥`;
            roastType = 'analysis';
          } else {
            console.warn('❌ No koe_summary found or analysis not completed for ID:', linkedAnalysisId, 'Status:', associatedEntity?.analysis_status);
          }
        } catch (error) {
          console.error('Error loading analysis:', error);
          recordFailure(error);
        }
      } else if (linkedComparisonId) {
        console.log('Loading comparison roast content for ID:', linkedComparisonId);
        try {
          const comparisons = await MixComparisons.filter({ id: linkedComparisonId });
          recordSuccess();
          associatedEntity = comparisons?.[0];

          if (associatedEntity?.koe_comparison_summary) {
            roastContent = associatedEntity.koe_comparison_summary;
            roastType = 'comparison';
            console.log('✅ Loaded comparison roast content:', roastContent.substring(0, 100) + '...');
          } else if (associatedEntity?.status === 'completed') {
            console.log('⚠️ Comparison complete but no koe_comparison_summary found.');
            roastContent = `Alright, I've analyzed your comparison between "${associatedEntity.filenameA}" and "${associatedEntity.filenameB}" but it seems I haven't given you the full breakdown yet. Let me dive into these tracks and tell you what's really going on! 🔥`;
            roastType = 'comparison';
          } else {
            console.warn('❌ No koe_comparison_summary found or comparison not completed for ID:', linkedComparisonId, 'Status:', associatedEntity?.status);
          }
        } catch (error) {
          console.error('Error loading comparison:', error);
          recordFailure(error);
        }
      }

      if (roastContent) {
        // Add roast message to chat UI immediately
        const roastMessage = {
          id: `roast-${Date.now()}`,
          type: 'bot',
          content: roastContent,
          messageType: 'text',
          timestamp: new Date()
        };

        console.log('💬 Adding roast message to UI:', roastMessage);
        setMessages(prev => [...prev, roastMessage]);

        // Save the roast message to the database
        try {
          const nextOrder = await getNextMessageOrder(session.id);
          await ChatMessage.create({
            chat_session_id: session.id,
            sender: 'bot',
            content: roastContent,
            message_order: nextOrder
          });
          recordSuccess();

          // Update session timestamp and message count
          await ChatSession.update(session.id, {
            last_message_at: new Date().toISOString(),
            message_count: nextOrder
          });
          recordSuccess();
          setMessageOrderCounter(nextOrder + 1);
        } catch (saveError) {
          console.error('Failed to save roast message:', saveError);
          recordFailure(saveError);
        }

        // Set context if it's not already set
        if (roastType === 'analysis' && !analysisContext) {
          setAnalysisContext(associatedEntity);
          console.log('🎯 Set analysis context for future chat:', associatedEntity?.filename);
        } else if (roastType === 'comparison' && !comparisonContext) {
          setComparisonContext(associatedEntity);
          console.log('🎯 Set comparison context for future chat:', associatedEntity?.filenameA, 'vs', associatedEntity?.filenameB);
        }
      } else {
        // If no roast content available, show fallback message
        const fallbackMessage = {
          id: `fallback-${Date.now()}`,
          type: 'bot',
          content: linkedAnalysisId
            ? "I couldn't find a roast for this analysis. The analysis might still be processing, or there was an issue generating the feedback. Try uploading the track again or ask me specific questions about your mix!"
            : "I couldn't find a roast for this comparison. The comparison might still be processing, or there was an issue generating the feedback. Try running the comparison again!",
          messageType: 'text',
          timestamp: new Date()
        };

        console.log('⚠️ Using fallback message:', fallbackMessage.content);
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error('❌ Error loading roast content:', error);
      recordFailure(error);

      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'bot',
        content: "Sorry, I had trouble loading your roast. This might be a temporary issue. Try refreshing the page or ask me questions about your music!",
        messageType: 'text',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [linkedAnalysisId, linkedComparisonId, currentSession, getNextMessageOrder, setMessages, recordSuccess, recordFailure, setIsLoading, analysisContext, comparisonContext, setAnalysisContext, setComparisonContext, setMessageOrderCounter]);

  // SAFE INITIALIZATION - Only run once with circuit breaker protection
  useEffect(() => {
    // Prevent multiple initialization attempts or re-entry
    if (isInitializing || initializationAttempted) {
      console.log(`[Init Effect] Skipping init: isInitializing=${isInitializing}, initializationAttempted=${initializationAttempted}`);
      return;
    }

    // If component is not open/embedded, don't initialize
    if (!isOpen && !isEmbedded) {
      console.log('[Init Effect] Skipping init: component not open/embedded.');
      return;
    }

    // Check circuit breaker state
    if (isCircuitOpen()) {
      console.log('[Init Effect] Blocking initialization - circuit is open.');
      setIsLoading(false); // Make sure UI reflects no loading
      return;
    }

    const safeInitialize = async () => {
      // Double-check flag inside async function
      if (isInitializing) return;

      console.log('[Init Effect] Starting safe initialization...');
      setIsInitializing(true); // Set to true to prevent re-entry
      setInitializationAttempted(true); // Mark that an attempt has been made

      try {
        setIsLoading(true);

        // 1. Load user first
        console.log('[Init Effect] Loading user data...');
        let user = null;
        try {
          user = await User.me();
          setCurrentUser(user);
          recordSuccess(); // Record success for User.me()
          console.log('[Init Effect] User loaded:', user ? user.email : 'No user');
        } catch (userError) {
          console.error('[Init Effect] Failed to fetch user during initialization:', userError);
          recordFailure(userError); // Record failure for User.me()
          setCurrentUser(null); // Ensure user is null on failure
          setAnalysisContext(null);
          setComparisonContext(null);
          setSessions([]);
          // Show a basic error message if user cannot be loaded
          setMessages([
            {
              id: Date.now(),
              type: 'bot',
              content: "I had trouble loading your profile. Please refresh the page and try again! 🤖",
              messageType: 'text',
              timestamp: new Date()
            }
          ]);
          setIsLoading(false);
          setIsInitializing(false);
          return; // Stop initialization if user fails
        }

        if (!user) {
          console.log('[Init Effect] No user after fetch, stopping initialization.');
          setIsLoading(false);
          setIsInitializing(false);
          return;
        }

        // 2. Load sessions (this will use the circuit breaker within loadSessions)
        console.log('[Init Effect] Loading sessions...');
        try {
          await loadSessions();
          console.log('[Init Effect] Sessions loaded.');
        } catch (sessionError) {
          console.warn('[Init Effect] Failed to load sessions during initialization:', sessionError);
          // Don't re-throw here; the circuit breaker handles recording the failure internally.
          // We just note it and continue with the rest of the init if possible.
        }

        // 3. Handle URL parameters or initialize new chat
        let handledByPreSelectedOrLinkedProps = false;

        if (preSelectedSession) {
          console.log('[Init Effect] preSelectedSession detected. Selecting session.');
          await handleSelectSession(preSelectedSession);
          // Ensure `currentSession` is updated for `loadRoastContent`
          // Note: handleSelectSession already sets currentSession.
          // If preSelectedSession has linked content, try to load its roast
          if (preSelectedSession.linked_analysis_id || preSelectedSession.linked_comparison_id) {
            await loadRoastContent(preSelectedSession);
          }
          handledByPreSelectedOrLinkedProps = true;
        } else if (linkedAnalysisId || linkedComparisonId) { // NEW LOGIC BLOCK FOR LINKED PROPS
          console.log('[Init Effect] ✨ ROAST MODE: linkedAnalysisId or linkedComparisonId detected:', { linkedAnalysisId, linkedComparisonId });
          let sessionToUse = null;

          // Try to find existing linked session
          try {
            const query = { created_by: user.email };
            if (linkedAnalysisId) query.linked_analysis_id = linkedAnalysisId;
            if (linkedComparisonId) query.linked_comparison_id = linkedComparisonId;

            const existingSessions = await ChatSession.filter(query);
            recordSuccess();

            if (existingSessions && existingSessions.length > 0) {
              sessionToUse = existingSessions[0];
              console.log('[Init Effect] 🔄 Found existing roast session:', sessionToUse.id);
            } else {
              // Create new linked session
              console.log('[Init Effect] 🆕 Creating new roast session...');
              const newSessionData = {
                name: linkedAnalysisId
                  ? `🔥 Roast: Analysis ${linkedAnalysisId.substring(0, 8)}...`
                  : `🔥 Roast: Comparison ${linkedComparisonId.substring(0, 8)}...`, // Better name
                project_objective: 'optimizing_current_track',
                genre: user?.music_genre || 'electronic',
                current_mode: linkedAnalysisId ? 1 : 2, // Mode 1 for analysis, 2 for comparison
                daw: user?.preferred_daw || null,
                ...(linkedAnalysisId && { linked_analysis_id: linkedAnalysisId }),
                ...(linkedComparisonId && { linked_comparison_id: linkedComparisonId }),
                created_by: user.email
              };

              sessionToUse = await ChatSession.create(newSessionData);
              recordSuccess();
              console.log('[Init Effect] ✅ Created new roast session:', sessionToUse.id);
            }
          } catch (sessionLinkError) {
            console.error('[Init Effect] ❌ Error handling roast session from props:', sessionLinkError);
            recordFailure(sessionLinkError);
            // Fallback to general initialization if linking fails
          }

          if (sessionToUse) {
            console.log('[Init Effect] 🎯 Setting up roast session...');
            await handleSelectSession(sessionToUse);
            // FIXED: Pass the session directly to loadRoastContent to avoid timing issues
            setTimeout(async () => {
              console.log('[Init Effect] ⏰ Loading roast content...');
              await loadRoastContent(sessionToUse);
            }, 100);
            handledByPreSelectedOrLinkedProps = true;
          }
        }


        if (!handledByPreSelectedOrLinkedProps) { // Only proceed with URL params or new chat if not handled above
          const urlParams = new URLSearchParams(window.location.search);
          const analysisId = urlParams.get('analysisId');
          const comparisonId = urlParams.get('comparisonId');

          if (analysisId) {
            console.log('[Init Effect] 🌐 URL has analysisId. Attempting to load analysis context.');
            let sessionToUse = null;
            try {
              const specificAnalysis = await AudioFile.filter({ id: analysisId, created_by: user.email });
              if (specificAnalysis.length > 0 && specificAnalysis[0].analysis_status === 'completed') {
                const analysis = specificAnalysis[0];
                setAnalysisContext(analysis); // Set context for UI and future messages
                setComparisonContext(null);
                recordSuccess(); // AudioFile.filter success

                const existingSessions = await ChatSession.filter({
                  linked_analysis_id: analysisId,
                  created_by: user.email
                });
                recordSuccess(); // ChatSession.filter success

                if (existingSessions.length > 0) {
                  sessionToUse = existingSessions[0];
                  console.log('[Init Effect] Found existing chat session for URL analysis:', sessionToUse.id);
                } else {
                  const newSession = await ChatSession.create({
                    name: `Analysis: ${analysis.filename}`,
                    project_objective: 'optimizing_current_track',
                    genre: user.music_genre || 'electronic',
                    linked_analysis_id: analysisId,
                    daw: user.preferred_daw || null, // Set DAW from user preferences
                    created_by: user.email
                  });
                  recordSuccess(); // ChatSession.create success
                  sessionToUse = newSession;
                  console.log('[Init Effect] Created new chat session for URL analysis:', sessionToUse.id);
                }

                if (sessionToUse) {
                  await handleSelectSession(sessionToUse);
                  setTimeout(async () => {
                    console.log('[Init Effect] ⏰ Loading roast content for URL analysis...');
                    await loadRoastContent(sessionToUse);
                  }, 100);
                }
                window.history.replaceState({}, '', window.location.pathname); // Clean URL
                setTimeout(() => inputRef.current?.focus(), 100);
                return; // Return here as a session has been set up via URL analysis
              }
            } catch (error) {
              console.warn('[Init Effect] Could not load specific analysis from URL, falling back:', error);
              recordFailure(error); // AudioFile or ChatSession operations failed
            }
          } else if (comparisonId) {
            console.log('[Init Effect] 🌐 URL has comparisonId. Attempting to load comparison context.');
            let sessionToUse = null;
            try {
              const specificComparison = await MixComparisons.filter({ id: comparisonId, created_by: user.email });
              if (specificComparison.length > 0 && specificComparison[0].status === 'completed') {
                const comparison = specificComparison[0];
                setComparisonContext(comparison); // Set context for UI and future messages
                setAnalysisContext(null);
                recordSuccess(); // MixComparisons.filter success

                const existingSessions = await ChatSession.filter({
                  linked_comparison_id: comparisonId,
                  created_by: user.email
                });
                recordSuccess(); // ChatSession.filter success

                if (existingSessions.length > 0) {
                  sessionToUse = existingSessions[0];
                  console.log('[Init Effect] Found existing chat session for URL comparison:', sessionToUse.id);
                } else {
                  const newSession = await ChatSession.create({
                    name: `Comparison: ${comparison.filenameA} vs ${comparison.filenameB}`,
                    project_objective: 'optimizing_current_track',
                    genre: user.music_genre || comparison.musicalStyle?.toLowerCase() || 'electronic',
                    linked_comparison_id: comparisonId,
                    daw: user.preferred_daw || null, // Set DAW from user preferences
                    created_by: user.email
                  });
                  recordSuccess(); // ChatSession.create success
                  sessionToUse = newSession;
                  console.log('[Init Effect] Created new chat session for URL comparison:', sessionToUse.id);
                }

                if (sessionToUse) {
                  await handleSelectSession(sessionToUse);
                  setTimeout(async () => {
                    console.log('[Init Effect] ⏰ Loading roast content for URL comparison...');
                    await loadRoastContent(sessionToUse);
                  }, 100);
                }
                window.history.replaceState({}, '', window.location.pathname); // Clean URL
                setTimeout(() => inputRef.current?.focus(), 100);
                return; // Return here as a session has been set up via URL comparison
              }
            } catch (error) {
              console.warn('[Init Effect] Could not load specific comparison from URL, falling back:', error);
              recordFailure(error); // MixComparisons or ChatSession operations failed
            }
          }

          // If no URL context and no preselected session and no currentSession,
          // then initialize a fresh chat with menu.
          // This is crucial: Only initialize *if* no other session/context was picked up.
          console.log('[Init Effect] 🆕 No specific session/context, initializing new chat.');
          // Use setTimeout to ensure all state updates from current render cycle complete.
          setTimeout(() => {
            initializeNewChat('optimizing_current_track', 'electronic', null);
          }, 100);
        }
        recordSuccess(); // Overall initialization success
      } catch (error) {
        console.error('[Init Effect] ❌ Safe initialization failed due to unhandled error:', error);
        recordFailure(error); // Catch any uncaught errors during the process
        setCurrentUser(null);
        setAnalysisContext(null);
        setComparisonContext(null);
        setSessions([]);
        // Show a generic user-friendly error message
        setMessages([
          {
            id: Date.now(),
            type: 'bot',
            content: "I'm experiencing some technical difficulties. Please refresh the page to try again! 🤖",
            messageType: 'text',
            timestamp: new Date()
          }
        ]);
      } finally {
        setIsLoading(false);
        setIsInitializing(false);
        console.log('[Init Effect] ✅ Safe initialization finished.');
      }
    };

    safeInitialize();
    // Dependencies are critical here. Only include dependencies that absolutely
    // require a re-run of the initialization *from scratch*.
    // The `initializationAttempted` state handles the "run once" logic.
    // `isInitializing` prevents re-entry during the current run.
    // Added `linkedAnalysisId`, `linkedComparisonId`, `getNextMessageOrder` to dependencies.
  }, [isOpen, isEmbedded, initializeNewChat, handleSelectSession, loadSessions, recordSuccess, recordFailure, isCircuitOpen, initializationAttempted, isInitializing, preSelectedSession, linkedAnalysisId, linkedComparisonId, loadRoastContent]);

  // Handle initialMessage after user is loaded - with circuit breaker protection
  useEffect(() => {
    if (initialMessage && !currentSession && currentUser && !isCircuitOpen() && !isInitializing && initializationAttempted) {
      console.log('Processing initial message with loaded user:', currentUser.email);
      initializeNewChat('optimizing_current_track', 'electronic', initialMessage);
    }
  }, [initialMessage, currentSession, currentUser, initializeNewChat, isCircuitOpen, isInitializing, initializationAttempted]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);

    const audioFile = files.find(file =>
      file.type.startsWith('audio/') ||
      file.name.toLowerCase().endsWith('.wav') ||
      file.name.toLowerCase().endsWith('.mp3') ||
      file.name.toLowerCase().endsWith('.flac')
    );

    const imageFile = files.find(file =>
      file.type.startsWith('image/') ||
      file.name.toLowerCase().endsWith('.png') ||
      file.name.toLowerCase().endsWith('.jpg') ||
      file.name.toLowerCase().endsWith('.jpeg') ||
      file.name.toLowerCase().endsWith('.gif')
    );

    if (isCircuitOpen()) {
      console.log('[Circuit Breaker] Blocking file drop - circuit is open');
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: "I'm experiencing high traffic right now. Please wait a moment and try again! 🤖",
        messageType: 'text',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    if (audioFile) {
      await analyzeDroppedFile(audioFile);
    } else if (imageFile) {
      await uploadAndSendImage(imageFile);
    } else {
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: "Hey, I can analyze audio files (WAV, MP3, FLAC) or look at screenshots (PNG, JPG)! 🎵📸",
        messageType: 'text',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const uploadAndSendImage = async (imageFile) => {
    if (isUploadingImage || !currentSession) return;

    const maxSizeInBytes = 10 * 1024 * 1024;
    if (imageFile.size > maxSizeInBytes) {
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: "That image is too big! 📁 Keep screenshots under 10MB and try again! 📸",
        messageType: 'text',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    setIsUploadingImage(true);
    setIsLoading(true);

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: `📸 Uploaded screenshot: ${imageFile.name}`,
      timestamp: new Date(),
      hasImage: true,
      imageName: imageFile.name
    };
    setMessages(prev => [...prev, userMessage]);

    const initialBotMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: `Let me take a look at your screenshot... 👀`,
      messageType: 'text',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, initialBotMessage]);

    try {
      const { file_url } = await UploadFile({ file: imageFile });
      recordSuccess(); // UploadFile success

      const analysisMessage = {
        id: Date.now() + 2,
        type: 'bot',
        content: "Got it! What would you like me to help you find or explain in this screenshot? 🤔",
        messageType: 'text',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, analysisMessage]);

      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id
          ? { ...msg, imageUrl: file_url }
          : msg
      ));

      const userMsgOrder = await getNextMessageOrder(currentSession.id);
      const botMsg1Order = userMsgOrder + 1;
      const botMsg2Order = userMsgOrder + 2;

      await ChatMessage.create({
        chat_session_id: currentSession.id,
        sender: 'user',
        content: userMessage.content,
        message_order: userMsgOrder
      });
      recordSuccess(); // ChatMessage.create success

      await ChatMessage.create({
        chat_session_id: currentSession.id,
        sender: 'bot',
        content: initialBotMessage.content,
        message_order: botMsg1Order
      });
      recordSuccess(); // ChatMessage.create success

      await ChatMessage.create({
        chat_session_id: currentSession.id,
        sender: 'bot',
        content: analysisMessage.content,
        message_order: botMsg2Order
      });
      recordSuccess(); // ChatMessage.create success

      await ChatSession.update(currentSession.id, {
        last_message_at: new Date().toISOString(),
        message_count: botMsg2Order
      });
      recordSuccess(); // ChatSession.update success
      setMessageOrderCounter(botMsg2Order + 1); // Update for frontend

      loadSessions().catch(err => console.warn('Failed to reload sessions after image upload:', err)); // Apply debounce
    } catch (error) {
      console.error('Image upload failed:', error);
      recordFailure(error); // Image upload failed

      const errorMessage = {
        id: Date.now() + 3,
        type: 'bot',
        content: "Had trouble uploading your screenshot. Check your connection and try again! 📸",
        messageType: 'text',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsUploadingImage(false);
      setIsLoading(false);
    }
  };

  const analyzeDroppedFile = async (file) => {
    if (isAnalyzingFile) return;

    setIsAnalyzingFile(true);
    setIsLoading(true);

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: `🎵 Dropped file: ${file.name}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    const initialBotMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: `Alright, let me get my ears on "${file.name}" 🎧\n\nGive me a moment while I analyze the mix...`,
      messageType: 'text',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, initialBotMessage]);

    try {
      setAnalysisProgress('Uploading file...');
      const { file_url } = await UploadFile({ file: file });
      recordSuccess(); // UploadFile success

      setAnalysisProgress('Analyzing audio...');
      const { data } = await analyzeAudio({
        file: file_url,
        filename: file.name,
        musicalStyle: 'DRUM_N_BASS', // Default, should be dynamic if possible
        isMaster: true
      });
      recordSuccess(); // analyzeAudio success

      setAnalysisProgress('Analysis complete!');

      const analysisMessage = {
        id: Date.now() + 2,
        type: 'bot',
        content: data.audioFile?.koe_summary || "Analysis complete! I've got some thoughts on your track. What would you like to know?",
        messageType: 'text',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, analysisMessage]);

      if (data.audioFile) {
        setAnalysisContext(data.audioFile);
        setComparisonContext(null);

        let sessionToUpdate = currentSession;
        if (!currentSession) {
          const user = await User.me();
          if (user) {
            const newSession = await ChatSession.create({
              name: `Analysis: ${file.name}`,
              project_objective: 'optimizing_current_track',
              genre: data.audioFile.musical_style || 'electronic',
              linked_analysis_id: data.audioFile.id,
              daw: currentUser?.preferred_daw || null, // Set DAW from user preferences
              created_by: user.email
            });
            recordSuccess(); // ChatSession.create success
            setCurrentSession(newSession);
            setCurrentView('chat');
            sessionToUpdate = newSession;
          } else {
            console.error('Could not create new session: User not loaded.');
            throw new Error('User not loaded, cannot create session.');
          }
        } else {
          await ChatSession.update(currentSession.id, {
            linked_analysis_id: data.audioFile.id,
            linked_comparison_id: null,
            name: `Analysis: ${file.name}`
          });
          recordSuccess(); // ChatSession.update success
          setCurrentSession(prev => ({
            ...prev,
            linked_analysis_id: data.audioFile.id,
            linked_comparison_id: null,
            name: `Analysis: ${file.name}`
          }));
        }

        if (sessionToUpdate) {
          const userMsgOrder = await getNextMessageOrder(sessionToUpdate.id);
          const botMsg1Order = userMsgOrder + 1;
          const botMsg2Order = userMsgOrder + 2;

          await ChatMessage.create({
            chat_session_id: sessionToUpdate.id,
            sender: 'user',
            content: userMessage.content,
            message_order: userMsgOrder
          });
          recordSuccess(); // ChatMessage.create success
          await ChatMessage.create({
            chat_session_id: sessionToUpdate.id,
            sender: 'bot',
            content: initialBotMessage.content,
            message_order: botMsg1Order
          });
          recordSuccess(); // ChatMessage.create success
          await ChatMessage.create({
            chat_session_id: sessionToUpdate.id,
            sender: 'bot',
            content: analysisMessage.content,
            message_order: botMsg2Order
          });
          recordSuccess(); // ChatMessage.create success
          await ChatSession.update(sessionToUpdate.id, {
            last_message_at: new Date().toISOString(),
            message_count: botMsg2Order
          });
          recordSuccess(); // ChatSession.update success
          setMessageOrderCounter(botMsg2Order + 1); // Update for frontend
          loadSessions().catch(err => console.warn('Failed to reload sessions after analysis:', err)); // Non-blocking reload
        }
      }
    } catch (error) {
      console.error('File analysis failed:', error);
      recordFailure(error); // File analysis failed

      let errorMessage = 'Something went wrong analyzing your track. Please try again.';
      if (error.message && error.message.includes('busy')) {
        errorMessage = 'The analysis service is swamped right now! Give me 5 minutes and try again. 🤖';
      } else if (error.message && error.message.includes('upload')) {
        errorMessage = 'Had trouble uploading your file. Check your connection and try again.';
      } else if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }

      const errorMessageObj = {
        id: Date.now() + 3,
        type: 'bot',
        content: errorMessage,
        messageType: 'text',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsAnalyzingFile(false);
      setIsLoading(false);
      setAnalysisProgress('');
    }
  };

  const handleSelectContext = async (contextInfo) => {
    if (!currentSession) return;
    try {
      if (contextInfo.type === 'analysis') {
        setAnalysisContext(contextInfo.data);
        setComparisonContext(null);

        await ChatSession.update(currentSession.id, {
          linked_analysis_id: contextInfo.data.id,
          linked_comparison_id: null
        });
        recordSuccess(); // ChatSession.update success
        setCurrentSession(prev => ({
          ...prev,
          linked_analysis_id: contextInfo.data.id,
          linked_comparison_id: null
        }));
      } else if (contextInfo.type === 'comparison') {
        setComparisonContext(contextInfo.data);
        setAnalysisContext(null);

        await ChatSession.update(currentSession.id, {
          linked_comparison_id: contextInfo.data.id,
          linked_analysis_id: null
        });
        recordSuccess(); // ChatSession.update success
        setCurrentSession(prev => ({
          ...prev,
          linked_comparison_id: contextInfo.data.id,
          linked_analysis_id: null
        }));
      }
      setShowContextSelector(false);
      loadSessions().catch(err => console.warn('Failed to reload sessions after context selection:', err));
    } catch (error) {
      console.error('Failed to select context:', error);
      recordFailure(error); // Failed to select context
    }
  };

  const handleClearContext = async () => {
    if (!currentSession) return;
    try {
      setAnalysisContext(null);
      setComparisonContext(null);

      await ChatSession.update(currentSession.id, {
        linked_analysis_id: null,
        linked_comparison_id: null
      });
      recordSuccess(); // ChatSession.update success
      setCurrentSession(prev => ({
        ...prev,
        linked_analysis_id: null,
        linked_comparison_id: null
      }));
      setShowContextSelector(false);
      loadSessions().catch(err => console.warn('Failed to reload sessions after context clear:', err));
    } catch (error) {
      console.error('Failed to clear context:', error);
      recordFailure(error); // Failed to clear context
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && !isAnalyzingFile && !isUploadingImage && !isCircuitOpen()) {
      e.preventDefault();
      // If no session exists, trigger new chat initialization with the message
      if (!currentSession) {
        initializeNewChat('optimizing_current_track', 'electronic', inputMessage);
      } else {
        sendMessage();
      }
    }
  };

  // Show circuit breaker status if needed
  if (circuitBreakerState.isOpen && !isInitializing) {
    const timeUntilRetry = Math.ceil((circuitBreakerState.nextRetryTime - Date.now()) / 1000);

    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/cd652a39e_dondarkoelogonew12.png"
              alt="KOE"
              className="w-8 h-8 object-contain"
            />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Taking a breather! 😅</h3>
          <p className="text-gray-400 mb-4">
            I'm experiencing high traffic right now. Please wait {timeUntilRetry > 0 ? `${timeUntilRetry} seconds` : 'a moment'} before trying again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  if (!isOpen && !isEmbedded) return null;

  return (
    <div
      className={`h-full flex flex-col ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleFileDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 z-[100] bg-blue-500/20 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Music className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Drop your file here</h3>
            <p className="text-blue-300">Audio files for analysis or screenshots for visual help! 🎵📸</p>
          </div>
        </div>
      )}

      {!isEmbedded && (
        <div className="flex-shrink-0 p-3 md:p-6 pb-2 md:pb-4 border-b border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onBackToWelcome ? onBackToWelcome() : setCurrentView('sessions')}
                className="text-gray-400 hover:text-white w-8 h-8 md:w-10 md:h-10 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 p-1">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/cd652a39e_dondarkoelogonew12.png"
                  alt="KOE"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white text-sm md:text-lg font-semibold truncate">{currentSession?.name || "KOE Chat"}</h3>
                <div className="flex items-center gap-1 md:gap-2 text-xs">
                  <p className="text-blue-300 truncate">KOE • {currentSession?.project_objective?.replace(/_/g, ' ') || 'Chat'}</p>
                  {currentSession?.genre && (
                    <span className="text-green-300 hidden sm:inline">• {currentSession.genre}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentView('sessions')}
                className="text-gray-400 hover:text-white w-8 h-8"
                title="Sessions"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowContextSelector(true)}
                className="text-gray-400 hover:text-white w-8 h-8"
                title="Add Context"
              >
                <Target className="w-4 h-4" />
              </Button>
              {onMinimize && (
                <Button variant="ghost" size="icon" onClick={onMinimize} className="text-gray-400 hover:text-white w-8 h-8 hidden md:flex">
                  <Minimize2 className="w-4 h-4" />
                </Button>
              )}
              {onClose && (
                <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white w-8 h-8 hidden md:flex">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {isEmbedded && currentSession && (
        <div className="flex-shrink-0 p-2 md:p-4 pb-1 md:pb-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBackToWelcome ? onBackToWelcome() : setCurrentView('sessions')}
              className="text-gray-400 hover:text-white text-xs md:text-sm px-2 py-1"
            >
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="hidden sm:inline">Back</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContextSelector(true)}
                className="text-gray-400 hover:text-white text-xs md:text-sm px-2 py-1"
              >
                <Target className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span className="hidden sm:inline">Add Context</span>
                <span className="sm:hidden">Context</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-2 md:px-4 custom-scrollbar"
          style={{ minHeight: 0 }}
        >
          <div className="py-3 md:py-6 space-y-3 md:space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className={`flex gap-2 md:gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1 p-1">
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/cd652a39e_dondarkoelogonew12.png"
                        alt="KOE"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  <div className={`max-w-[90%] md:max-w-[75%] p-3 md:p-4 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'backdrop-blur-xl bg-black/60 border border-blue-500/30 text-gray-100'
                  }`}>
                    {/* Content rendering starts here */}
                    {message.type === 'user' ? (
                      <>
                        {message.hasImage && (
                          <div className="flex items-center gap-2 mb-2 text-blue-200">
                            <span className="text-base md:text-lg">📸</span>
                            <span className="text-xs md:text-sm opacity-80">Screenshot attached</span>
                          </div>
                        )}
                        <p className="leading-relaxed text-xs md:text-base">
                          {message.content}
                        </p>
                      </>
                    ) : ( // Bot message content
                      (() => {
                        const content = message.content; // structured object for menu/step/confirmation/discovery, string for text
                        const messageType = message.messageType;

                        if (messageType === 'menu') {
                          return (
                            <div className="text-sm md:text-base text-gray-100">
                              <p className="mb-4 leading-relaxed">{content.greeting}</p>
                              <div className="space-y-2">
                                {(content.options || []).map((option) => (
                                  <button
                                    key={option.number}
                                    onClick={() => handleQuickReply(option.number.toString())}
                                    className="flex items-center w-full p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-left transition-all duration-200 group"
                                    disabled={isLoading || isAnalyzingFile || isUploadingImage || isCircuitOpen()}
                                  >
                                    <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-semibold text-sm mr-3 group-hover:bg-blue-500/30">
                                      {option.number}
                                    </span>
                                    <span className="text-blue-100 group-hover:text-white">{option.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        } else if (messageType === 'confirmation') {
                          return (
                            <div className="text-sm md:text-base text-gray-100">
                              <ReactMarkdown
                                className="text-sm prose prose-sm prose-slate prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                                components={{
                                  p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-orange-200" {...props} />,
                                  strong: ({ node, ...props }) => <strong className="text-orange-100 font-bold" {...props} />,
                                  em: ({ node, ...props }) => <em className="text-orange-200 italic" {...props} />,
                                }}
                              >
                                {content.message}
                              </ReactMarkdown>
                              <div className="space-y-2">
                                {(content.suggestions || []).map((suggestion, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleQuickReply(suggestion)}
                                    className="flex items-center w-full p-3 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-left transition-all duration-200 group"
                                    disabled={isLoading || isAnalyzingFile || isUploadingImage || isCircuitOpen()}
                                  >
                                    <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-300 font-semibold text-sm mr-3 group-hover:bg-orange-500/30">
                                      {index + 1}
                                    </span>
                                    <span className="text-orange-100 group-hover:text-white">{suggestion}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        } else if (messageType === 'discovery') {
                          return (
                            <div className="text-sm md:text-base text-gray-100">
                              <ReactMarkdown
                                className="text-sm prose prose-sm prose-slate prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                                components={{
                                  p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-gray-100" {...props} />,
                                  strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                                  em: ({ node, ...props }) => <em className="text-green-200 italic" {...props} />,
                                }}
                              >
                                {content.message}
                              </ReactMarkdown>
                              <div className="space-y-2">
                                {(content.suggestions || []).map((suggestion, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleQuickReply(suggestion)}
                                    className="flex items-center w-full p-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-left transition-all duration-200 group"
                                    disabled={isLoading || isAnalyzingFile || isUploadingImage || isCircuitOpen()}
                                  >
                                    <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-300 font-semibold text-sm mr-3 group-hover:bg-green-500/30">
                                      {index + 1}
                                    </span>
                                    <span className="text-green-100 group-hover:text-white">{suggestion}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        } else if (messageType === 'step') {
                          return (
                            <div className="text-sm md:text-base text-gray-100">
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold text-blue-300">{content.title}</h3>
                                  <span className="text-xs text-gray-400">{content.progress}</span>
                                </div>

                                <div className="space-y-4">
                                  {(content.do_items || []).map((item, index) => (
                                    <div key={index} className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/20">
                                      <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-semibold text-sm mt-0.5 flex-shrink-0">
                                          {index + 1}
                                        </span>
                                        <div className="flex-1 space-y-2">
                                          <div>
                                            <span className="font-medium">
                                              {item.action}
                                            </span>
                                          </div>

                                          {item.settings && (
                                            <div className="text-green-300 text-sm">
                                              <span className="font-medium">Settings:</span> {item.settings}
                                            </div>
                                          )}

                                          {item.listen_for && (
                                            <div className="text-orange-300 text-sm">
                                              <span className="font-medium">Listen for:</span> {item.listen_for}
                                            </div>
                                          )}

                                          {item.reason && (
                                            <div className="text-purple-300 text-sm italic">
                                              💡 {item.reason}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-6">
                                {(content.buttons || []).map((button, index) => {
                                  return (
                                    <button
                                      key={index}
                                      onClick={() => handleQuickReply(button)}
                                      className="px-4 py-2 rounded-full bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-300 hover:text-green-200 text-sm transition-all duration-200 font-medium"
                                      disabled={isLoading || isAnalyzingFile || isUploadingImage || isCircuitOpen()}
                                    >
                                      {button}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        } else { // Default text message
                          const textToRender =
                            typeof content === 'string'
                              ? content
                              : (content?.message || JSON.stringify(content));
                          return (
                            <div className="text-sm md:text-base text-gray-100">
                              <ReactMarkdown
                                className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0" // ADDED prose-invert
                                components={{
                                  p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-gray-100" {...props} />,
                                  h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-white mb-4 mt-6 first:mt-0" {...props} />,
                                  h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-blue-300 mb-3 mt-5 first:mt-0" {...props} />,
                                  h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-blue-200 mb-3 mt-4 first:mt-0" {...props} />,
                                  ol: ({ node, ...props }) => (
                                    <ol className="list-decimal list-inside mb-6 mt-4 space-y-2 pl-4 text-gray-100" {...props} />
                                  ),
                                  ul: ({ node, ...props }) => (
                                    <ul className="list-disc list-inside mb-6 mt-4 space-y-2 pl-4 text-gray-100" {...props} />
                                  ),
                                  li: ({ node, ...props }) => (
                                    <li className="mb-2 leading-relaxed text-gray-100" {...props} />
                                  ),
                                  strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                                  em: ({ node, ...props }) => <em className="text-blue-200 italic" {...props} />,
                                  code: ({ node, inline, ...props }) =>
                                    inline ? (
                                      <code className="bg-blue-500/20 text-blue-200 px-2 py-1 rounded font-mono text-sm" {...props} />
                                    ) : (
                                      <pre className="bg-black/40 border border-blue-500/30 text-blue-200 p-4 rounded-lg font-mono text-sm overflow-x-auto my-4">
                                        <code {...props} />
                                      </pre>
                                    ),
                                  blockquote: ({ node, ...props }) => (
                                    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-blue-200 mb-4 bg-blue-500/5 py-3 rounded-r" {...props} />
                                  ),
                                  br: ({ node, ...props }) => <br className="mb-2" {...props} />,
                                  a: ({ node, ...props }) => (
                                    <a className="text-blue-300 hover:text-blue-200 underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
                                  ),
                                  hr: ({ node, ...props }) => <hr className="border-blue-500/30 my-6" {...props} />,
                                }}
                              >
                                {textToRender}
                              </ReactMarkdown>
                            </div>
                          );
                        }
                      })()
                    )}
                    {/* Content rendering ends here */}
                  </div>

                  {message.type === 'user' && (
                    <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <UserIcon className="w-3 h-3 md:w-5 md:h-5" />
                    </div>
                  )}
                </motion.div>
              ))}

              {(isLoading || isAnalyzingFile || isUploadingImage) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 md:gap-4 justify-start"
                >
                  <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1 p-1">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/cd652a39e_dondarkoelogonew12.png"
                      alt="KOE"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="backdrop-blur-xl bg-black/60 border border-blue-500/30 p-3 md:p-4 rounded-2xl">
                    <div className="flex items-center gap-2 text-blue-300">
                      <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                      <span className="text-xs md:text-sm">
                        {isAnalyzingFile
                          ? (analysisProgress || 'analyzing your track...')
                          : isUploadingImage
                            ? 'uploading screenshot...'
                            : 'thinking...'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div ref={messagesEndRef} />
        </div>

        <div className="flex-shrink-0 p-2 md:p-4 border-t border-blue-500/20 bg-black/20 backdrop-blur-sm">
          {isAnalyzingFile && analysisProgress && (
            <div className="mb-2 md:mb-3 text-center">
              <div className="inline-flex items-center gap-1 px-2 md:px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
                <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                <span className="text-blue-300 text-xs">{analysisProgress}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 md:gap-3 items-end">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isDragOver ? "Drop your file here! 🎵📸" : "Ask KOE about your music production goals... or drag & drop an audio file or screenshot! 🎧📸"}
              className="flex-1 backdrop-blur-xl bg-black/60 border-blue-500/40 text-white placeholder-gray-400 py-2 md:py-3 px-3 md:px-4 rounded-xl focus:border-blue-400 focus:ring-0 focus:ring-offset-0 text-sm md:text-base"
              disabled={isLoading || isAnalyzingFile || isUploadingImage || isCircuitOpen()}
            />
            <Button
              onClick={() => {
                if (!currentSession) {
                  initializeNewChat('optimizing_current_track', 'electronic', inputMessage);
                } else {
                  sendMessage();
                }
              }}
              disabled={!inputMessage.trim() || isLoading || isAnalyzingFile || isUploadingImage || isCircuitOpen()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-3 md:px-6 py-2 md:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isLoading || isAnalyzingFile || isUploadingImage) ? (
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </Button>
          </div>

          {/* Context buttons right under input */}
          <div className="mt-2 md:mt-3">
            <div className="flex flex-wrap gap-2 justify-start">
              {analysisContext && (
                <button
                  onClick={() => navigate(createPageUrl("Analyses") + `?id=${analysisContext.id}`)}
                  className="inline-flex items-center gap-1 px-2 py-1 backdrop-blur-xl bg-blue-500/20 border border-blue-500/30 rounded-full hover:bg-blue-500/30 hover:border-blue-500/50 transition-all duration-200 cursor-pointer group"
                >
                  <Sparkles className="w-3 h-3 text-blue-300 group-hover:text-blue-200" />
                  <span className="text-xs text-blue-300 group-hover:text-blue-200 truncate max-w-[120px] md:max-w-none">
                    Analysis: {analysisContext.filename}
                  </span>
                </button>
              )}
              {comparisonContext && (
                <button
                  onClick={() => navigate(createPageUrl("Analyses"))}
                  className="inline-flex items-center gap-1 px-2 py-1 backdrop-blur-xl bg-green-500/20 border border-green-500/30 rounded-full hover:bg-green-500/30 hover:border-green-500/50 transition-all duration-200 cursor-pointer group"
                >
                  <GitCompare className="w-3 h-3 text-green-300 group-hover:text-green-200" />
                  <span className="text-xs text-green-300 group-hover:text-green-200 truncate max-w-[120px] md:max-w-none">
                    Compare: {comparisonContext.filenameA} vs {comparisonContext.filenameB}
                  </span>
                </button>
              )}
              {currentUser?.preferred_daw && (
                <div className="inline-flex items-center gap-1 px-2 py-1 backdrop-blur-xl bg-purple-500/20 border border-purple-500/30 rounded-full">
                  <Settings className="w-3 h-3 text-purple-300" />
                  <span className="text-xs text-purple-300 truncate max-w-[80px] md:max-w-none">
                    DAW: {currentUser.preferred_daw.charAt(0).toUpperCase() + currentUser.preferred_daw.slice(1).replace('_', ' ')}
                  </span>
                </div>
              )}
              {!analysisContext && !comparisonContext && (
                <button
                  onClick={() => setShowContextSelector(true)}
                  className="inline-flex items-center gap-1 px-2 py-1 backdrop-blur-xl bg-gray-500/20 border border-gray-500/30 rounded-full hover:bg-gray-500/30 hover:border-gray-500/50 transition-all duration-200 cursor-pointer group"
                >
                  <Target className="w-3 h-3 text-gray-300 group-hover:text-gray-200" />
                  <span className="text-xs text-gray-300 group-hover:text-gray-200">
                    Add Context
                  </span>
                </button>
              )}
              {!currentUser?.preferred_daw && (
                <button
                  onClick={() => navigate(createPageUrl('KoePreferences'))}
                  className="inline-flex items-center gap-1 px-2 py-1 backdrop-blur-xl bg-yellow-500/20 border border-yellow-500/30 rounded-full hover:bg-yellow-500/30 hover:border-yellow-500/50 transition-all duration-200 cursor-pointer group"
                >
                  <Settings className="w-3 h-3 text-yellow-300 group-hover:text-yellow-200" />
                  <span className="text-xs text-yellow-300 group-hover:text-yellow-200">
                    Set DAW in Preferences
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ContextSelectorModal
        isOpen={showContextSelector}
        onClose={() => setShowContextSelector(false)}
        onSelectContext={handleSelectContext}
        onClearContext={handleClearContext}
        currentContext={analysisContext ? { type: 'analysis', data: analysisContext } :
          comparisonContext ? { type: 'comparison', data: comparisonContext } : null}
      />
    </div>
  );
}
