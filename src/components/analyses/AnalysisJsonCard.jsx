import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalysisJsonCard({ data, title = "Analysis Report (JSON)" }) {
  // Defensive stringify with stable spacing
  const pretty = (() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return typeof data === "string" ? data : "Unable to render JSON.";
    }
  })();

  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30 shadow-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs md:text-sm leading-relaxed overflow-x-auto p-3 rounded-lg bg-slate-900/70 text-slate-100 border border-white/10">
{pretty}
        </pre>
      </CardContent>
    </Card>
  );
}