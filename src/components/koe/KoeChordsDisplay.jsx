
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Download, Music, Plus, Minus, Loader2, Play, Volume2 } from 'lucide-react';
import { exportMidi } from '@/api/functions';
import { toast } from "sonner";
import { cn } from '@/lib/utils';

// Simplified chord-to-note mapping for frontend playback
const chordToNotes = {
  'C': [60, 64, 67], 'Cmaj': [60, 64, 67],
  'D': [62, 66, 69], 'Dmaj': [62, 66, 69],
  'E': [64, 68, 71], 'Emaj': [64, 68, 71],
  'F': [65, 69, 72], 'Fmaj': [65, 69, 72],
  'G': [67, 71, 74], 'Gmaj': [67, 71, 74],
  'A': [69, 73, 76], 'Amaj': [69, 73, 76],
  'B': [71, 75, 78], 'Bmaj': [71, 75, 78],
  'Cm': [60, 63, 67], 'Am': [69, 72, 76], 'Dm': [62, 65, 69],
  'Em': [64, 67, 71], 'Fm': [65, 68, 72], 'Gm': [67, 70, 74],
  'Bm': [71, 74, 78],
  'Cmaj7': [60, 64, 67, 71], 'C7': [60, 64, 67, 70],
  'Dmaj7': [62, 66, 69, 73], 'D7': [62, 66, 69, 72],
  'Emaj7': [64, 68, 71, 75], 'E7': [64, 68, 71, 74],
  'Fmaj7': [65, 69, 72, 76], 'F7': [65, 69, 72, 75],
  'Gmaj7': [67, 71, 74, 78], 'G7': [67, 71, 74, 77],
  'Amaj7': [69, 73, 76, 80], 'A7': [69, 73, 76, 79],
  'Bmaj7': [71, 75, 78, 82], 'B7': [71, 75, 78, 81],
  'Cm7': [60, 63, 67, 70], 'Dm7': [62, 65, 69, 72],
  'Em7': [64, 67, 71, 74], 'Fm7': [65, 68, 72, 75],
  'Gm7': [67, 70, 74, 77], 'Am7': [69, 72, 76, 79],
  'Bm7b5': [71, 74, 77, 81],
  'C#': [61, 65, 68], 'Db': [61, 65, 68],
  'D#': [63, 67, 70], 'Eb': [63, 67, 70],
  'F#': [66, 70, 73], 'Gb': [66, 70, 73],
  'G#': [68, 72, 75], 'Ab': [68, 72, 75],
  'A#': [70, 74, 77], 'Bb': [70, 74, 77],
  'C#m': [61, 64, 68], 'Dbm': [61, 64, 68],
  'D#m': [63, 66, 70], 'Ebm': [63, 66, 70],
  'F#m': [66, 69, 73], 'Gbm': [66, 69, 73],
  'G#m': [68, 71, 75], 'Abm': [68, 71, 75],
  'A#m': [70, 73, 77], 'Bbm': [70, 73, 77],
  'Cadd9': [60, 64, 67, 74], 'Csus2': [60, 62, 67], 'Csus4': [60, 65, 67],
  'Dsus2': [62, 64, 69], 'Dsus4': [62, 67, 69], 'Dadd9': [62, 66, 69, 76],
  'Gsus4': [67, 72, 74], 'Asus4': [69, 74, 76]
};

const getNotesForSymbol = (symbol) => {
    return chordToNotes[symbol] || chordToNotes[symbol.replace(/maj$/, '')] || chordToNotes[symbol.replace(/Minor$/, 'm')] || [60, 64, 67];
};

let audioContext;
const getAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser");
      return null;
    }
  }
  return audioContext;
};

function playChord(notes) {
  const context = getAudioContext();
  if (!context) return;
  
  if (context.state === 'suspended') {
    context.resume();
  }

  const masterGain = context.createGain();
  masterGain.gain.value = 0.3; // Lower the volume to avoid clipping
  masterGain.connect(context.destination);

  const now = context.currentTime;
  
  notes.forEach(note => {
    const osc = context.createOscillator();
    const gainNode = context.createGain();
    
    osc.type = 'sine'; // A soft, clean tone
    osc.frequency.setValueAtTime(440 * Math.pow(2, (note - 69) / 12), now);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.02); // Quick fade in
    gainNode.gain.linearRampToValueAtTime(0, now + 1.0); // Fade out over 1 second

    osc.connect(gainNode);
    gainNode.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + 1.2);
  });
}

function applyInversion(notes, inversion) {
  const invertedNotes = [...notes];
  for (let i = 0; i < inversion; i++) {
    if (invertedNotes.length > 0) {
      const noteToShift = invertedNotes.shift();
      invertedNotes.push(noteToShift + 12);
    }
  }
  return invertedNotes;
}

export default function KoeChordsDisplay({ payload }) {
  const { result, parameters } = payload;
  const { progression, roman_numerals, explanation, tips, variations } = result || {};
  const { genre, key, mood } = parameters || {};
  
  const initialProgression = (progression || []).map(p => ({
      symbol: typeof p === 'object' ? p.symbol : p,
      inversion: 0
  }));

  const [currentProgression, setCurrentProgression] = useState(initialProgression);
  const [bpm, setBpm] = useState(120);
  const [octaveShift, setOctaveShift] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleInversionChange = (chordIndex) => {
    setCurrentProgression(prev => 
      prev.map((chord, index) => {
        if (index === chordIndex) {
          // Cycle through inversions: 0, 1, 2
          const newInversion = (chord.inversion + 1) % 3;
          return { ...chord, inversion: newInversion };
        }
        return chord;
      })
    );
  };
  
  const handlePlayChord = (chord, inversion) => {
    const baseNotes = getNotesForSymbol(chord);
    const invertedNotes = applyInversion(baseNotes, inversion);
    const finalNotes = invertedNotes.map(n => n + (octaveShift * 12));
    playChord(finalNotes);
  };

  const handleDownloadMidi = async () => {
    setIsDownloading(true);
    try {
      // Pass the full progression object array to the backend
      const { data } = await exportMidi({
        progression: currentProgression, // Send the array of objects with inversions
        bpm,
        octaveShift,
        key: key || 'C Major',
        genre: genre || 'Pop'
      });

      if (data && data.success && data.file_url) {
        window.open(data.file_url, '_blank');
        toast.success("MIDI file generated!", { description: data.filename });
      } else {
        throw new Error(data?.error || "Failed to generate MIDI file.");
      }
    } catch (error) {
      console.error("MIDI export failed:", error);
      toast.error("MIDI Export Failed", { description: error.message });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!progression || !Array.isArray(progression)) {
    return <div className="text-red-400">Error: Invalid chord progression data.</div>;
  }

  return (
    <div className="bg-gradient-to-br from-blue-900/20 via-black/10 to-blue-900/20 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-blue-400/40 text-white shadow-2xl shadow-blue-500/20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-blue-200">Generated Chord Progression</h3>
          <p className="text-sm text-blue-300/80">{mood} • {key} • {genre}</p>
        </div>
        <Music className="w-6 h-6 text-blue-300" />
      </div>

      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/10">
        <div className="flex flex-wrap gap-4 items-center justify-center">
          {currentProgression.map((chord, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center p-2">
                {/* Chord Symbol and Roman Numeral */}
                <div className="text-center mb-3">
                  <div className="text-2xl font-bold text-white mb-1">
                    {chord.symbol}
                  </div>
                  {roman_numerals && roman_numerals[index] && (
                    <div className="text-sm text-blue-300/70">{roman_numerals[index]}</div>
                  )}
                </div>
                
                {/* Interactive Controls - Now Always Visible */}
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 px-3 bg-blue-600/20 border-blue-400/40 text-blue-200 hover:bg-blue-600/40 hover:text-white transition-all"
                    onClick={() => handlePlayChord(chord.symbol, chord.inversion)}
                  >
                    <Volume2 className="w-3 h-3 mr-1" />
                    Play
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 px-2 bg-black/30 border-white/20 text-white/70 hover:bg-black/50 hover:text-white transition-all"
                    onClick={() => handleInversionChange(index)}
                    title="Click to cycle through chord inversions"
                  >
                    <span className="text-xs font-mono">Inv: {chord.inversion}</span>
                  </Button>
                </div>
              </div>

              {index < currentProgression.length - 1 && (
                <div className="text-2xl text-blue-400/50 font-light self-start mt-8 hidden sm:block">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className="space-y-4 text-sm mb-6">
        {explanation && (
          <div>
            <h4 className="font-semibold text-blue-200 mb-1">Why it works:</h4>
            <p className="text-white/80 leading-relaxed">{explanation}</p>
          </div>
        )}
        {tips && (
           <div>
            <h4 className="font-semibold text-blue-200 mb-1">Production Tips:</h4>
            <p className="text-white/80 leading-relaxed">{tips}</p>
          </div>
        )}
        {variations && (
           <div>
            <h4 className="font-semibold text-blue-200 mb-1">Variations:</h4>
            <p className="text-white/80 leading-relaxed">{variations}</p>
          </div>
        )}
      </div>

      <div className="bg-black/10 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4 space-y-4">
        <h4 className="text-base font-semibold text-center text-blue-200">Export as MIDI</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="text-xs text-blue-300/80 block mb-1">BPM: {bpm}</label>
            <Slider
              value={[bpm]}
              onValueChange={(val) => setBpm(val[0])}
              min={60}
              max={180}
              step={1}
            />
          </div>
          <div>
            <label className="text-xs text-blue-300/80 block mb-1">Octave: {octaveShift > 0 ? `+${octaveShift}` : octaveShift}</label>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setOctaveShift(o => Math.max(-2, o - 1))}>
                <Minus className="w-4 h-4" />
              </Button>
              <Slider
                value={[octaveShift]}
                onValueChange={(val) => setOctaveShift(val[0])}
                min={-2}
                max={2}
                step={1}
              />
               <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setOctaveShift(o => Math.min(2, o + 1))}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <Button onClick={handleDownloadMidi} disabled={isDownloading} className="w-full bg-blue-600 hover:bg-blue-700">
          {isDownloading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Download .MID File
        </Button>
      </div>
    </div>
  );
}
