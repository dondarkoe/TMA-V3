
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { FileAudio, X, Upload, Music } from "lucide-react";

export default function UploadedFilesList({ files, removeFile, onProcess }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="backdrop-blur-xl bg-black/40 border border-sky-500/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-sky-400" />
            Ready for Analysis ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-black/40 backdrop-blur-xl border border-sky-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-500/20 backdrop-blur-xl border border-sky-500/30 flex items-center justify-center">
                      <FileAudio className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white truncate max-w-64">{file.name}</p>
                      <p className="text-sm text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <Button
            onClick={onProcess}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white border-0 py-3 text-lg font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            disabled={files.length === 0}
          >
            <Music className="w-5 h-5 mr-2" />
            Start Analysis ({files.length} files)
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
