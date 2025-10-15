import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { testChordsFromPrompt } from '@/api/functions';
import { monitorSerenaderMetrics } from '@/api/functions';

const TEST_SCENARIOS = [
  { prompt: "Jazz chords in Bb major", type: "Basic Generation", difficulty: "Easy" },
  { prompt: "Sad progression in C minor", type: "Basic Generation", difficulty: "Easy" },
  { prompt: "What are the chords to Wonderwall?", type: "Song Lookup", difficulty: "Medium" },
  { prompt: "Complex jazz progression", type: "Advanced Generation", difficulty: "Hard" },
  { prompt: "Purple monkey bicycle", type: "Edge Case", difficulty: "Should Fail" },
  { prompt: "Give me some chords", type: "Vague Request", difficulty: "Medium" },
  { prompt: "Jazz-fusion progression in 7/8", type: "Complex Request", difficulty: "Hard" },
  { prompt: "", type: "Invalid Input", difficulty: "Should Fail" }
];

export default function SerenaderTesting() {
  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testSummary, setTestSummary] = useState(null);

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    setCurrentTestIndex(0);
    setTestSummary(null);

    try {
      const response = await testChordsFromPrompt({ run_all: true });
      
      if (response.data.success) {
        setTestResults(response.data.test_results);
        setTestSummary(response.data.summary);
      } else {
        console.error('Test run failed:', response.data.error);
      }
    } catch (error) {
      console.error('Failed to run tests:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const runSingleTest = async (scenarioIndex) => {
    setIsRunningTests(true);
    
    try {
      const response = await testChordsFromPrompt({ scenario_index: scenarioIndex });
      
      if (response.data.success && response.data.test_results.length > 0) {
        const result = response.data.test_results[0];
        setTestResults(prev => {
          const updated = [...prev];
          updated[scenarioIndex] = result;
          return updated;
        });
      }
    } catch (error) {
      console.error('Failed to run single test:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const loadMetrics = async (timeframe = '24h') => {
    setIsLoadingMetrics(true);
    
    try {
      const response = await monitorSerenaderMetrics();
      
      if (response.data.success) {
        setMetrics(response.data.metrics);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const getStatusIcon = (result) => {
    if (!result) return <Clock className="w-4 h-4 text-gray-400" />;
    if (result.success && !result.validation_error) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (result) => {
    if (!result) return 'bg-gray-100 text-gray-600';
    if (result.success && !result.validation_error) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const formatResponseTime = (ms) => {
    if (ms > 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${ms}ms`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            KOE Serenader Testing Dashboard
          </h1>
          <p className="text-gray-300">
            Comprehensive testing and monitoring for the smart chord generation system
          </p>
        </div>

        {/* Control Panel */}
        <Card className="mb-8 backdrop-blur-xl bg-black/50 border border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TestTube className="w-5 h-5 text-blue-400" />
              Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={runAllTests}
                disabled={isRunningTests}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunningTests ? (
                  <>Running Tests...</>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => loadMetrics('24h')}
                disabled={isLoadingMetrics}
                variant="outline"
                className="border-blue-500/30 text-blue-300"
              >
                {isLoadingMetrics ? 'Loading...' : 'Refresh Metrics'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Summary */}
        {testSummary && (
          <Card className="mb-8 backdrop-blur-xl bg-black/50 border border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                Test Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {testSummary.passed}
                  </div>
                  <div className="text-sm text-gray-400">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {testSummary.failed}
                  </div>
                  <div className="text-sm text-gray-400">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {formatResponseTime(testSummary.average_response_time)}
                  </div>
                  <div className="text-sm text-gray-400">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.round(testSummary.parsing_accuracy * 100)}%
                  </div>
                  <div className="text-sm text-gray-400">Parse Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Scenarios */}
        <Card className="mb-8 backdrop-blur-xl bg-black/50 border border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white">Test Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {TEST_SCENARIOS.map((scenario, index) => {
                const result = testResults[index];
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(result)}
                        <span className="text-white font-medium">
                          {scenario.prompt || '(Empty prompt)'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {scenario.type}
                        </Badge>
                        <Badge className={`text-xs ${
                          scenario.difficulty === 'Should Fail' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {scenario.difficulty}
                        </Badge>
                      </div>
                      
                      {result && (
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>Response: {formatResponseTime(result.response_time_ms)}</span>
                          <span>Chords: {result.chord_count}</span>
                          <span>Confidence: {result.parsing_confidence}</span>
                          {result.validation_error && (
                            <span className="text-red-400">⚠ {result.validation_error}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {result && (
                        <Badge className={getStatusColor(result)}>
                          {result.success && !result.validation_error ? 'PASS' : 'FAIL'}
                        </Badge>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runSingleTest(index)}
                        disabled={isRunningTests}
                        className="border-blue-500/30 text-blue-300"
                      >
                        Test
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Metrics Dashboard */}
        {metrics && (
          <Card className="backdrop-blur-xl bg-black/50 border border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Usage Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Usage</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Requests</span>
                      <span className="text-white">{metrics.usage.total_requests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Unique Users</span>
                      <span className="text-white">{metrics.usage.unique_users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Success Rate</span>
                      <span className="text-green-400">
                        {metrics.usage.total_requests > 0 
                          ? Math.round((metrics.usage.successful_requests / metrics.usage.total_requests) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Response</span>
                      <span className="text-white">
                        {formatResponseTime(metrics.performance.average_response_time_ms)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">P95 Response</span>
                      <span className="text-white">
                        {formatResponseTime(metrics.performance.p95_response_time_ms)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Timeout Rate</span>
                      <span className={metrics.performance.timeout_rate > 5 ? 'text-red-400' : 'text-green-400'}>
                        {metrics.performance.timeout_rate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quality Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Quality</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Parse Success</span>
                      <span className="text-green-400">{metrics.quality.parsing_success_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">High Confidence</span>
                      <span className="text-blue-400">{metrics.quality.high_confidence_parsing_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Web Search Success</span>
                      <span className="text-purple-400">{metrics.quality.web_search_success_rate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Summary */}
              {Object.values(metrics.errors).some(count => count > 0) && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    Recent Errors
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(metrics.errors).map(([errorType, count]) => (
                      count > 0 && (
                        <div key={errorType} className="flex justify-between">
                          <span className="text-gray-400 capitalize">
                            {errorType.replace(/_/g, ' ')}
                          </span>
                          <span className="text-orange-400">{count}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}