
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { ChatSession } from "@/api/entities";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EngineLayout from '../components/layout/EngineLayout';
import KoeChatbotWithSessions from '../components/koe/KoeChatbotWithSessions';
import ChatSessionManager from '../components/koe/ChatSessionManager';
import GlowingChatbox from '../components/koe/GlowingChatbox';

export default function KOEPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSessions, setShowSessions] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [view, setView] = useState('welcome'); // 'welcome', 'sessions', 'chat'
  const [linkedAnalysisId, setLinkedAnalysisId] = useState(null);
  const [linkedComparisonId, setLinkedComparisonId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.log('Could not fetch user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  // FIXED: Enhanced URL parameter handling for roast functionality
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    const sessionParam = urlParams.get('sessionId');
    const analysisParam = urlParams.get('analysisId');
    const comparisonParam = urlParams.get('comparisonId');

    console.log('KOE Page URL params:', { viewParam, sessionParam, analysisParam, comparisonParam });

    // FIXED: Handle roast requests (analysisId or comparisonId)
    if (analysisParam || comparisonParam) {
      setLinkedAnalysisId(analysisParam);
      setLinkedComparisonId(comparisonParam);
      setView('chat');
      
      // Clean URL after setting state
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // Handle direct session loading
    if (sessionParam) {
      (async () => {
        try {
          const results = await ChatSession.filter({ id: sessionParam });
          const session = results?.[0] || null;
          if (session) {
            setCurrentSession(session);
            setView('chat');
            window.history.replaceState({}, '', window.location.pathname);
          } else {
            console.warn(`ChatSession with ID ${sessionParam} not found.`);
            setView(viewParam === 'sessions' ? 'sessions' : 'welcome');
            window.history.replaceState({}, '', window.location.pathname);
          }
        } catch (e) {
          console.error('Error fetching chat session:', e);
          setView(viewParam === 'sessions' ? 'sessions' : 'welcome');
          window.history.replaceState({}, '', window.location.pathname);
        }
      })();
      return;
    }

    // Handle view parameter
    if (viewParam === 'sessions') {
      setView('sessions');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleStartChat = () => {
    console.log('Starting new chat session');
    setCurrentSession(null);
    setLinkedAnalysisId(null);
    setLinkedComparisonId(null);
    setView('chat');
  };

  const handleSelectSession = (session) => {
    setCurrentSession(session);
    setLinkedAnalysisId(null);
    setLinkedComparisonId(null);
    setView('chat');
    setShowSessions(false);
  };

  const handleBackToWelcome = () => {
    setView('welcome');
    setCurrentSession(null);
    setLinkedAnalysisId(null);
    setLinkedComparisonId(null);
    setShowSessions(false);
  };

  // Show prominent personalization banner if preferences not complete
  const showPersonalizationBanner = user && !user.koe_preferences_complete;

  if (isLoading) {
    return (
      <EngineLayout 
        engineType="KOE" 
        currentPageName="KOE"
        defaultTool="chat"
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-white">Loading KOE...</div>
        </div>
      </EngineLayout>
    );
  }

  return (
    <EngineLayout 
      engineType="KOE" 
      currentPageName="KOE"
      defaultTool={view === 'sessions' ? 'sessions' : 'chat'}
    >
      <div className="h-full flex flex-col p-4">
        {/* Personalization Banner - Better spacing */}
        {showPersonalizationBanner && view === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 relative z-20"
          >
            <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/50">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-base leading-tight">Personalize Your KOE Experience</h3>
                      <p className="text-purple-200 text-sm">Set your sonic preferences for tailored feedback.</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(createPageUrl('KoePreferences'))}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 w-full sm:w-auto flex-shrink-0 text-sm"
                  >
                    Set Up Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content - Better sizing */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {view === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <GlowingChatbox onStartChat={handleStartChat} />
              </motion.div>
            )}

            {view === 'sessions' && (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="absolute inset-0"
              >
                <div className="h-full flex flex-col">
                  <div className="flex-shrink-0 p-4 border-b border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <Button
                        onClick={handleBackToWelcome}
                        variant="ghost"
                        className="text-gray-400 hover:text-white px-3 py-2"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <h2 className="text-lg font-semibold text-white">Your Sessions</h2>
                      <div></div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <ChatSessionManager
                      onSelectSession={handleSelectSession}
                      onStartNewChat={handleStartChat}
                      showProminentNewChat={true}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0"
              >
                <KoeChatbotWithSessions 
                  isEmbedded={true}
                  className="h-full"
                  hideSessionHeader={false}
                  initialMessage={null}
                  onBackToWelcome={handleBackToWelcome}
                  preSelectedSession={currentSession}
                  linkedAnalysisId={linkedAnalysisId}
                  linkedComparisonId={linkedComparisonId}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </EngineLayout>
  );
}
