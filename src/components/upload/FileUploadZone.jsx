
import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FileAudio, Music } from "lucide-react";
import { motion } from "framer-motion";

export default function FileUploadZone({ onFileSelect, dragActive, fileInputRef }) {
  return (
    <div className="p-6 sm:p-8">
      <motion.div
        animate={dragActive ? { scale: 1.02 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 min-h-[300px] ${
          dragActive 
            ? "border-sky-400 bg-sky-500/10" 
            : "border-sky-500/30 hover:border-sky-500/50"
        }`}
      >
        <div className="p-8 sm:p-12 text-center flex flex-col justify-center h-full">
          <motion.div
            animate={dragActive ? { rotate: 10 } : { rotate: 0 }}
            transition={{ duration: 0.2 }}
            className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-6 rounded-full bg-sky-500/20 backdrop-blur-xl border border-sky-500/30 flex items-center justify-center"
          >
            <FileAudio className="w-6 h-6 sm:w-7 sm:h-7 text-sky-400" />
          </motion.div>
          
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-tight">
            Drop your audio files here
          </h3>
          <p className="text-gray-300 mb-6 max-w-md mx-auto text-sm sm:text-base px-4 sm:px-0 leading-relaxed">
            Upload WAV, MP3, or FLAC files for professional analysis.
          </p>
          
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".wav,.mp3,.flac,audio/*"
              onChange={onFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-sky-500 to-blue-600 text-white border-0 px-6 sm:px-8 py-3 text-base font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Choose Files
            </Button>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Music className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>WAV</span>
            </div>
            <div className="flex items-center gap-2">
              <Music className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>MP3</span>
            </div>
            <div className="flex items-center gap-2">
              <Music className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>FLAC</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
