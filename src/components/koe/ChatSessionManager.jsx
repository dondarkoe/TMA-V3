
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, MessageCircle, Sparkles, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { ChatSession } from '@/api/entities';
import { User } from '@/api/entities';
import { format } from 'date-fns';

export default function ChatSessionManager({ 
  onSelectSession,
  onStartNewChat, 
  currentSessionId,
  showProminentNewChat = true,
  isLoading: externalLoading = false
}) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await User.me();
      if (!user) {
        setSessions([]);
        console.warn('[ChatSessionManager] No user found, cannot load sessions.');
        return;
      }

      console.log(`[ChatSessionManager] Loading sessions for user email: ${user.email}`);
      // FIX: Use created_by (user's email) instead of user_id
      const userSessions = await ChatSession.filter({ created_by: user.email }, '-updated_date');
      
      console.log(`[ChatSessionManager] Raw sessions fetched (${userSessions.length}):`, userSessions);

      // Filter out any corrupted sessions
      const validSessions = userSessions.filter(session => {
        const isValid = session && session.id && session.name && session.created_date;
        if (!isValid) {
          console.warn('[ChatSessionManager] Filtering out invalid session:', session);
        }
        return isValid;
      });

      console.log(`[ChatSessionManager] Valid sessions after filter (${validSessions.length}):`, validSessions);
      setSessions(validSessions);
    } catch (error) {
      console.error('[ChatSessionManager] Error loading sessions:', error);
      setError('Failed to load chat sessions');
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    
    // Prevent multiple deletion attempts
    if (deletingSessionId === sessionId) {
      return;
    }

    try {
      setDeletingSessionId(sessionId);
      
      // Check if the session still exists in our local state
      const sessionExists = sessions.find(s => s.id === sessionId);
      if (!sessionExists) {
        console.warn(`Session ${sessionId} not found in local state, removing from UI`);
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        return;
      }

      await ChatSession.delete(sessionId);
      
      // Only update local state if deletion was successful
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      console.log(`Successfully deleted session: ${sessionId}`);
      
    } catch (error) {
      console.error('Failed to delete session:', error);
      
      // Handle specific error cases
      if (error.response?.status === 500 && error.response?.data?.error_type === 'ObjectNotFoundError') {
        // Session was already deleted, just remove it from local state
        console.warn(`Session ${sessionId} was already deleted, removing from UI`);
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } else if (error.message?.includes('Object not found') || error.message?.includes('ObjectNotFoundError')) {
        // Alternative check for object not found
        console.warn(`Session ${sessionId} not found on server, removing from UI`);
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } else {
        // For other errors, show user feedback but don't remove from UI
        console.error(`Unexpected error deleting session ${sessionId}:`, error);
        
        // Optional: You could show a toast notification here
        // toast.error('Failed to delete session. Please try again.');
      }
    } finally {
      setDeletingSessionId(null);
    }
  };

  const formatSessionDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, h:mm a');
    } catch {
      return 'Recently';
    }
  };

  if (isLoading || externalLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white text-lg">Loading sessions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <Button onClick={loadSessions} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 relative">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="h-full overflow-y-auto relative z-10">
        <div className="mx-auto p-4 md:p-6 max-w-4xl">
          {/* Start New Chat - Prominent button at the top */}
          {showProminentNewChat && onStartNewChat && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full mb-8 md:mb-12"
            >
              <Card className="backdrop-blur-xl bg-black/60 border border-blue-500/50">
                <CardContent className="p-4 md:p-6 text-center">
                  <h3 className="text-base md:text-lg font-semibold text-white mb-3">Ready for a New Creative Session?</h3>
                  <p className="text-blue-200 text-sm mb-4">
                    Start a fresh conversation with KOE about your music production goals.
                  </p>
                  <Button
                    onClick={() => onStartNewChat()}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Session
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Sessions List */}
          {sessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center pb-8"
            >
              <div className="text-gray-400 text-lg mb-4">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                No previous sessions found
              </div>
              <p className="text-gray-500 mb-6">Your chat history will appear here once you start your first conversation with KOE.</p>
              {!showProminentNewChat && onStartNewChat && (
                <Button
                  onClick={() => onStartNewChat()}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start Your First Chat
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-4 pb-8">
              <h2 className="text-xl font-semibold text-white mb-6">Your Chat Sessions</h2>
              
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`backdrop-blur-xl bg-black/40 border transition-all duration-300 cursor-pointer hover:bg-black/60 hover:border-blue-500/50 ${
                      currentSessionId === session.id 
                        ? 'border-blue-500/70 bg-blue-500/10' 
                        : 'border-blue-500/20'
                    }`}
                    onClick={() => onSelectSession && onSelectSession(session)}
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 p-2">
                              <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/cd652a39e_dondarkoelogonew12.png" 
                                alt="KOE" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold text-base md:text-lg truncate mb-1">
                                {session.name}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {session.project_objective && (
                                  <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs">
                                    {session.project_objective.replace(/_/g, ' ')}
                                  </span>
                                )}
                                {session.genre && (
                                  <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-xs">
                                    {session.genre}
                                  </span>
                                )}
                                {session.message_count > 0 && (
                                  <span className="px-2 py-1 bg-gray-500/20 border border-gray-500/30 rounded-full text-gray-300 text-xs">
                                    {session.message_count} messages
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Calendar className="w-3 h-3" />
                                <span>{formatSessionDate(session.last_message_at || session.created_date)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            disabled={deletingSessionId === session.id}
                            className={`text-gray-400 hover:text-red-400 hover:bg-red-500/10 w-8 h-8 ${
                              deletingSessionId === session.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {deletingSessionId === session.id ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
