import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MixComparisons } from "@/api/entities";
import ComparisonResults from "@/components/analyses/ComparisonResults";
import { Loader2 } from "lucide-react";

function ChatComparisonCardInner({ comparisonId, filenameA, filenameB }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (comparison || loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await MixComparisons.get(comparisonId);
      setComparison(data);
    } catch (e) {
      setError("Failed to load report. Try again.");
    } finally {
      setLoading(false);
    }
  }, [comparison, loading, comparisonId]);

  const onToggle = async () => {
    if (!open && !comparison && !loading) {
      await load();
    }
    setOpen((v) => !v);
  };

  return (
    <div className="w-full">
      <div className="p-4 rounded-2xl bg-blue-900/30 border border-blue-500/30 text-white">
        <div className="text-sm text-blue-100 mb-3">
          Mix comparison ready: {filenameA} vs {filenameB}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onToggle}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading…
              </>
            ) : open ? "Hide Report" : "View Report"}
          </Button>
          {error && <span className="text-xs text-red-300">{error}</span>}
        </div>
      </div>

      {open && comparison && (
        <div className="mt-4">
          <ComparisonResults comparison={comparison} inline={true} onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

const ChatComparisonCard = React.memo(ChatComparisonCardInner);
export default ChatComparisonCard;