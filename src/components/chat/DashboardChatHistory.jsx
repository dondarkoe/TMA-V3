import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, MessageCircle, Trash2, Calendar, ArrowRight, X } from 'lucide-react';
import { Conversation } from '@/api/entities';
import { format } from 'date-fns';

export default function DashboardChatHistory({ 
  isOpen, 
  onClose, 
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation 
}) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState(null);

  // Only load conversations when the panel is opened
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const allConversations = await Conversation.list('-updated_date');
      setConversations(allConversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    
    if (deletingSessionId === conversationId) return;

    try {
      setDeletingSessionId(conversationId);
      await Conversation.delete(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      // Notify parent about deletion
      if (onDeleteConversation) {
        onDeleteConversation(conversationId);
      }
      
      console.log(`Successfully deleted conversation: ${conversationId}`);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      if (error.response?.status === 500 && error.response?.data?.error_type === 'ObjectNotFoundError') {
        // Conversation was already deleted, just remove it from local state
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        if (onDeleteConversation) {
          onDeleteConversation(conversationId);
        }
      }
    } finally {
      setDeletingSessionId(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, h:mm a');
    } catch {
      return 'Recently';
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: -400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -400, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 h-full w-80 bg-black/90 border-r border-white/20 shadow-2xl z-50 overflow-y-auto custom-scrollbar"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-white/20">
        <h2 className="text-lg font-semibold text-white">Chat History</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onNewChat} className="text-white/70 hover:text-white">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="text-center text-white/70 py-8">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-white/30" />
            <div className="text-white/70 mb-4">No conversations yet</div>
            <Button onClick={onNewChat} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Start New Chat
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`cursor-pointer transition-all duration-200 ${
                  currentConversationId === conversation.id
                    ? 'bg-blue-500/20 border-blue-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => onSelectConversation && onSelectConversation(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate mb-1">
                        {conversation.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(conversation.updated_date || conversation.created_date)}</span>
                        {conversation.messages && conversation.messages.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{conversation.messages.length} messages</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteConversation(conversation.id, e)}
                        disabled={deletingSessionId === conversation.id}
                        className="w-8 h-8 text-white/40 hover:text-red-400 hover:bg-red-500/10"
                      >
                        {deletingSessionId === conversation.id ? (
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
                      <ArrowRight className="w-4 h-4 text-white/40" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}