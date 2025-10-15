import React, { useState } from 'react';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Play, FileText, AlertTriangle } from 'lucide-react';

export default function YoutubeTestPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('https://youtu.be/2kg0wzKC1jI?si=dbM2SzVv0fUw4tRX');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTest = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    if (!youtubeUrl) {
      setError('Please enter a YouTube URL.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Starting YouTube transcript test for:', youtubeUrl);
      
      const response = await InvokeLLM({
        prompt: `
          Please access the YouTube video at this URL: ${youtubeUrl}
          
          Extract the following information:
          1. Video title
          2. Channel name
          3. Video duration if available
          4. The complete transcript/captions if available
          5. If no transcript is available, provide a detailed summary of the video content
          
          Return this information in the specified JSON format.
        `,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            video_title: { type: "string" },
            channel_name: { type: "string" },
            duration: { type: "string" },
            transcript_available: { type: "boolean" },
            transcript_or_summary: { type: "string" },
            content_type: { type: "string", description: "Either 'transcript' or 'summary'" },
            video_topic: { type: "string", description: "Main topic/subject of the video" }
          },
          required: ["video_title", "channel_name", "transcript_or_summary", "content_type"]
        }
      });

      console.log('LLM Response:', response);
      setResult(response);

    } catch (err) {
      console.error('Error testing YouTube transcription:', err);
      setError(`Failed to process video: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="backdrop-blur-xl bg-black/60 border border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-3">
              <Play className="w-6 h-6 text-red-500" />
              YouTube Transcript Test
            </CardTitle>
            <p className="text-gray-300">Test the InvokeLLM integration's ability to extract YouTube video transcripts</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-white font-medium">YouTube URL:</label>
              <Input
                type="url"
                placeholder="Enter YouTube Video URL"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                disabled={isLoading}
              />
            </div>

            <Button 
              onClick={handleTest} 
              disabled={isLoading || !youtubeUrl.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Video...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Extract Transcript/Summary
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="space-y-4">
                <Card className="border-green-500/50 bg-green-500/10">
                  <CardHeader>
                    <CardTitle className="text-green-300 text-lg">Video Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-gray-400 font-medium">Title:</span>
                      <p className="text-white">{result.video_title}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium">Channel:</span>
                      <p className="text-white">{result.channel_name}</p>
                    </div>
                    {result.duration && (
                      <div>
                        <span className="text-gray-400 font-medium">Duration:</span>
                        <p className="text-white">{result.duration}</p>
                      </div>
                    )}
                    {result.video_topic && (
                      <div>
                        <span className="text-gray-400 font-medium">Topic:</span>
                        <p className="text-white">{result.video_topic}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400 font-medium">Content Type:</span>
                      <p className="text-white capitalize">
                        {result.content_type}
                        {result.transcript_available !== undefined && (
                          <span className="ml-2 text-sm">
                            ({result.transcript_available ? 'Transcript Available' : 'Summary Only'})
                          </span>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-500/50 bg-blue-500/10">
                  <CardHeader>
                    <CardTitle className="text-blue-300 text-lg">
                      {result.content_type === 'transcript' ? 'Transcript' : 'Video Summary'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto bg-black/40 p-4 rounded border border-gray-600">
                      <pre className="whitespace-pre-wrap text-gray-100 text-sm leading-relaxed">
                        {result.transcript_or_summary}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-500/50 bg-gray-500/10">
                  <CardHeader>
                    <CardTitle className="text-gray-300 text-lg">Raw Response (Debug)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-48 overflow-y-auto bg-black/40 p-4 rounded border border-gray-600">
                      <pre className="text-gray-400 text-xs">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}