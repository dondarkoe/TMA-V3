
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export default function GlowingChatbox({ onStartChat }) {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/15 rounded-full blur-2xl" />

      </div>

      <div className="relative z-10 w-full max-w-2xl mx-4 text-center">
        {/* Large KOE Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>

          <motion.div
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}>

            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/cd652a39e_dondarkoelogonew12.png"
              alt="KOE" className="mx-auto max-w-sm md:max-w-md lg:max-w-lg w-full h-auto object-contain"

              style={{
                filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))'
              }} />

          </motion.div>
        </motion.div>

        {/* Glowing Start Chat Button - Overlapping directly under logo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative -mt-8 md:-mt-12">

          {/* Animated glow border */}
          <motion.div
            animate={{
              boxShadow: [
              "0 0 20px rgba(100, 149, 237, 0.3)",
              "0 0 40px rgba(100, 149, 237, 0.6)",
              "0 0 20px rgba(100, 149, 237, 0.3)"]

            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }} className="bg-gradient-to-r mx-40 absolute inset-0 rounded-2xl from-slate-800/20 via-blue-500/20 to-slate-800/20 blur-sm" />


          
          {/* Main start chat button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative">

            <Button
              onClick={onStartChat}
              className="w-full backdrop-blur-xl bg-gradient-to-r from-slate-900/90 via-blue-600/80 to-black/90 hover:from-slate-800/95 hover:via-blue-500/85 hover:to-black/95 border border-blue-400/50 hover:border-blue-300/70 rounded-2xl p-3 md:p-4 text-base md:text-lg font-bold text-white shadow-2xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 30%, #3b82f6 50%, #1e3a8a 70%, #000000 100%)',
                boxShadow: '0 0 30px rgba(100, 149, 237, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}>

              <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Start Chatting with KOE
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>);

}