
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { User as UserIcon, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ArkHooksDisplay from "../ark/ArkHooksDisplay";
import ArkScriptDisplay from "../ark/ArkScriptDisplay";
import { default as ComparisonResults } from "../compare/ComparisonResults"; // Kept existing import path
import AnalysisJsonCard from "../analyses/AnalysisJsonCard";
import InlineAnalysisReport from "../analyses/InlineAnalysisReport";
import MikkiVideoAnalysisReport from "../analyses/MikkiVideoAnalysisReport";
import KoeChordsDisplay from '../koe/KoeChordsDisplay';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ChatComparisonCard from "@/components/compare/ChatComparisonCard";

// Define logo URLs
const logoUrls = {
  // Updated URLs to match known-good ones used in the header
  koe: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/f2c69589f_koelogo2.png", // Updated as per outline
  ark: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/92f478df4_arklogo2.png",
  indi: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/f62478df4_indilogo2.png",
  mikki: "" // No logo for MIKKI yet, will fallback to initial - Updated as per outline
};

// NEW: FunctionDisplay component for rendering tool calls
const FunctionDisplay = ({ toolCall }) => {
  if (!toolCall || !toolCall.function) return null;
  const functionName = toolCall.function.name;
  let functionArgs = toolCall.function.arguments;

  try {
    functionArgs = JSON.parse(functionArgs);
  } catch (e) {
    // If it's not valid JSON, keep it as a string
  }

  return (
    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
      <p className="font-semibold text-gray-700 dark:text-gray-300">Calling: {functionName}</p>
      {functionArgs && (
        <pre className="whitespace-pre-wrap break-all text-[11px] mt-1 p-2 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-100 dark:border-gray-800">
          {typeof functionArgs === 'object' ? JSON.stringify(functionArgs, null, 2) : String(functionArgs)}
        </pre>
      )}
    </div>
  );
};


export default function MessageBubble({ message }) {
  // Add local fallback state for broken images
  const [imgError, setImgError] = useState(false);

  // Removed noisy console logs that caused activity monitor spam

  try {
    const isUser = message.role === "user";
    const assistantName = message.assistant_name?.toLowerCase();

    // Helper: safe JSON parse
    const safeParseJson = (val) => {
      try {
        if (typeof val === "string") {
          const s = val.trim();
          if (!s.startsWith("{") && !s.startsWith("[")) return null;
          return JSON.parse(s);
        }
        if (typeof val === "object" && val !== null) return val;
        return null;
      } catch {
        return null;
      }
    };

    // NEW: lightweight client-side repair to avoid plain text fallback
    const tryParseJsonRepair = (raw) => {
      if (raw && typeof raw === "object") return raw;
      if (typeof raw !== "string") return null;
      let s = raw.trim().replace(/```json|```/g, "");
      try { return JSON.parse(s); } catch {}
      const lastBrace = s.lastIndexOf("}");
      if (lastBrace > -1) {
        const truncated = s.slice(0, lastBrace + 1);
        try { return JSON.parse(truncated); } catch {}
      }
      return null;
    };

    // Helper to parse content safely (as per outline)
    const parseContent = (content) => {
      try {
        if (typeof content === 'string') {
          return JSON.parse(content);
        }
        return content; // If already an object, return it
      } catch (e) {
        console.warn("Failed to parse message content as JSON:", content);
        return null;
      }
    };

    // Define assistant-specific glassmorphic colors with reduced opacity
    const getAssistantColors = (name) => {
      switch (name) {
        case 'mikki':
          return {
            bg: 'bg-gradient-to-br from-gray-700/20 via-black/10 to-gray-700/20 backdrop-blur-xl',
            border: 'border-gray-400/40',
            text: 'text-white',
            nameColor: 'text-gray-200',
            iconBg: 'bg-gray-700/30 backdrop-blur-sm',
            shadow: 'shadow-2xl shadow-gray-500/10'
          };
        case 'koe':
          return {
            bg: 'bg-gradient-to-br from-blue-900/20 via-black/10 to-blue-900/20 backdrop-blur-xl',
            border: 'border-blue-400/40',
            text: 'text-white',
            nameColor: 'text-blue-200',
            iconBg: 'bg-blue-900/30 backdrop-blur-sm',
            shadow: 'shadow-2xl shadow-blue-500/15'
          };
        case 'ark':
          return {
            bg: 'bg-gradient-to-br from-red-500/20 via-black/10 to-orange-500/20 backdrop-blur-xl',
            border: 'border-red-400/40',
            text: 'text-white',
            nameColor: 'text-red-100',
            iconBg: 'bg-red-600/30 backdrop-blur-sm',
            shadow: 'shadow-2xl shadow-orange-500/15'
          };
        case 'indi':
          return {
            bg: 'bg-gradient-to-br from-green-900/20 via-black/10 to-emerald-800/20 backdrop-blur-xl',
            border: 'border-emerald-400/40',
            text: 'text-white',
            nameColor: 'text-emerald-200',
            iconBg: 'bg-green-800/30 backdrop-blur-sm',
            shadow: 'shadow-2xl shadow-emerald-500/15'
          };
        default:
          // Default fallback for unknown assistants
          return {
            bg: 'bg-gradient-to-br from-gray-700/20 via-black/10 to-gray-700/20 backdrop-blur-xl',
            border: 'border-gray-400/40',
            text: 'text-white',
            nameColor: 'text-gray-200',
            iconBg: 'bg-gray-700/30 backdrop-blur-sm',
            shadow: 'shadow-2xl shadow-gray-500/10'
          };
      }
    };

    // Enhanced name badge classes with reduced opacity
    const getNameBadgeClasses = (name) => {
      switch (name) {
        case 'mikki':
          return 'bg-gradient-to-r from-gray-600/40 via-gray-500/20 to-gray-600/40 text-gray-100 border border-gray-300/40 shadow-lg backdrop-blur-md';
        case 'koe':
          return 'bg-gradient-to-r from-blue-800/40 via-blue-700/20 to-blue-800/40 text-blue-100 border border-blue-400/50 shadow-lg backdrop-blur-md shadow-[0_0_10px_rgba(37,99,235,0.25)]';
        case 'ark':
          return 'bg-gradient-to-r from-red-500/40 via-orange-500/20 to-red-500/40 text-white border border-white/30 shadow-lg backdrop-blur-md shadow-[0_0_10px_rgba(249,115,22,0.25)]';
        case 'indi':
          return 'bg-gradient-to-r from-emerald-700/40 via-emerald-600/20 to-emerald-700/40 text-emerald-100 border border-emerald-400/50 shadow-lg backdrop-blur-md shadow-[0_0_10px_rgba(16,185,129,0.25)]';
        default:
          return 'bg-gradient-to-r from-gray-600/40 via-gray-500/20 to-gray-600/40 text-gray-100 border border-gray-300/40 shadow-lg backdrop-blur-md';
      }
    };

    // Removed additional "MessageBubble render" console.log spam here

    // NEW: minimal, pure rendering for mix comparison reference
    if (message?.messageType === "mix_comparison_ref") {
      let payload = null;
      try {
        payload = typeof message.content === "string" ? JSON.parse(message.content) : message.content;
      } catch {
        payload = null;
      }
      const comparisonId = payload?.comparison_id || payload?.id;
      const filenameA = payload?.filenameA || "Mix A";
      const filenameB = payload?.filenameB || "Mix B";

      return (
        <div className="flex justify-start mb-4 w-full">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1 p-2">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/cd652a39e_dondarkoelogonew12.png"
              alt="KOE"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="max-w-[85%] md:max-w-[75%] w-full">
            {comparisonId ? (
              <ChatComparisonCard
                comparisonId={comparisonId}
                filenameA={filenameA}
                filenameB={filenameB}
              />
            ) : (
              <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-500/40 text-white">
                <p className="text-gray-300">Report reference missing.</p>
              </div>
            )}
            <div className="mt-2 ml-2 text-[10px] text-white/60">
              KOE • {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      );
    }

    // DISABLED: All mix comparison rendering removed
    if (message.messageType === 'mix_comparison' || message.isComparisonReady || message.messageType === 'safe_mix_comparison') {
      return (
        <div className="flex justify-start mb-4 w-full">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1 p-2">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/cd652a39e_dondarkoelogonew12.png" alt="KOE" className="w-full h-full object-contain" />
          </div>
          <div className="max-w-[85%] md:max-w-[75%] w-full">
            <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-500/40 text-white">
              <p className="text-gray-300">Mix comparison feature temporarily disabled</p>
            </div>
          </div>
        </div>
      );
    }

    // Prefer rich analysis card for single mix analysis
    if (message) {
      const parsed = safeParseJson(message.content);
      const isAnalysisMsg =
        message.messageType === "analysis_report" ||
        (parsed && (parsed.analysis_result?.mixDiagnosisResults?.payload || parsed.analysis_status || parsed.tonn_readable_url));

      if (isAnalysisMsg && parsed) {
        // Optional: expose raw JSON toggle via details/summary to avoid state
        return (
          <div className="flex justify-start mb-4 w-full">
            <div className="max-w-[85%] md:max-w-[75%] w-full space-y-2">
              <InlineAnalysisReport audioFile={parsed} />
              <details className="mt-1">
                <summary className="text-[11px] text-white/60 cursor-pointer hover:text-white">
                  View raw JSON
                </summary>
                <div className="mt-2">
                  <AnalysisJsonCard data={parsed} title="Raw Analysis JSON" />
                </div>
              </details>
              <div className="mt-2 text-[10px] text-white/60">
                {(message.assistant_name || "KOE")} • {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        );
      }
    }

    // Robust ARK Hooks render: only intercept if payload parses OK; otherwise fall through
    if (message.messageType === 'ark_hooks') {
      const payload = parseContent(message.content); // Using new parseContent helper
      if (payload && payload.hooks) {
        return (
          <div className="flex justify-start mb-4">
            <div className="max-w-[85%] md:max-w-[75%] w-full">
              <ArkHooksDisplay payload={payload} />
              <div className="mt-2 text-[10px] text-white/60">
                ARK • {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        );
      }
      // else: let it fall through to default rendering below
    }

    // Robust ARK Script render: only intercept if payload parses OK; otherwise fall through
    if (message.messageType === 'ark_script') {
      const payload = parseContent(message.content); // Using new parseContent helper
      if (payload && payload.script) {
        return (
          <div className="flex justify-start mb-4">
            <div className="max-w-[85%] md:max-w-[75%] w-full">
              <ArkScriptDisplay payload={payload} />
              <div className="mt-2 text-[10px] text-white/60">
                ARK • {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        );
      }
      // else: fall through to default rendering
    }

    // Render Koe Chords rich card if messageType indicates chord data
    if (message.messageType === 'koe_chords') {
      const payload = parseContent(message.content); // Using new parseContent helper
      if (payload && payload.result && payload.parameters) {
        return (
          <div className="max-w-2xl mx-auto w-full"> {/* Updated wrapper styling as per outline */}
             <KoeChordsDisplay payload={payload} />
             <div className="mt-2 text-[10px] text-white/60 text-right">
                KOE • {new Date(message.timestamp).toLocaleTimeString()}
              </div>
          </div>
        );
      }
    }

    // Render MIKKI video analysis structured JSON (never fall through to plain text)
    if (message.messageType === 'mikki_video_analysis') {
      const payload = tryParseJsonRepair(message.content);
      return (
        <div className="flex justify-start mb-4 w-full">
          <div className="max-w-[85%] md:max-w-[75%] w-full space-y-2">
            {payload ? (
              <MikkiVideoAnalysisReport report={payload} />
            ) : (
              <Alert className="bg-yellow-500/10 border-yellow-500/30 text-yellow-200">
                <AlertDescription className="text-xs">
                  The analysis was received but couldn&apos;t be parsed into a report. Please re-run the analysis.
                </AlertDescription>
              </Alert>
            )}
            <div className="mt-2 text-[10px] text-white/60">
              {(message.assistant_name || "MIKKI")} • {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      );
    }

    // Enhanced fallback: auto-upgrade MIKKI analysis messages (no messageType) that look like our new JSON structure
    if (!message.messageType && assistantName === 'mikki') {
      const payload = tryParseJsonRepair(message.content);
      const looksLikeVideoAnalysis =
        payload &&
        typeof payload === 'object' &&
        (payload.performance || payload.storytelling || payload.framing || payload.lighting || payload.audio || payload.summary);

      if (looksLikeVideoAnalysis) {
        return (
          <div className="flex justify-start mb-4 w-full">
            <div className="max-w-[85%] md:max-w-[75%] w-full space-y-2">
              <MikkiVideoAnalysisReport report={payload} />
              <div className="mt-2 text-[10px] text-white/60">
                {(message.assistant_name || "MIKKI")} • {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        );
      }

      // Keep the old fallback for legacy video analysis format
      const looksLikeLegacyVideoAnalysis =
        payload &&
        typeof payload === 'object' &&
        (payload.scores || payload.pacing_length || payload.hook_rewrites || payload.hook_issues || payload.verdict_10s);

      if (looksLikeLegacyVideoAnalysis) {
        return (
          <div className="flex justify-start mb-4 w-full">
            <div className="max-w-[85%] md:max-w-[75%] w-full space-y-2">
              <MikkiVideoAnalysisReport report={payload} />
              <div className="mt-2 text-[10px] text-white/60">
                {(message.assistant_name || "MIKKI")} • {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        );
      }
    }

    const assistantColors = getAssistantColors(assistantName);

    return (
      <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
        {!isUser && (
          <div className={cn(
            "h-7 w-7 rounded-lg flex items-center justify-center mt-0.5 overflow-hidden",
            assistantColors.iconBg
          )}>
            {/* Show image if available and not errored; otherwise show fallback initial */}
            {logoUrls[assistantName] && !imgError ? (
              <img
                src={logoUrls[assistantName]}
                alt={`${assistantName || 'assistant'} logo`}
                className="w-full h-full object-contain"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <span className="text-[10px] font-bold text-white/80">
                {(assistantName || 'ai').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}

        <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
          {/* Assistant name label - enhanced glassmorphism with reduced opacity */}
          {!isUser && message.assistant_name && (
            <div className={cn(
              "mb-2 px-3 py-1 rounded-full text-xs font-medium",
              getNameBadgeClasses(assistantName)
            )}>
              {message.assistant_name}
            </div>
          )}

          {message.content && (
            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 border",
                isUser
                  ? "bg-gradient-to-r from-slate-800/60 via-black/20 to-slate-800/60 backdrop-blur-xl text-white border-slate-400/40 shadow-2xl shadow-slate-500/10"
                  : `${assistantColors.bg} ${assistantColors.border} ${assistantColors.shadow}`
              )}
            >
              {isUser ? (
                <p className="text-sm leading-relaxed">{message.content}</p>
              ) : (
                <ReactMarkdown
                  // Merged existing assistant-specific prose classes with new generic text-sm and margin utilities
                  className={cn(
                    "prose prose-sm max-w-none text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
                    'prose-invert' // All assistants now use invert since they all have dark backgrounds
                  )}
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-3">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold my-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold my-2">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-none pl-2 space-y-2 my-3">{children}</ul>,
                    li: ({ children }) => (
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-blue-300">∙</span>
                        <span className="flex-1">{children}</span>
                      </li>
                    ),
                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                    a: ({ node, ...props }) => <a className="text-blue-300 hover:text-blue-200" {...props} />,
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="relative group/code my-3">
                          <pre className="bg-black/40 text-white/80 rounded-lg p-3 text-xs overflow-x-auto">
                            <code className={className} {...props}>{children}</code>
                          </pre>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/code:opacity-100 bg-slate-800 hover:bg-slate-700"
                            onClick={() => {
                              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                              toast.success('Code copied!'); // Uses sonner toast
                            }}
                          >
                            <Copy className="h-3 w-3 text-slate-400" />
                          </Button>
                        </div>
                      ) : (
                        <code className="bg-black/30 text-blue-300 px-1.5 py-0.5 rounded-md text-xs" {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          )}

          {/* Render tool calls using the new FunctionDisplay component */}
          {message.tool_calls?.length > 0 && (
            <div className="space-y-1">
              {message.tool_calls.map((toolCall, idx) => (
                <FunctionDisplay key={idx} toolCall={toolCall} />
              ))}
            </div>
          )}

          {/* Timestamp */}
          {!isUser && (
            <div className="mt-2 text-[10px] text-white/60">
              {message.assistant_name || 'Assistant'} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
          )}
          {isUser && (
            <div className="mt-2 text-[10px] text-white/60">
              You • {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>

        {isUser && (
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-white/90 via-gray-100/70 to-white/90 border border-white/30 backdrop-blur-sm shadow-lg flex items-center justify-center mt-0.5">
            <UserIcon className="w-4 h-4 text-gray-700" />
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("MessageBubble: CRITICAL RENDER ERROR", error, "Message was:", message);
    return (
       <div key={message?.id + '-critical-error'} className="flex justify-start mb-4 w-full">
            <div className="p-4 rounded-2xl bg-red-900/80 border border-red-500/60 text-white w-full">
              <p className="font-bold text-red-200 mb-1 text-lg">Critical Rendering Error</p>
              <p className="text-sm text-red-200 mb-2">This message could not be displayed due to an unexpected error. This is a bug.</p>
              <pre className="bg-black/50 p-2 rounded text-xs text-red-300 overflow-auto">
                {error.message}
              </pre>
            </div>
        </div>
    )
  }
}
