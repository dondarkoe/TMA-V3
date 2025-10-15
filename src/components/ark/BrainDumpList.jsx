import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Clock } from 'lucide-react';
import { UserBrainDumpEntry } from '@/api/entities';
import { formatDistanceToNow } from 'date-fns';

function BrainDumpEntryCard({ entry }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="backdrop-blur-xl bg-black/40 border border-orange-500/20 rounded-lg">
      <CardContent className="p-4">
        <p className="text-gray-200 whitespace-pre-wrap text-sm">{entry.content}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(entry.created_date), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className={`w-2 h-2 rounded-full ${entry.processing_status === 'pending' ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
             <span>{entry.processing_status}</span>
          </div>
        </div>
      </CardContent>
    </motion.div>
  );
}

export default function BrainDumpList() {
  const [isLoading, setIsLoading] = useState(true);
  const [pastEntries, setPastEntries] = useState([]);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const entries = await UserBrainDumpEntry.list('-created_date', 50);
      setPastEntries(entries);
    } catch (error) {
      console.error("Failed to load brain dump entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {isLoading ? (
        <div className="flex justify-center items-center h-full py-10">
          <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
        </div>
      ) : pastEntries.length > 0 ? (
        <div className="space-y-4">
          {pastEntries.map((e) => <BrainDumpEntryCard key={e.id} entry={e} />)}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-10">
          <p>Your brain dump is empty.</p>
          <p className="text-sm">Go to the ARK Content Assistant to start logging your thoughts.</p>
        </div>
      )}
    </div>
  );
}