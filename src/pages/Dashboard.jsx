
import React, { useState, useEffect, useRef } from 'react';
import { Headphones, Zap, Award, Clock, History, Settings, BarChart3 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { Conversation } from '@/api/entities';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import DashboardChat from "../components/chat/DashboardChat";
import DashboardChatHistory from "../components/chat/DashboardChatHistory";
import SettingsPanel from "../components/dashboard/SettingsPanel";
import { Button } from '@/components/ui/button';
import { ContentIdea } from '@/api/entities';
import { UserBrainDumpEntry } from '@/api/entities';
import { Bell, FolderOpen, Brain } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [conversationTitle, setConversationTitle] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const [showHistoryCallback, setShowHistoryCallback] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false); // Dashboard accordion state
  const [currentTime, setCurrentTime] = useState(new Date()); // Current time state
  const [settings, setSettings] = useState({
    unrestricted_mode: false,
    cognitive_level: 50,
    response_length: 'default',
    model_preference: 'balanced',
    auto_context_switching: false,
    technical_mode: false
  });

  // NEW: content vault + brain dumps summary
  const [contentIdeas, setContentIdeas] = useState([]);
  const [brainDumpCount, setBrainDumpCount] = useState(0);

  // NEW: Chat management state
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [conversations, setConversations] = useState([]); // Not used in this step for rendering, but good to declare
  const initialChatLoadDone = useRef(false);

  // Inspirational quotes for producers
  const quotes = [
  "Great music is not made by perfect people, but by passionate ones.",
  "Every master was once a disaster. Keep creating.",
  "The beat you make today could be someone's favorite song tomorrow.",
  "Creativity is intelligence having fun. Let your sound evolve.",
  "Your next breakthrough is just one session away.",
  "Music is the universal language. Speak it fluently.",
  "Innovation comes from pushing boundaries, not following them.",
  "Every producer started with their first loop. Keep looping.",
  "The studio is your laboratory. Experiment fearlessly.",
  "Great tracks aren't made in a day, but they start with one.",
  "Your unique sound is your superpower. Embrace it.",
  "Progress over perfection. Create and iterate.",
  "The best time to start was yesterday. The second best is now.",
  "Music production is 10% inspiration, 90% dedication.",
  "Turn your creative blocks into building blocks."];


  const todaysQuote = quotes[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % quotes.length];

  const logoUrls = {
    KOE: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/f2c69589f_koelogo2.png",
    ARK: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/92f478df4_arklogo2.png",
    INDI: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/f62477268_indilogo2.png"
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser({ membership_level: 'pro', full_name: 'User', onboarding_complete: true });
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  // NEW: useEffect to load the most recent conversation on initial load
  useEffect(() => {
    if (initialChatLoadDone.current) {
      return;
    }
    initialChatLoadDone.current = true;

    const loadMostRecentConversation = async () => {
      try {
        const recentConversations = await Conversation.list('-updated_date', 1);
        if (recentConversations && recentConversations.length > 0) {
          setActiveConversationId(recentConversations[0].id);
        }
      } catch (error) {
        console.error('Failed to load most recent conversation:', error);
      }
    };
    
    loadMostRecentConversation();
  }, []); // Empty dependency array ensures it runs only once

  // Load vault + brain dump summaries when dashboard is opened
  useEffect(() => {
    if (!showDashboard) return;
    const load = async () => {
      try {
        const ideas = await ContentIdea.list('-created_date', 5);
        setContentIdeas(ideas || []);
      } catch (e) {
        setContentIdeas([]);
        console.error("Failed to load content ideas:", e);
      }
      try {
        const dumps = await UserBrainDumpEntry.list('-created_date', 100);
        setBrainDumpCount((dumps || []).length);
      } catch (e) {
        setBrainDumpCount(0);
        console.error("Failed to load brain dumps:", e);
      }
    };
    load();
  }, [showDashboard]);

  const engineAccess = { KOE: 'basic', ARK: 'pro', INDI: 'premium' };

  const hasAccess = (requiredLevel) => {
    if (!user || !user.membership_level) return false;
    const levels = ['guest', 'basic', 'pro', 'premium'];
    return levels.indexOf(user.membership_level) >= levels.indexOf(requiredLevel);
  };

  const handleArkNavigation = () => {
    if (!hasAccess(engineAccess.ARK)) return;
    if (user && !user.ark_onboarding_complete) {
      navigate(createPageUrl('ArkOnboarding'));
    } else {
      navigate(createPageUrl('ArkDashboard'));
    }
  };

  const handleConversationUpdate = (title, count, historyCallback) => {
    setConversationTitle(title);
    setMessageCount(count);
    // Updated to show chat history panel directly
    setShowHistoryCallback(() => () => setShowChatHistory(true));
  };

  const handleHistoryClick = () => {
    setShowChatHistory(true);
  };

  const handleSettingsChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectConversation = (conversation) => {
    setActiveConversationId(conversation.id);
    setShowChatHistory(false);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setShowChatHistory(false);
  };

  const handleDeleteConversation = (conversationId) => {
    if (conversationId === activeConversationId) {
      setActiveConversationId(null);
    }
  };

  const handleNewConversationCreated = (newConversationId) => {
    setActiveConversationId(newConversationId);
  };

  if (userLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }

  return (
    <div className="flex flex-col h-screen text-white font-sans bg-transparent">
      {/* Combined Header */}
      <header className="flex items-center justify-between p-4 border-b border-cyan-500/30 relative z-10 flex-shrink-0 bg-black/20 backdrop-blur-sm">
        {/* Left: Conversation Info + Dashboard Toggle */}
        <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-none">
            <button
            onClick={handleHistoryClick}
            className="text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer flex-shrink-0"
            title="Open conversation history">

                <History className="w-4 h-4" />
            </button>
            
            {/* Dashboard Toggle Button */}
            <button
            onClick={() => {
              console.log('Dashboard toggle clicked, current state:', showDashboard);
              setShowDashboard(!showDashboard);
            }}
            className={`text-gray-400 hover:text-white transition-all duration-200 cursor-pointer flex-shrink-0 ${
            showDashboard ? 'text-blue-400' : ''}`
            }
            title="Toggle dashboard overview">

                <BarChart3 className="w-4 h-4" />
            </button>
            
            {/* Hide conversation text on mobile, show on sm and up */}
            <div className="hidden sm:block min-w-0">
                <h3 className="text-white font-medium text-sm truncate">
                    {conversationTitle || 'New Conversation'}
                </h3>
                {messageCount > 0 &&
            <p className="text-gray-400 text-xs">
                    {messageCount} message{messageCount !== 1 ? 's' : ''}
                </p>
            }
            </div>
        </div>

        {/* Center on Desktop, Right on Mobile: Engine Tool Cards */}
        <div className="flex items-center gap-x-4 sm:gap-x-6 sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
            <button
            onClick={() => hasAccess(engineAccess.KOE) && navigate(createPageUrl('KOE'))}
            disabled={!hasAccess(engineAccess.KOE)}
            className="transition-transform duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed rounded-3xl p-2"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 40px rgba(59, 130, 246, 0.4))'
            }}
            aria-label="KOE Engine">

                <img src={logoUrls.KOE} alt="KOE Logo" className="h-12 w-12 sm:h-10 sm:w-10 object-contain rounded-3xl" />
            </button>

            <button
            onClick={handleArkNavigation}
            disabled={!hasAccess(engineAccess.ARK)}
            className="transition-transform duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed rounded-3xl p-2"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(249, 115, 22, 0.6)) drop-shadow(0 0 40px rgba(249, 115, 22, 0.4))'
            }}
            aria-label="ARK Engine">

                <img src={logoUrls.ARK} alt="ARK Logo" className="h-12 w-12 sm:h-10 sm:w-10 object-contain rounded-3xl" />
            </button>

            <button
            onClick={() => hasAccess(engineAccess.INDI) && navigate(createPageUrl('INDI'))}
            disabled={!hasAccess(engineAccess.INDI)}
            className="transition-transform duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed rounded-3xl p-2"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.6)) drop-shadow(0 0 40px rgba(16, 185, 129, 0.4))'
            }}
            aria-label="INDI Engine">

                <img src={logoUrls.INDI} alt="INDI Logo" className="h-12 w-12 sm:h-10 sm:w-10 object-contain rounded-3xl" />
            </button>
        </div>

        {/* Right: Settings button */}
        <div className="flex-1 flex justify-end">
            <button
            onClick={() => setShowSettings(true)}
            className="text-gray-400 hover:text-white transition-colors duration-200"
            title="Open Settings">

                <Settings className="w-5 h-5" />
            </button>
        </div>
      </header>

      {/* Main Content Area - FIXED LAYOUT */}
      <main className="flex-1 overflow-hidden relative z-10 min-h-0 flex flex-col">
        {/* Dashboard Component - Conditionally Rendered */}
        <AnimatePresence>
          {showDashboard && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "50%", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-black/30 backdrop-blur-sm border-b border-cyan-500/20 overflow-hidden flex-shrink-0"
            >
              <div className="h-full p-6 overflow-y-auto custom-scrollbar">
                {/* TOP: Centered Date/Time with Quote beneath */}
                <div className="mb-6 p-5 bg-black/50 backdrop-blur-xl border border-white/20 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    {currentTime.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h2>
                  <p className="mt-2 text-3xl sm:text-4xl font-mono text-white font-bold tracking-wider">
                    {currentTime.toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                  <p className="mt-4 text-white/90 italic font-medium leading-relaxed max-w-3xl mx-auto">
                    "{todaysQuote}"
                  </p>
                </div>

                {/* PANELS: Enhanced glassmorphism */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Latest Notifications & Updates */}
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-xl shadow-black/20">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-slate-100 text-sm font-semibold flex items-center gap-2">
                        <Bell className="w-4 h-4 text-white/80" />
                        Latest Notifications & Updates
                      </h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {(messageCount > 0 || conversationTitle) ? (
                        <>
                          {messageCount > 0 && (
                            <li className="flex justify-between">
                              <span className="text-gray-300">Messages Today</span>
                              <span className="text-white font-medium">{messageCount}</span>
                            </li>
                          )}
                          {conversationTitle && (
                            <li className="flex justify-between">
                              <span className="text-gray-300">Current Session</span>
                              <span className="text-white font-medium truncate max-w-[55%] text-right">{conversationTitle}</span>
                            </li>
                          )}
                        </>
                      ) : (
                        <li className="text-gray-400">No new notifications</li>
                      )}
                    </ul>
                  </div>

                  {/* Content Vault */}
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-xl shadow-black/20">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-slate-100 text-sm font-semibold flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-white/80" />
                        Content Vault
                      </h3>
                      <Link to={createPageUrl('YourContentIdeas')}>
                        <Button variant="outline" className="h-8 px-3 text-xs bg-black/30 border-white/20 hover:bg-black/40">
                          Open Vault
                        </Button>
                      </Link>
                    </div>
                    {contentIdeas.length === 0 ? (
                      <p className="text-sm text-gray-400">No saved scripts yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {contentIdeas.slice(0, 3).map((idea) => (
                          <li key={idea.id} className="text-sm text-white/90 truncate">
                            • {idea.title}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-3 text-xs text-gray-400">
                      Total scripts: <span className="text-white">{contentIdeas.length}</span>
                    </p>
                  </div>

                  {/* Brain Dumps Library */}
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-xl shadow-black/20">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-slate-100 text-sm font-semibold flex items-center gap-2">
                        <Brain className="w-4 h-4 text-white/80" />
                        Brain Dumps Library
                      </h3>
                      <Link to={createPageUrl('YourBrainDumps')}>
                        <Button variant="outline" className="h-8 px-3 text-xs bg-black/30 border-white/20 hover:bg-black/40">
                          Open Library
                        </Button>
                      </Link>
                    </div>
                    <div className="text-sm text-gray-300">
                      <div className="flex justify-between mb-1">
                        <span>Entries Collected</span>
                        <span className="text-white font-medium">{brainDumpCount}</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Review your saved thoughts and creative notes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area - Dynamically Sized */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <DashboardChat 
            activeConversationId={activeConversationId}
            onNewConversationCreated={handleNewConversationCreated}
            onConversationUpdate={handleConversationUpdate}
          />
        </div>
      </main>

      {/* Chat History Panel */}
      <AnimatePresence>
        {showChatHistory && (
          <DashboardChatHistory
            isOpen={showChatHistory}
            onClose={() => setShowChatHistory(false)}
            currentConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            onDeleteConversation={handleDeleteConversation}
          />
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings &&
        <SettingsPanel
          user={user} // Added user prop here
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onClose={() => setShowSettings(false)} />

        }
      </AnimatePresence>
    </div>
  );
}
