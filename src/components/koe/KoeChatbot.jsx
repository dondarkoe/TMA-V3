import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, X, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AudioFile } from '@/api/entities';
import { koeChatbot } from '@/api/functions';

export default function KoeChatbot({ isOpen = true, onClose, onMinimize, isEmbedded = false, className = "" }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hey there! I'm KOE, your AI sound design assistant with deep knowledge of music production, mixing, mastering, and Serum synthesis. I'm here to help you create amazing music. What are you working on today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisContext, setAnalysisContext] = useState(null);
  const [conversationId, setConversationId] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const pingIntervalRef = useRef(null);

  // Improved auto-scroll function with better timing
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
    // Ensure scroll happens after DOM updates
    const timeoutId = setTimeout(scrollToBottom, 150);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Warm the backend with ping interval
  useEffect(() => {
    if (isOpen || isEmbedded) {
      // Start warming interval
      pingIntervalRef.current = setInterval(async () => {
        try {
          await fetch('/functions/ping', { method: 'POST', body: '' });
        } catch (error) {
          // Ignore ping errors
        }
      }, 90000);

      return () => {
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
      };
    }
  }, [isOpen, isEmbedded]);

  // Load latest analysis for context
  useEffect(() => {
    const loadLatestAnalysis = async () => {
      try {
        const files = await AudioFile.list('-created_date', 1);
        if (files.length > 0 && files[0].analysis_status === 'completed') {
          setAnalysisContext(files[0]);
        }
      } catch (error) {
        console.log('Could not load analysis context:', error);
      }
    };
    
    if (isOpen || isEmbedded) {
      loadLatestAnalysis();
      // Focus input when chat opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isEmbedded]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message to koeChatbot...');
      
      // Use the imported function directly
      const response = await koeChatbot({
        message: currentMessage,
        conversationId: conversationId
      });

      console.log('KOE response:', response);

      if (response && response.data && response.data.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Update conversation ID for continuity
        if (response.data.conversation_id) {
          setConversationId(response.data.conversation_id);
        }
      } else if (response && response.data && response.data.error) {
        throw new Error(response.data.error);
      } else {
        throw new Error('Invalid response from chat service');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setInputMessage(currentMessage); // Restore the user's typed message
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't render if not open and not embedded
  if (!isOpen && !isEmbedded) return null;

  // Embedded version - Primary experience (no card wrapper, no header)
  if (isEmbedded) {
    return (
      <div className={`h-full flex flex-col ${className}`}>
        {/* Messages Area - Takes up most of the space */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto space-y-8 mb-8 custom-scrollbar px-4"
          style={{ minHeight: '500px' }}
        >
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className={`flex gap-6 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-2">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[75%] p-6 rounded-3xl ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'backdrop-blur-xl bg-black/60 border border-blue-500/30 text-gray-100'
                }`}>
                  {message.type === 'bot' ? (
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-4" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-white mb-3" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-blue-200 mb-2" {...props} />,
                          p: ({node, ...props}) => <p className="text-gray-100 leading-relaxed mb-3 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-100 space-y-1 mb-3" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-100 space-y-1 mb-3" {...props} />,
                          li: ({node, ...props}) => <li className="text-gray-100 leading-relaxed" {...props} />,
                          strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
                          em: ({node, ...props}) => <em className="text-blue-200 italic" {...props} />,
                          code: ({node, inline, ...props}) => 
                            inline ? (
                              <code className="bg-blue-500/20 text-blue-200 px-2 py-1 rounded text-sm font-mono" {...props} />
                            ) : (
                              <code className="block bg-black/40 border border-blue-500/30 text-blue-200 p-3 rounded-lg text-sm font-mono overflow-x-auto" {...props} />
                            ),
                          pre: ({node, ...props}) => <pre className="bg-black/40 border border-blue-500/30 p-4 rounded-lg overflow-x-auto mb-3" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-blue-200 mb-3" {...props} />,
                          a: ({node, ...props}) => <a className="text-blue-300 hover:text-blue-200 underline" {...props} />
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="leading-relaxed text-lg">
                      {message.content}
                    </p>
                  )}
                </div>

                {message.type === 'user' && (
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 mt-2">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-6 justify-start"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-2">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="backdrop-blur-xl bg-black/60 border border-blue-500/30 p-6 rounded-3xl">
                <div className="flex items-center gap-4 text-blue-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="flex-shrink-0 px-4">
          <div className="flex gap-4 items-end">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask KOE about music production, mixing, mastering, sound design..."
              className="flex-1 backdrop-blur-xl bg-black/60 border-blue-500/40 text-white placeholder-gray-400 text-lg py-4 px-6 rounded-2xl focus:border-blue-400 focus:ring-0 focus:ring-offset-0"
              disabled={false}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </Button>
          </div>

          {/* Context indicator */}
          {analysisContext && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-xl bg-blue-500/20 border border-blue-500/30 rounded-full">
                <Sparkles className="w-4 h-4 text-blue-300" />
                <span className="text-sm text-blue-300">
                  KOE can reference your latest analysis: {analysisContext.filename}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original floating version (kept for backward compatibility)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 w-96 h-[600px] z-50 shadow-2xl backdrop-blur-xl bg-black/90 border border-blue-500/30 rounded-2xl flex flex-col"
    >
      {/* Header for floating version */}
      <div className="flex-shrink-0 p-6 pb-4 border-b border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold">KOE</h3>
              <p className="text-blue-300 text-sm">AI Production Assistant</p>
            </div>
          </div>
          <div className="flex gap-2">
            {onMinimize && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMinimize}
                className="text-gray-400 hover:text-white w-8 h-8"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-4 p-4 custom-scrollbar"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-[80%] p-3 rounded-xl ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-black/50 border border-blue-500/20 text-gray-100'
              }`}>
                {message.type === 'bot' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p className="text-sm leading-relaxed mb-2 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside text-sm space-y-1 mb-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside text-sm space-y-1 mb-2" {...props} />,
                        strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
                        code: ({node, inline, ...props}) => 
                          inline ? (
                            <code className="bg-blue-500/20 text-blue-200 px-1 py-0.5 rounded text-xs font-mono" {...props} />
                          ) : (
                            <code className="block bg-black/40 border border-blue-500/30 text-blue-200 p-2 rounded text-xs font-mono overflow-x-auto" {...props} />
                          )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">
                    {message.content}
                  </p>
                )}
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-black/50 border border-blue-500/20 p-3 rounded-xl">
              <div className="flex items-center gap-2 text-blue-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-blue-500/20">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask KOE about sound design, mixing, mastering..."
            className="flex-1 bg-black/50 border-blue-500/30 text-white placeholder-gray-400"
            disabled={false}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Context indicator */}
        {analysisContext && (
          <div className="mt-2 text-xs text-blue-300/70 text-center">
            💡 KOE can reference your latest analysis: {analysisContext.filename}
          </div>
        )}
      </div>
    </motion.div>
  );
}