
import React from 'react';
import { cn } from "@/lib/utils";

export default function TypingIndicator({ assistantName = "mikki" }) {
  const name = (assistantName || "mikki").toLowerCase();

  // Simple color theming per assistant for the bubble only
  const bubbleClasses = (() => {
    switch (name) {
      case 'mikki':
        return 'bg-white text-gray-900 border border-gray-300';
      case 'koe':
        return 'bg-gradient-to-r from-blue-900/90 to-blue-800/90 text-white border border-blue-400/30';
      case 'ark':
        return 'bg-gradient-to-r from-red-500/90 to-orange-500/90 text-white border border-red-400/30';
      case 'indi':
        return 'bg-gradient-to-r from-green-900/90 to-emerald-800/90 text-white border border-emerald-400/30';
      default:
        return 'bg-white text-gray-900 border border-gray-300';
    }
  })();

  const dotColor = name === 'mikki' ? 'bg-gray-500' : 'bg-white/80';

  return (
    <div className="flex justify-start">
      <div className={cn(
        "inline-flex items-center gap-1 rounded-2xl px-4 py-2.5",
        bubbleClasses
      )}>
        <div className="flex space-x-1">
          <div className={cn("w-2 h-2 rounded-full animate-bounce", dotColor)} style={{ animationDelay: '0ms' }} />
          <div className={cn("w-2 h-2 rounded-full animate-bounce", dotColor)} style={{ animationDelay: '150ms' }} />
          <div className={cn("w-2 h-2 rounded-full animate-bounce", dotColor)} style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
