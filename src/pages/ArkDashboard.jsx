import React from 'react';
import EngineLayout from '../components/layout/EngineLayout';
import CreativeIntelligenceDashboard from '../components/ark/CreativeIntelligenceDashboard';

export default function ArkDashboardPage() {
  const handleCreateRecommendation = (insight) => {
    // When dashboard recommends CREATE mode, user can navigate to studio
    console.log('Dashboard recommends CREATE mode:', insight);
    // Could potentially show a call-to-action to go to Creative Studio
  };

  return (
    <EngineLayout 
      engineType="ARK" 
      currentPageName="ArkDashboard"
      defaultTool="dashboard"
    >
      <div className="w-full h-full flex flex-col p-6 md:p-8">
        {/* Page Header */}
        <div className="mb-8 sm:mb-12 flex-shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-4">
            Creative Intelligence Dashboard
          </h1>
          <p className="text-orange-300 text-lg font-medium">
            Your creative readiness analysis and next actions
          </p>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 min-h-0 max-w-7xl mx-auto w-full">
          <CreativeIntelligenceDashboard 
            onCreateRecommendation={handleCreateRecommendation}
          />
        </div>
      </div>
    </EngineLayout>
  );
}