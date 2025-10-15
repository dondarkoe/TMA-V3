
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { FileAudio, Clock, TrendingUp, ExternalLink } from "lucide-react";

const statusColors = {
  completed: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  analyzing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  pending: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  error: "bg-red-500/20 text-red-300 border-red-500/30"
};

export default function RecentAnalyses({ audioFiles, isLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="backdrop-blur-xl bg-black/50 border border-amber-500/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileAudio className="w-5 h-5 text-amber-400" />
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-amber-500/10 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : audioFiles.length === 0 ? (
            <div className="text-center py-8">
              <FileAudio className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No analyses yet. Upload your first track!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {audioFiles.slice(0, 5).map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-black/40 backdrop-blur-xl border border-amber-500/20 hover:bg-amber-500/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 backdrop-blur-xl border border-amber-500/30 flex items-center justify-center">
                      <FileAudio className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white truncate max-w-48">{file.filename}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-3 h-3" />
                        {format(new Date(file.created_date), 'MMM d, yyyy')}
                        {file.analysis_result?.overall_score && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {file.analysis_result.overall_score}/100
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${statusColors[file.analysis_status]} font-medium`}>
                      {file.analysis_status}
                    </Badge>
                    {file.file_url && (
                      <a 
                        href={file.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-amber-400 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
