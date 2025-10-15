import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, AlertTriangle, Gauge } from "lucide-react";

function MetricBox({ label, value, sub, emphasis = false }) {
  return (
    <div className="p-3 rounded-lg border border-white/10 bg-white/5">
      <div className="text-xs text-white/60">{label}</div>
      <div className={`text-lg font-semibold ${emphasis ? "text-white" : "text-blue-200"}`}>
        {value ?? "N/A"}
      </div>
      {sub ? <div className="text-[10px] text-white/50 mt-0.5">{sub}</div> : null}
    </div>
  );
}

function TonalBar({ label, value }) {
  const val = typeof value === "number" ? Math.max(0, Math.min(1, value)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 text-xs text-white/60">{label}</div>
      <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
          style={{ width: `${val * 100}%` }}
        />
      </div>
      <div className="w-10 text-right text-xs text-white/70">{Math.round(val * 100)}%</div>
    </div>
  );
}

export default function InlineAnalysisReport({ audioFile }) {
  if (!audioFile) return null;

  const payload = audioFile?.analysis_result?.mixDiagnosisResults?.payload || {};
  const tonal = payload?.tonal_profile || {};
  const lufs = typeof payload?.integrated_loudness_lufs === "number" ? payload.integrated_loudness_lufs.toFixed(1) : "N/A";
  const peak = typeof payload?.peak_loudness_dbfs === "number" ? payload.peak_loudness_dbfs.toFixed(1) : "N/A";
  const drc = payload?.if_master_drc || "N/A";
  const clip = payload?.clipping || "N/A";
  const stereo = payload?.stereo_field || "N/A";

  const tempo = typeof audioFile?.librosa_tempo === "number" ? Math.round(audioFile.librosa_tempo) : (audioFile?.librosa_raw_data?.tempo ? Math.round(audioFile.librosa_raw_data.tempo) : null);
  const key = audioFile?.librosa_key || audioFile?.librosa_raw_data?.estimated_key || null;

  const bass = typeof tonal?.bass_frequency === "number" ? tonal.bass_frequency : null;
  const mid = typeof tonal?.mid_frequency === "number" ? tonal.mid_frequency : null;
  const high = typeof tonal?.high_frequency === "number" ? tonal.high_frequency : null;

  const status = audioFile?.analysis_status || "completed";
  const bad = status === "error";
  const fileName = audioFile?.filename || "Uploaded Track";

  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30 shadow-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-300" />
            Mix Analysis
          </CardTitle>
          <Badge className={`text-xs ${bad ? "bg-red-500/20 text-red-200 border border-red-500/30" : "bg-blue-500/20 text-blue-200 border border-blue-500/30"}`}>
            {status}
          </Badge>
        </div>
        <div className="text-xs text-white/60 mt-1">{fileName}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        {bad ? (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-sm text-red-200">
            <AlertTriangle className="w-4 h-4" />
            Analysis failed. Try again later.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricBox label="Overall Loudness" value={`${lufs} LUFS`} sub="Integrated" emphasis />
              <MetricBox label="Peak Level" value={`${peak} dBFS`} />
              <MetricBox label="Sound Balance" value={drc} />
              <MetricBox label="Clipping" value={clip} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <div className="text-xs text-white/60 mb-2 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-blue-300" />
                  Stereo & Tonal Profile
                </div>
                <div className="text-sm text-blue-200 mb-2">Stereo Field: <span className="text-white/80">{stereo}</span></div>
                <div className="space-y-2">
                  <TonalBar label="Bass" value={typeof bass === "number" ? bass : 0.33} />
                  <TonalBar label="Mid" value={typeof mid === "number" ? mid : 0.33} />
                  <TonalBar label="High" value={typeof high === "number" ? high : 0.33} />
                </div>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <div className="text-xs text-white/60 mb-2">Musical Insights</div>
                <div className="grid grid-cols-2 gap-3">
                  <MetricBox label="Tempo" value={tempo ? `${tempo} BPM` : "N/A"} />
                  <MetricBox label="Key" value={key || "N/A"} />
                </div>
                {audioFile?.librosa_brightness?.average ? (
                  <div className="mt-3 text-xs text-white/70">
                    Brightness: <span className="text-blue-200">{Math.round(audioFile.librosa_brightness.average)} Hz</span>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}