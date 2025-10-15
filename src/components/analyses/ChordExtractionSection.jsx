
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Music } from "lucide-react";
import { extractChordsMidi } from "@/api/functions";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function ChordExtractionSection({ analysis }) {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState(null);

  const [songName, setSongName] = React.useState("");
  const [tracks, setTracks] = React.useState({ chords: true, bass: true, melody: true });

  React.useEffect(() => {
    const defaultName = (analysis?.filename || "Unknown Song")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim() || "Unknown Song";
    setSongName(defaultName);
  }, [analysis?.filename]);

  const canExtract = Boolean(analysis?.tonn_readable_url);

  const selectedTracks = Object.entries(tracks)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const handleExtract = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const { data } = await extractChordsMidi({
      audioFileId: analysis.id,
      songName,
      includeTracks: selectedTracks.length ? selectedTracks : ["chords", "bass", "melody"]
    });
    if (data.success) {
      setResult(data);
    } else {
      setError(data.error || "Chord extraction failed");
    }
    setLoading(false);
  };

  const midiFiles = result?.midi_files || {};
  const hasParts = Boolean(midiFiles.chords || midiFiles.bass || midiFiles.melody);

  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center gap-2">
          <Music className="w-6 h-6 text-purple-400" />
          Chord Extraction & MIDI
        </CardTitle>
        <p className="text-purple-300 text-sm">
          Detect chords and download separate MIDI tracks (Chords, Bass, Melody) or a combined file.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Song Name (used in filenames)</label>
            <Input
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              placeholder="Enter song name"
              className="bg-black/40 border-purple-500/30 text-white placeholder:text-gray-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Include Tracks</label>
            <div className="flex flex-wrap gap-4 p-2 rounded-lg bg-black/30 border border-purple-500/20">
              {["chords", "bass", "melody"].map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm text-gray-200">
                  <Checkbox
                    checked={tracks[t]}
                    onCheckedChange={(v) => setTracks((prev) => ({ ...prev, [t]: Boolean(v) }))}
                  />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleExtract}
            disabled={!canExtract || loading || selectedTracks.length === 0}
            className="bg-gradient-to-r from-purple-500 to-blue-600 disabled:opacity-60"
          >
            {loading ? "Extracting..." : "Extract Chords to MIDI"}
          </Button>
          {!canExtract && (
            <span className="text-sm text-gray-400">
              Re-analyze this track to enable chord extraction.
            </span>
          )}
          {analysis?.librosa_key && (
            <Badge variant="outline" className="text-purple-300 border-purple-500/40">
              Key: {analysis.librosa_key}
            </Badge>
          )}
          {analysis?.librosa_tempo && (
            <Badge variant="outline" className="text-blue-300 border-blue-500/40">
              Tempo: {Math.round(analysis.librosa_tempo)} BPM
            </Badge>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {typeof result.total_chords === "number" && (
                <Badge className="bg-purple-600/30 text-purple-200">
                  Total Chords: {result.total_chords}
                </Badge>
              )}
              {result.tempo && (
                <Badge className="bg-blue-600/30 text-blue-200">
                  Detected Tempo: {Math.round(result.tempo)} BPM
                </Badge>
              )}
              {Array.isArray(result.tracks_included) && result.tracks_included.length > 0 && (
                <Badge className="bg-slate-600/30 text-slate-200">
                  Tracks: {result.tracks_included.join(", ")}
                </Badge>
              )}
            </div>

            {/* Download options - MIDI only */}
            <div className="flex flex-wrap gap-2">
              {hasParts && (
                <>
                  {midiFiles.chords?.download_url && (
                    <a href={midiFiles.chords.download_url} target="_blank" rel="noopener noreferrer" className="inline-flex">
                      <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Chords MIDI
                      </Button>
                    </a>
                  )}
                  {midiFiles.bass?.download_url && (
                    <a href={midiFiles.bass.download_url} target="_blank" rel="noopener noreferrer" className="inline-flex">
                      <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Bass MIDI
                      </Button>
                    </a>
                  )}
                  {midiFiles.melody?.download_url && (
                    <a href={midiFiles.melody.download_url} target="_blank" rel="noopener noreferrer" className="inline-flex">
                      <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Melody MIDI
                      </Button>
                    </a>
                  )}
                </>
              )}
              {result.combined_midi_url && (
                <a href={result.combined_midi_url} target="_blank" rel="noopener noreferrer" className="inline-flex">
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" /> Combined MIDI
                  </Button>
                </a>
              )}
            </div>

            {/* Removed: JSON download and chord progression details */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
