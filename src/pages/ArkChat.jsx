import React from 'react';
import EngineLayout from '../components/layout/EngineLayout';
import BrainDumpInterface from '../components/ark/BrainDumpInterface';

export default function ArkChatPage() {
  return (
    <EngineLayout 
      engineType="ARK" 
      currentPageName="ArkChat"
      defaultTool="chat"
    >
      <div className="w-full h-full flex flex-col p-6 md:p-8">
        {/* Page Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-3">
            ARK Creative Studio
          </h1>
          <p className="text-orange-300 text-lg font-medium">
            Transform ideas into viral content
          </p>
        </div>

        {/* Creative Studio Interface */}
        <div className="flex-1 max-w-4xl mx-auto w-full">
          <BrainDumpInterface />
        </div>
      </div>
    </EngineLayout>
  );
}