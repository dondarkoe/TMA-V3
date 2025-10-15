import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Loader2 } from "lucide-react";
import { generateContentScript } from "@/api/functions";

export default function ArkScriptDisplay({ payload }) {
  const initialScript = payload?.script || {};
  const prompt = payload?.prompt || "Story about releasing a new single";
  const [script, setScript] = React.useState(initialScript);
  const [loadingKey, setLoadingKey] = React.useState(null);

  const sections = [
    { key: "hook", label: "Hook" },
    { key: "situation", label: "Situation" },
    { key: "desire", label: "Desire" },
    { key: "conflict", label: "Conflict" },
    { key: "change", label: "Change" },
    { key: "result", label: "Result" }
  ];

  const handleRegen = async (key) => {
    setLoadingKey(key);
    try {
      const { data } = await generateContentScript({ request: prompt });
      if (data?.success && data?.script?.[key]) {
        setScript((prev) => ({ ...prev, [key]: data.script[key] }));
      }
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-orange-500/20">
      <CardContent className="p-4 space-y-3">
        <div className="text-orange-300 font-semibold text-sm">Script</div>
        <div className="space-y-3">
          {sections.map((s) => (
            <div key={s.key} className="rounded-lg border border-white/10 p-3 bg-black/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-orange-300 font-medium text-xs uppercase tracking-wide">{s.label}</div>
                  <div className="text-white text-sm leading-relaxed mt-1">{script[s.key] || "—"}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRegen(s.key)}
                  disabled={loadingKey === s.key}
                  className="shrink-0 border-orange-500/30 text-orange-200 hover:bg-orange-500/10"
                  title={`Regenerate ${s.label}`}
                >
                  {loadingKey === s.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}