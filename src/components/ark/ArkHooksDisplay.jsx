import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Loader2 } from "lucide-react";
import { generateInstantHooks } from "@/api/functions";

export default function ArkHooksDisplay({ payload }) {
  const initialHooks = payload?.hooks || {};
  const prompt = payload?.prompt || "New music promo idea";
  const [hooks, setHooks] = React.useState(initialHooks);
  const [loadingKey, setLoadingKey] = React.useState(null);

  const keys = ["hook1", "hook2", "hook3", "hook4", "hook5"];

  const handleRegen = async (key) => {
    setLoadingKey(key);
    try {
      const { data } = await generateInstantHooks({ request: prompt });
      if (data?.success && data?.hooks?.[key]) {
        setHooks((prev) => ({ ...prev, [key]: data.hooks[key] }));
      }
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-orange-500/20">
      <CardContent className="p-4 space-y-3">
        <div className="text-orange-300 font-semibold text-sm">Viral Hooks</div>
        <div className="grid gap-3">
          {keys.map((k, i) => (
            <div key={k} className="rounded-lg border border-white/10 p-3 bg-black/40">
              <div className="flex items-start justify-between gap-3">
                <div className="text-white text-sm leading-relaxed">
                  <span className="text-orange-300 font-medium mr-2">{i + 1}.</span>
                  {hooks[k] || "—"}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRegen(k)}
                  disabled={loadingKey === k}
                  className="shrink-0 border-orange-500/30 text-orange-200 hover:bg-orange-500/10"
                  title="Regenerate this hook"
                >
                  {loadingKey === k ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}