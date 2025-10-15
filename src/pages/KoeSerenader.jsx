
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Music, Loader2, Copy, RefreshCw, Sparkles, Volume2, Zap, Search, Brain, ChevronDown, Save, FolderOpen, Trash2, Clock, Plus, Play } from 'lucide-react';
import { generateChordsFromPrompt } from '@/api/functions';
import { exportMidi } from '@/api/functions';
import { SavedProgression } from '@/api/entities';
import EngineLayout from '../components/layout/EngineLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Slider } from '@/components/ui/slider'; // Import Slider component

// Enhanced chord to MIDI note mapping
const chordToNotes = {
  // Major triads
  'C': [60, 64, 67], 'Cmaj': [60, 64, 67],
  'D': [62, 66, 69], 'Dmaj': [62, 66, 69],
  'E': [64, 68, 71], 'Emaj': [64, 68, 71],
  'F': [65, 69, 72], 'Fmaj': [65, 69, 72],
  'G': [67, 71, 74], 'Gmaj': [67, 71, 74],
  'A': [69, 73, 76], 'Amaj': [69, 73, 76],
  'B': [71, 75, 78], 'Bmaj': [71, 75, 78],

  // Minor triads
  'Cm': [60, 63, 67], 'Am': [69, 72, 76], 'Dm': [62, 65, 69],
  'Em': [64, 67, 71], 'Fm': [65, 68, 72], 'Gm': [67, 70, 74],
  'Bm': [71, 74, 78],

  // 7th chords
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
  'Cdim7': [60, 63, 66, 69], // Added dim7
  'G13': [67, 71, 74, 77, 81, 84], // Added 13th chord for testing

  // Sharp/Flat variations
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

  // Extended chords
  'Cadd9': [60, 64, 67, 74], 'Csus2': [60, 62, 67], 'Csus4': [60, 65, 67],
  'Dsus2': [62, 64, 69], 'Dsus4': [62, 67, 69], 'Dadd9': [62, 66, 69, 76],
  'Gsus4': [67, 72, 74], 'Asus4': [69, 74, 76],
  'C6': [60, 64, 67, 69], 'Cm6': [60, 63, 67, 69],
  'C9': [60, 64, 67, 70, 74], 'Cmaj9': [60, 64, 67, 71, 74],
  'C11': [60, 64, 67, 70, 74, 77],
  'Cdim': [60, 63, 66], 'Caug': [60, 64, 68]
};

// Note frequencies for direct piano key playing - Extended range (C3 to C6)
const noteFreqs = {
  // C3 Octave (MIDI 48-59)
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
  'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00,
  'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  // C4 Octave (MIDI 60-71)
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  // C5 Octave (MIDI 72-83)
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25,
  'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
  'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  // C6 (MIDI 84)
  'C6': 1046.50
};

// Get notes for chord with fallback
const getNotesForChord = (chordName) => {
  let cleanChord = chordName.replace(/[()]/g, '').trim();

  if (chordToNotes[cleanChord]) {
    return chordToNotes[cleanChord];
  }

  const variations = [
    cleanChord.replace(/maj$/, ''),
    cleanChord.replace(/min$/, 'm'),
    cleanChord.replace(/Minor$/, 'm'),
    cleanChord.replace(/Major$/, ''),
    cleanChord.replace(/\s/g, '')];


  for (const variation of variations) {
    if (chordToNotes[variation]) {
      return chordToNotes[variation];
    }
  }

  const rootMatch = cleanChord.match(/^([A-G][#b]?)(.*)/);
  if (rootMatch) {
    const root = rootMatch[1];
    if (chordToNotes[root]) return chordToNotes[root];
    if (chordToNotes[root + 'm']) return chordToNotes[root + 'm'];
    if (chordToNotes[root + 'maj']) return chordToNotes[root + 'maj'];
  }

  console.warn(`Chord "${chordName}" not found, using C major fallback.`);
  return [60, 64, 67];
};

// NEW: Helper functions for logarithmic slider mapping
const toLog = (value, min, max) => {
  if (value <= min) return 0; // Handle minimum value
  if (value >= max) return 1; // Handle maximum value
  return Math.log(value / min) / Math.log(max / min);
};

const fromLog = (value, min, max) => {
  if (value <= 0) return min; // Handle minimum slider value
  if (value >= 1) return max; // Handle maximum slider value
  return min * Math.pow(max / min, value);
};

// Helper to convert MIDI number to a note name (e.g., 60 -> C4)
const midiToNoteName = (midi) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${notes[noteIndex]}${octave}`;
};

// Helper to apply inversions to a set of base notes
const applyInversion = (baseNotes, voicing) => {
  const notes = [...baseNotes].sort((a, b) => a - b);
  let inversions = 0;
  if (voicing === '1st') inversions = 1;
  if (voicing === '2nd') inversions = 2;
  if (voicing === '3rd') inversions = 3;

  if (inversions === 0 || !notes || notes.length <= inversions) {
    return notes;
  }

  for (let i = 0; i < inversions; i++) {
    if (notes.length > 0) {
      const noteToShift = notes.shift();
      notes.push(noteToShift + 12);
    } else {
      break;
    }
  }
  return notes;
};

// Function to generate chord options for a given root note
const generateChordOptions = (rootNote) => {
  // Extract just the root note (C, D, E, etc.) without any existing chord type
  const cleanRoot = rootNote.match(/^([A-G][#b]?)/)?.[1] || 'C';

  const chordSuffixes = [
    // Basic Triads
    { value: '', label: `${cleanRoot} (Major)` },
    { value: 'm', label: `${cleanRoot}m (Minor)` },
    { value: 'dim', label: `${cleanRoot}dim (Diminished)` },
    { value: 'aug', label: `${cleanRoot}aug (Augmented)` },

    // 7th Chords
    { value: '7', label: `${cleanRoot}7 (Dominant 7th)` },
    { value: 'maj7', label: `${cleanRoot}maj7 (Major 7th)` },
    { value: 'm7', label: `${cleanRoot}m7 (Minor 7th)` },
    { value: 'm7b5', label: `${cleanRoot}m7b5 (Half Diminished)` },
    { value: 'dim7', label: `${cleanRoot}dim7 (Diminished 7th)` },

    // Extensions & Suspensions
    { value: 'sus2', label: `${cleanRoot}sus2 (Suspended 2nd)` },
    { value: 'sus4', label: `${cleanRoot}sus4 (Suspended 4th)` },
    { value: 'add9', label: `${cleanRoot}add9 (Add 9th)` },
    { value: '6', label: `${cleanRoot}6 (Major 6th)` },
    { value: 'm6', label: `${cleanRoot}m6 (Minor 6th)` },
    { value: '9', label: `${cleanRoot}9 (Dominant 9th)` },
    { value: 'maj9', label: `${cleanRoot}maj9 (Major 9th)` },
    { value: '11', label: `${cleanRoot}11 (Dominant 11th)` },
    { value: '13', label: `${cleanRoot}13 (Dominant 13th)` }];


  const options = chordSuffixes.map((type) => ({
    value: cleanRoot + type.value,
    label: type.label
  }));

  // Ensure the current symbol is always an option at the top if it's not already in the generated list
  if (!options.some((opt) => opt.value === rootNote)) {
    options.unshift({ value: rootNote, label: rootNote });
  }

  return options;
};

export default function KoeSerenader() {
  const audioContextRef = useRef(null);
  const activeNotesRef = useRef(new Map());

  // Core state
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [bpm, setBpm] = useState(120);
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [octaveShift, setOctaveShift] = useState(0);
  const [oscillatorType, setOscillatorType] = useState('triangle'); // New state for oscillator type
  const [volume, setVolume] = useState(0.7); // NEW: Volume control (0-1)

  // ADSR Envelope Parameters
  const [adsrSettings, setAdsrSettings] = useState({
    attack: 0.05, // seconds
    decay: 0.2, // seconds  
    sustain: 0.7, // level (0-1)
    release: 0.8 // seconds
  });

  // Playback state
  const [isPlayingProgression, setIsPlayingProgression] = useState(false);
  const playbackTimeoutRef = useRef([]);
  const [isExportingMidi, setIsExportingMidi] = useState(false);

  // Save/Load state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveProgressionName, setSaveProgressionName] = useState('');
  const [savedProgressions, setSavedProgressions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProgressions, setIsLoadingProgressions] = useState(false);

  // Initialize audio system
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch((e) => console.error("Error closing audio context:", e));
      }
    };
  }, []);

  const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  // Enhanced playNoteByFreq function with ADSR envelope and volume
  const playNoteByFreq = async (frequency, duration = 500, noteName = '') => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    console.log(`Playing note: ${noteName} at ${frequency}Hz with ADSR and volume: ${volume}`);

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = oscillatorType; // Use state for oscillator type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // ADSR Envelope Implementation
    const now = ctx.currentTime;
    const { attack, decay, sustain, release } = adsrSettings;

    // Calculate timing
    const attackEnd = now + attack;
    const decayEnd = attackEnd + decay;
    const noteEnd = now + duration / 1000; // duration of the note body
    const releaseEnd = noteEnd + release;

    // Apply volume scaling to all gain levels
    const peakLevel = Math.min(1.0, (sustain + 0.2) * volume); // Cap at 1.0 to prevent clipping, scale by volume
    const sustainLevel = sustain * volume; // Scale sustain by volume

    // Attack phase: 0 -> peak (slightly above sustain for punch)
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(peakLevel, attackEnd);

    // Decay phase: peak -> sustain level
    gainNode.gain.linearRampToValueAtTime(sustainLevel, decayEnd);

    // Sustain phase: maintain sustain level for the rest of the note duration
    // This setValueAtTime ensures the value is held until `noteEnd`
    gainNode.gain.setValueAtTime(sustainLevel, noteEnd);

    // Release phase: sustain -> 0
    gainNode.gain.exponentialRampToValueAtTime(0.001, releaseEnd); // Exponential ramp for natural decay

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(releaseEnd); // Stop oscillator after the release phase

    if (noteName) {
      setActiveKeys((prev) => new Set([...prev, noteName]));
      setTimeout(() => {
        setActiveKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(noteName);
          return newSet;
        });
      }, duration + release * 1000); // Consider release time for active key display
    }
  };

  // Enhanced playChord function with ADSR envelope and volume
  const playChord = async (notes, duration = 2000, chordName = '') => {
    if (!audioContextRef.current) {
      return;
    }

    const ctx = audioContextRef.current;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const shiftedNotes = notes.map((note) => {
      const shifted = note;
      return Math.max(0, Math.min(127, shifted));
    });

    const startTime = ctx.currentTime;
    const chordNotes = [];

    console.log(`Playing chord: ${chordName} with ADSR envelope and volume: ${volume}`);

    const noteMap = {
      48: 'C3', 49: 'C#3', 50: 'D3', 51: 'D#3', 52: 'E3', 53: 'F3', 54: 'F#3', 55: 'G3',
      56: 'G#3', 57: 'A3', 58: 'A#3', 59: 'B3',
      60: 'C4', 61: 'C#4', 62: 'D4', 63: 'D#4', 64: 'E4', 65: 'F4', 66: 'F#4', 67: 'G4',
      68: 'G#4', 69: 'A4', 70: 'A#4', 71: 'B4', 72: 'C5', 73: 'C#5', 74: 'D5', 75: 'D#5',
      76: 'E5', 77: 'F5', 78: 'F#5', 79: 'G5', 80: 'G#5', 81: 'A5', 82: 'A#5', 83: 'B5', 84: 'C6'
    };
    const noteNames = shiftedNotes.map((midi) => noteMap[midi]).filter(Boolean);

    setActiveKeys((prev) => new Set([...prev, ...noteNames]));

    const { attack, decay, sustain, release } = adsrSettings;
    const durationInSeconds = duration / 1000;

    // Calculate timing for ADSR envelope
    const attackEnd = startTime + attack;
    const decayEnd = attackEnd + decay;
    const noteEnd = startTime + durationInSeconds; // End of the main note duration
    const releaseEnd = noteEnd + release;

    // Apply volume scaling to all gain levels
    const peakLevel = Math.min(1.0, (sustain + 0.2) * volume); // Cap at 1.0 to prevent clipping, scale by volume
    const sustainLevel = sustain * volume; // Scale sustain by volume

    shiftedNotes.forEach((midiNote) => {
      const frequency = midiToFreq(midiNote);

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = oscillatorType; // Use state for oscillator type
      osc.frequency.setValueAtTime(frequency, startTime);

      // ADSR Envelope
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(peakLevel, attackEnd);
      gainNode.gain.linearRampToValueAtTime(sustainLevel, decayEnd);
      gainNode.gain.setValueAtTime(sustainLevel, noteEnd); // Hold sustain until note duration ends
      gainNode.gain.exponentialRampToValueAtTime(0.001, releaseEnd);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(releaseEnd); // Stop oscillator after release

      chordNotes.push({ osc, gainNode });
    });

    const uniqueChordKey = `chord-${Date.now()}-${Math.random()}`;
    activeNotesRef.current.set(uniqueChordKey, chordNotes);

    setTimeout(() => {
      setActiveKeys((prev) => {
        const newSet = new Set(prev);
        noteNames.forEach((name) => newSet.delete(name));
        return newSet;
      });
      activeNotesRef.current.delete(uniqueChordKey);
    }, duration + release * 1000); // Consider release time for active key display and cleanup
  };

  // Stop all scheduled progression playback
  const stopProgression = () => {
    console.log('Stopping chord progression playback');

    playbackTimeoutRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    playbackTimeoutRef.current = [];

    activeNotesRef.current.forEach((chordNotes) => {
      chordNotes.forEach(({ osc, gainNode }) => {
        try {
          if (osc && audioContextRef.current && osc.context.state === 'running') {
            osc.stop(audioContextRef.current.currentTime);
            osc.disconnect();
          }
          if (gainNode) {
            gainNode.disconnect();
          }
        } catch (e) {
          console.warn('Error stopping oscillator or disconnecting gain node:', e);
        }
      });
    });
    activeNotesRef.current.clear();

    setActiveKeys(new Set());
    setIsPlayingProgression(false);
  };

  // Play progression
  const playProgression = () => {
    if (!result || !result.progression || result.progression.length === 0) return;
    if (isPlayingProgression) {
      stopProgression();
      return;
    }

    console.log('Starting chord progression playback with octave shift:', octaveShift);
    setIsPlayingProgression(true);

    const chordDurationMs = 60 / bpm * 1000;
    const chords = result.progression;

    chords.forEach((chordInfo, index) => {
      const timeoutId = setTimeout(() => {
        console.log(`Playing chord: ${chordInfo.symbol} (${chordInfo.voicing} voicing)`);

        const baseNotes = getNotesForChord(chordInfo.symbol);
        const voicedNotes = applyInversion(baseNotes, chordInfo.voicing);

        const notesWithOctave = voicedNotes.map((n) => n + octaveShift * 12);

        playChord(notesWithOctave, chordDurationMs * 0.9, chordInfo.symbol);
      }, index * chordDurationMs);

      playbackTimeoutRef.current.push(timeoutId);
    });

    const finalTimeoutId = setTimeout(() => {
      console.log('Chord progression playback completed');
      setIsPlayingProgression(false);
      playbackTimeoutRef.current = [];
    }, chords.length * chordDurationMs);

    playbackTimeoutRef.current.push(finalTimeoutId);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe the chord progression you want.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);
    setProcessingStage('');
    stopProgression();

    try {
      setProcessingStage('Analyzing your request...');

      const response = await generateChordsFromPrompt({ prompt });

      if (response.status === 200 && response.data.success) {
        const processedResult = {
          ...response.data.result,
          progression: response.data.result.progression.map((symbol) => ({
            symbol: symbol,
            voicing: 'root'
          }))
        };
        setResult(processedResult);
        setProcessingStage('');
      } else {
        throw new Error(response.data.error || 'Failed to generate chord progression');
      }
    } catch (err) {
      console.error('Generation error:', err);

      let userMessage = 'Something went wrong. Please try again.';

      if (err.message.includes('Could not understand')) {
        userMessage = 'I couldn\'t understand your request. Try being more specific about the genre, mood, or key you want.';
      } else if (err.message.includes('web search')) {
        userMessage = 'I had trouble finding chords for that song. Please check the song name or try a different song.';
      } else if (err.message.includes('503') || err.message.includes('busy')) {
        userMessage = 'AI service is currently busy. Please try again in a few minutes.';
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        userMessage = 'Network error. Check your internet connection and try again.';
      } else if (err.message.includes('429')) {
        userMessage = 'Too many requests. Please wait a moment before trying again.';
      }

      setError(userMessage);
      setProcessingStage('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setPrompt(suggestion);
    setError(null);
  };

  const suggestionButtons = [
    "Chord progression of Fein by Travis Scott",
    "Chords to Wonderwall by Oasis",
    "Chord progression to Pjanoo by Eric Prydz"];


  const handleCopyProgression = () => {
    if (result && result.progression) {
      const progressionText = result.progression.map((p) => p.symbol).join(' - ');
      navigator.clipboard.writeText(progressionText);
    }
  };

  // Handler for when user changes a chord's voicing
  const handleVoicingChange = (index, newVoicing) => {
    if (!result) return;
    const newProgression = [...result.progression];
    newProgression[index].voicing = newVoicing;
    setResult({ ...result, progression: newProgression });
  };

  // NEW: Handler for when user changes a chord symbol
  const handleChordSymbolChange = (index, newSymbol) => {
    if (!result) return;

    // Update the progression with the new chord symbol
    const newProgression = [...result.progression];
    newProgression[index] = {
      ...newProgression[index],
      symbol: newSymbol,
      voicing: 'root' // Reset voicing to 'root' for safety and simplicity
    };

    // Update the result state
    setResult({ ...result, progression: newProgression });

    // Stop any currently playing progression to avoid confusion
    stopProgression();

    console.log(`Chord ${index + 1} changed to: ${newSymbol}`);
  };

  // Export MIDI
  const handleExportMidi = async () => {
    if (!result || !result.progression) return;

    setIsExportingMidi(true);
    setError(null);

    try {
      console.log('Exporting MIDI with octave shift:', octaveShift);
      const response = await exportMidi({
        progression: result.progression.map((p) => p.symbol),
        bpm: bpm,
        key: result.key,
        genre: result.genre,
        mood: result.mood,
        complexity: result.complexity,
        movements: result.movements,
        octaveShift: octaveShift
      });

      if (response.status === 200 && response.data.success) {
        const link = document.createElement('a');
        link.href = response.data.file_url;
        link.download = response.data.filename || 'chord_progression.mid';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('MIDI export successful');
      } else {
        throw new Error(response.data.error || `Failed to export MIDI: ${response.statusText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('MIDI export failed:', error);
      let userMessage = 'Failed to export MIDI.';
      if (error.response && error.response.data && error.response.data.error) {
        userMessage = `Failed to export MIDI: ${error.response.data.error}`;
      } else if (error.message) {
        userMessage = `Failed to export MIDI: ${error.message}`;
      }
      setError(userMessage);
    } finally {
      setIsExportingMidi(false);
    }
  };

  // Save progression functionality
  const handleSaveProgression = async () => {
    if (!result || !saveProgressionName.trim()) return;

    setIsSaving(true);
    try {
      await SavedProgression.create({
        name: saveProgressionName.trim(),
        prompt: prompt,
        progression: result.progression,
        bpm: bpm,
        octave_shift: octaveShift,
        key: result.key,
        genre: result.genre,
        mood: result.mood,
        explanation: result.explanation,
        tips: result.tips,
        variations: result.variations,
        roman_numerals: result.roman_numerals,
        confidence: result.confidence,
        source_type: result.source_type,
        song_found: result.song_found,
        song_name: result.song_name,
        artist: result.artist
      });

      console.log('Progression saved successfully');
      setShowSaveDialog(false);
      setSaveProgressionName('');
    } catch (error) {
      console.error('Failed to save progression:', error);
      setError('Failed to save progression. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Load a specific progression
  const handleLoadProgression = (savedProgression) => {
    stopProgression();

    setPrompt(savedProgression.prompt);
    setBpm(savedProgression.bpm);
    setOctaveShift(savedProgression.octave_shift);

    setResult({
      progression: savedProgression.progression,
      key: savedProgression.key,
      genre: savedProgression.genre,
      mood: savedProgression.mood,
      explanation: savedProgression.explanation,
      tips: savedProgression.tips,
      variations: savedProgression.variations,
      roman_numerals: savedProgression.roman_numerals,
      confidence: savedProgression.confidence,
      source_type: savedProgression.source_type,
      song_found: savedProgression.song_found,
      song_name: savedProgression.song_name,
      artist: savedProgression.artist
    });

    setShowLoadDialog(false);
    console.log('Loaded progression:', savedProgression.name);
  };

  // NEW: Helper function to remove source citations from text
  const removeSourceCitations = (text) => {
    if (!text) return '';
    // This regex looks for markdown-style links that are enclosed in parentheses
    // e.g., ([source.com](...)) or ([[source.com]](...)) and removes them.
    return text.replace(/\(\[+.*?\]+\(https?:\/\/[^\)]+\)\)/g, '').trim();
  };

  // Delete a saved progression
  const handleDeleteProgression = async (progressionId) => {
    try {
      await SavedProgression.delete(progressionId);
      console.log('Progression deleted successfully');
      loadSavedProgressions();
    } catch (error) {
      console.error('Failed to delete progression:', error);
    }
  };

  // Load progressions when dialog opens
  const loadSavedProgressions = async () => {
    setIsLoadingProgressions(true);
    try {
      const progressions = await SavedProgression.list('-created_date', 50);
      setSavedProgressions(progressions);
    } catch (error) {
      console.error('Failed to load saved progressions:', error);
    } finally {
      setIsLoadingProgressions(false);
    }
  };

  useEffect(() => {
    if (showLoadDialog) {
      loadSavedProgressions();
    }
  }, [showLoadDialog]);

  const handleAdsrChange = (parameter, value) => {
    setAdsrSettings((prev) => ({
      ...prev,
      [parameter]: value[0] // Slider returns an array, take the first element
    }));
  };

  // NEW: Handle volume change
  const handleVolumeChange = (value) => {
    setVolume(value[0]); // Slider returns an array, take the first element
  };

  // Extended range piano keys
  const whiteKeys = [
    'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
    'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
    'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5',
    'C6'];

  const blackKeys = [
    { note: 'C#3', left: '25px' },
    { note: 'D#3', left: '75px' },
    { note: 'F#3', left: '175px' },
    { note: 'G#3', left: '225px' },
    { note: 'A#3', left: '275px' },
    { note: 'C#4', left: '375px' },
    { note: 'D#4', left: '425px' },
    { note: 'F#4', left: '525px' },
    { note: 'G#4', left: '575px' },
    { note: 'A#4', left: '625px' },
    { note: 'C#5', left: '725px' },
    { note: 'D#5', left: '775px' },
    { note: 'F#5', left: '875px' },
    { note: 'G#5', left: '925px' },
    { note: 'A#5', left: '975px' }];


  return (
    <EngineLayout
      engineType="KOE"
      currentPageName="KoeSerenader"
      defaultTool="serenader">

      <div className="w-full space-y-8 sm:space-y-12 p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight">
            KOE SERENADER
          </h1>
        </div>

        {/* Smart Input Interface */}
        <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30 w-full shadow-2xl" style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)' }}>
          <CardHeader className="p-6 sm:p-8">
            <CardTitle className="text-xl sm:text-2xl text-center font-semibold leading-none tracking-tight flex items-center justify-center gap-2">Ayy papi... what chords you feeling? 🫦


            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-6 sm:p-8">
            <div>
              <Textarea
                placeholder="Describe the chord progression you want..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="backdrop-blur-xl bg-black/60 border-blue-500/40 text-white placeholder-gray-400 min-h-[100px] resize-none shadow-lg"
                style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)' }}
                disabled={isGenerating} />

            </div>

            {/* Suggestion Buttons */}
            {!result &&
              <div className="space-y-4">
                <p className="text-sm text-gray-400 mb-4">Or try one of these:</p>
                <div className="flex flex-wrap gap-3">
                  {suggestionButtons.map((suggestion, index) =>
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 text-xs shadow-md transition-all duration-300"
                      style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.1)' }}
                      disabled={isGenerating}>

                      {suggestion}
                    </Button>
                  )}
                </div>
              </div>
            }

            {/* BPM Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <label className="text-white font-medium mb-3 sm:mb-4 block">BPM (Playback Speed)</label>
                <Input
                  type="number"
                  min="60"
                  max="240"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  className="backdrop-blur-xl bg-black/60 border-blue-500/40 text-white w-32" />

              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center pt-6">
              <div className="text-center">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold border-0 px-8 py-3 text-lg shadow-2xl transition-all duration-300"
                  style={{
                    boxShadow: '0 0 40px rgba(59, 130, 246, 0.4), 0 0 80px rgba(59, 130, 246, 0.2)',
                    filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.6))'
                  }}>

                  {isGenerating ?
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </> :

                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Serenade me daddy
                    </>
                  }
                </Button>

                {/* Processing Stage */}
                {processingStage &&
                  <div className="mt-4 text-sm text-blue-300 animate-pulse flex items-center justify-center gap-2">
                    {processingStage.includes('Searching') ?
                      <Search className="w-4 h-4" /> :

                      <Brain className="w-4 h-4" />
                    }
                    {processingStage}
                  </div>
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error &&
          <Alert variant="destructive" className="border-red-500/30 bg-red-500/10 mx-6">
            <AlertTitle>Hmm, I had trouble with that</AlertTitle>
            <AlertDescription className="mt-2">
              {error}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                  className="border-red-500/30 text-red-300 hover:bg-red-500/10">

                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        }

        {/* Results Display */}
        {result &&
          <div className="space-y-8 w-full pb-8 sm:pb-12">
            {/* Original Prompt Display */}
            <Card className="backdrop-blur-xl bg-black/30 border border-blue-500/20">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-300 mb-2">Your request:</p>
                    <p className="text-white">{prompt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chord Progression Display */}
            <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/40">
              <CardHeader className="p-6 sm:p-8">
                <CardTitle className="text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-blue-400" />
                    Your Chord Progression
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {/* Save Button */}
                    <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">

                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="backdrop-blur-xl bg-black/90 border border-blue-500/30 w-[90vw] max-w-md sm:max-w-lg rounded-lg">
                        <DialogHeader>
                          <DialogTitle className="text-white">Save Chord Progression</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 p-4">
                          <Input
                            placeholder="Enter a name for this progression..."
                            value={saveProgressionName}
                            onChange={(e) => setSaveProgressionName(e.target.value)}
                            className="backdrop-blur-xl bg-black/60 border-blue-500/40 text-white placeholder-gray-400" />

                          <div className="flex justify-end gap-3">
                            <Button
                              variant="outline"
                              onClick={() => setShowSaveDialog(false)}
                              className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">

                              Cancel
                            </Button>
                            <Button
                              onClick={handleSaveProgression}
                              disabled={!saveProgressionName.trim() || isSaving}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold border-0">

                              {isSaving ?
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Saving...
                                </> :

                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  Save Progression
                                </>
                              }
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Load Button */}
                    <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">

                          <FolderOpen className="w-4 h-4 mr-2" />
                          Load
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="backdrop-blur-xl bg-black/90 border border-blue-500/30 w-[95vw] max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl rounded-lg max-h-[85vh] flex flex-col">
                        <DialogHeader>
                          <DialogTitle className="text-white">My Saved Progressions</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2 p-4">
                          {isLoadingProgressions ?
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                              <span className="ml-2 text-blue-300">Loading progressions...</span>
                            </div> :
                            savedProgressions.length === 0 ?
                              <div className="text-center py-8">
                                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-400">No saved progressions yet.</p>
                                <p className="text-gray-500 text-sm">Generate and save your first progression!</p>
                              </div> :

                              <div className="grid gap-4">
                                {savedProgressions.map((savedProgression) =>
                                  <Card key={savedProgression.id} className="backdrop-blur-xl bg-black/50 border border-blue-500/20">
                                    <CardContent className="p-3 sm:p-4">
                                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                        <div className="flex-1">
                                          <h3 className="text-white font-semibold mb-2">{savedProgression.name}</h3>
                                          <div className="text-sm text-gray-400 space-y-1">
                                            <p className="truncate">Chords: {savedProgression.progression.map((p) => p.symbol).join(' - ')}</p>
                                            <p>Key: {savedProgression.key} • Genre: {savedProgression.genre} • {savedProgression.bpm} BPM</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                              <Clock className="w-3 h-3" />
                                              {format(new Date(savedProgression.created_date), 'MMM d, yyyy • HH:mm')}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex gap-2 self-start sm:self-center flex-shrink-0">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleLoadProgression(savedProgression)}
                                            className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">

                                            Load
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleDeleteProgression(savedProgression.id)}
                                            className="border-red-500/30 text-red-300 hover:bg-red-500/10">

                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </div>
                          }
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportMidi}
                      disabled={isExportingMidi || !result?.progression?.length}
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">

                      {isExportingMidi ?
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :

                        <Music className="w-4 h-4 mr-2" />
                      }
                      {isExportingMidi ? 'Exporting...' : 'Export MIDI'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyProgression}
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">

                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="text-center">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mb-6">
                    {result.progression.map((chordInfo, index) => {
                      const baseNotes = getNotesForChord(chordInfo.symbol);
                      const voicedNotes = applyInversion(baseNotes, chordInfo.voicing);
                      const noteCount = baseNotes.length;

                      const voicingOptions = ['root'];
                      if (noteCount >= 2) voicingOptions.push('1st');
                      if (noteCount >= 3) voicingOptions.push('2nd');
                      if (noteCount >= 4) voicingOptions.push('3rd');

                      const chordOptions = generateChordOptions(chordInfo.symbol);

                      return (
                        <div
                          key={index}
                          className="p-6 rounded-xl border transition-all duration-300 bg-blue-900/40 border-blue-500/40 text-blue-100 hover:bg-blue-800/40 shadow-lg min-h-[200px]">

                          <div className="flex justify-between items-center mb-4">
                            {/* Editable Chord Symbol Dropdown */}
                            <div className="flex-1 min-w-0 mr-3">
                              <Select
                                value={chordInfo.symbol}
                                onValueChange={(newSymbol) => handleChordSymbolChange(index, newSymbol)}>

                                <SelectTrigger className="w-full bg-black/50 border-blue-500/50 text-white text-lg font-bold h-12">
                                  <SelectValue className="text-lg font-bold" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64 overflow-y-auto">
                                  {chordOptions.map((option, idx) =>
                                    <SelectItem key={idx} value={option.value} className="text-sm">
                                      {option.label}
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Play Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="bg-green-600/20 hover:bg-green-500/30 text-green-300 hover:text-green-100 border border-green-500/50 w-12 h-12 flex-shrink-0 transition-all duration-200"
                              onClick={() => {
                                stopProgression();
                                const notesWithOctave = voicedNotes.map((n) => n + octaveShift * 12);
                                playChord(notesWithOctave, 1500, chordInfo.symbol);
                              }}>

                              <Play className="w-5 h-5" />
                            </Button>
                          </div>

                          <div className="space-y-4 text-left">
                            <div>
                              <label className="text-xs text-blue-300 font-medium mb-2 block">Voicing</label>
                              <Select value={chordInfo.voicing} onValueChange={(value) => handleVoicingChange(index, value)}>
                                <SelectTrigger className="w-full bg-black/50 border-blue-500/50 text-white h-10">
                                  <SelectValue placeholder="Select voicing" />
                                </SelectTrigger>
                                <SelectContent>
                                  {voicingOptions.map((opt) =>
                                    <SelectItem key={opt} value={opt} className="capitalize">{opt} Inversion</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <p className="text-xs text-blue-300 font-medium mb-2">Notes</p>
                              <p className="text-sm font-mono text-white bg-black/30 p-3 rounded-md">
                                {voicedNotes.map(midiToNoteName).join(' - ')}
                              </p>
                            </div>
                          </div>
                        </div>);

                    })}
                  </div>

                  {/* Octave Control Section */}
                  <div className="mb-6 p-6 bg-black/30 rounded-lg border border-blue-500/20">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <span className="text-blue-300 font-medium text-base">Octave:</span>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOctaveShift((prev) => Math.max(-2, prev - 1))}
                          disabled={octaveShift <= -2}
                          className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 w-10 h-10 p-0 text-lg">

                          -
                        </Button>
                        <span className="text-white font-mono min-w-[80px] text-center text-base">
                          {octaveShift === 0 ? 'Default' : `${octaveShift > 0 ? '+' : ''}${octaveShift}`}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOctaveShift((prev) => Math.min(2, prev + 1))}
                          disabled={octaveShift >= 2}
                          className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 w-10 h-10 p-0 text-lg">

                          +
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 text-center">
                      Shift the chord progression octave
                    </p>
                  </div>

                  {/* Play Progression Button */}
                  <div className="mb-6">
                    <Button
                      onClick={playProgression}
                      className={`${isPlayingProgression ?
                        'bg-red-500 hover:bg-red-600' :
                        'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'} text-white font-semibold px-8 py-4 text-lg transition-all duration-300 h-14`
                      }
                      disabled={!result.progression || result.progression.length === 0}>

                      {isPlayingProgression ?
                        <>
                          <span className="w-4 h-4 mr-3 border-2 border-white inline-block"></span>
                          Stop Progression
                        </> :

                        <>
                          <Volume2 className="w-5 h-5 mr-3" />
                          Play Progression
                        </>
                      }
                    </Button>
                  </div>

                  <div className="text-lg text-blue-200 mb-4">
                    Roman Numerals: {result.roman_numerals.join(' - ')}
                  </div>
                  <div className="text-base text-blue-300 flex flex-wrap justify-center gap-x-3 gap-y-2">
                    {result.genre && <span>{result.genre}</span>}
                    {result.key && <span>• {result.key}</span>}
                    {result.mood && <span>• {result.mood}</span>}
                    <span>• {`${bpm} BPM`}</span>
                    {octaveShift !== 0 && <span>• {`${octaveShift > 0 ? '+' : ''}${octaveShift} Octave${Math.abs(octaveShift) !== 1 ? 's' : ''}`}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sound Design Controls (ADSR + Oscillator + Volume) */}
            <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30 w-full shadow-2xl">
              <CardHeader className="p-6 sm:p-8">
                <CardTitle className="text-white flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-blue-400" />
                  Sound Design Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-6 sm:p-8">
                {/* Volume Control - NEW SECTION */}
                <div className="pb-4 border-b border-blue-500/10">
                  <label className="text-white font-medium mb-4 block text-base sm:text-lg flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-blue-400" />
                    Master Volume: {Math.round(volume * 100)}%
                  </label>
                  <Slider
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    min={0.0}
                    max={1.0}
                    step={0.01}
                    className="w-full [&>span:first-child]:bg-blue-500 [&>span:first-child]:shadow-lg" />

                  <p className="text-xs text-gray-400 mt-2">Control the overall playback volume for chords and piano</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Attack */}
                  <div>
                    <label className="text-white font-medium mb-3 block text-sm">
                      Attack: {adsrSettings.attack.toFixed(3)}s
                    </label>
                    <Slider
                      value={[toLog(adsrSettings.attack, 0.001, 2.0)]}
                      onValueChange={(value) => handleAdsrChange('attack', [fromLog(value[0], 0.001, 2.0)])}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full [&>span:first-child]:bg-blue-500 [&>span:first-child]:shadow-lg" />
                    <p className="text-xs text-gray-400 mt-1">How quickly sound reaches peak</p>
                  </div>

                  {/* Decay */}
                  <div>
                    <label className="text-white font-medium mb-3 block text-sm">
                      Decay: {adsrSettings.decay.toFixed(3)}s
                    </label>
                    <Slider
                      value={[toLog(adsrSettings.decay, 0.001, 2.0)]}
                      onValueChange={(value) => handleAdsrChange('decay', [fromLog(value[0], 0.001, 2.0)])}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full [&>span:first-child]:bg-blue-500 [&>span:first-child]:shadow-lg" />
                    <p className="text-xs text-gray-400 mt-1">Time to reach sustain level</p>
                  </div>

                  {/* Sustain */}
                  <div>
                    <label className="text-white font-medium mb-3 block text-sm">
                      Sustain: {(adsrSettings.sustain * 100).toFixed(0)}%
                    </label>
                    <Slider
                      value={[adsrSettings.sustain]}
                      onValueChange={(value) => handleAdsrChange('sustain', value)}
                      min={0.0}
                      max={1.0}
                      step={0.01}
                      className="w-full [&>span:first-child]:bg-blue-500 [&>span:first-child]:shadow-lg" />
                    <p className="text-xs text-gray-400 mt-1">Volume level during hold</p>
                  </div>

                  {/* Release */}
                  <div>
                    <label className="text-white font-medium mb-3 block text-sm">
                      Release: {adsrSettings.release.toFixed(3)}s
                    </label>
                    <Slider
                      value={[toLog(adsrSettings.release, 0.001, 5.0)]}
                      onValueChange={(value) => handleAdsrChange('release', [fromLog(value[0], 0.001, 5.0)])}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full [&>span:first-child]:bg-blue-500 [&>span:first-child]:shadow-lg" />
                    <p className="text-xs text-gray-400 mt-1">Fade out time when released</p>
                  </div>
                </div>

                {/* ADSR Presets and Oscillator Selector */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center pt-6 border-t border-blue-500/10">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-gray-400 text-sm font-medium mr-2">Presets:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAdsrSettings({ attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.3 })}
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 text-xs shadow-md">

                      Pluck
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAdsrSettings({ attack: 0.8, decay: 0.3, sustain: 0.6, release: 1.5 })}
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 text-xs shadow-md">

                      Pad
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAdsrSettings({ attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.8 })}
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 text-xs shadow-md">

                      Default
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAdsrSettings({ attack: 0.3, decay: 0.4, sustain: 0.8, release: 2.0 })}
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 text-xs shadow-md">

                      Organ
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 sm:ml-auto">
                    <label className="text-gray-400 text-sm font-medium">Waveform:</label>
                    <Select value={oscillatorType} onValueChange={setOscillatorType}>
                      <SelectTrigger className="w-[130px] bg-black/50 border-blue-500/50 text-white">
                        <SelectValue placeholder="Waveform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sine">Sine</SelectItem>
                        <SelectItem value="triangle">Triangle</SelectItem>
                        <SelectItem value="sawtooth">Sawtooth</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Extended Visual Piano Keyboard */}
            <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30">
              <CardHeader className="p-6 sm:p-8">
                <CardTitle className="text-white text-center">Interactive Piano</CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="overflow-x-auto custom-scrollbar pb-4">
                  <div className="relative min-w-[1100px]">
                    <div className="flex bg-gray-800 p-4 rounded-lg shadow-lg">
                      {/* White keys */}
                      {whiteKeys.map((note, index) =>
                        <button
                          key={note}
                          onClick={() => {
                            stopProgression();
                            playNoteByFreq(noteFreqs[note], 500, note);
                          }}
                          className={`w-12 h-40 border-2 border-gray-600 hover:bg-gray-100 active:bg-gray-300 transition-all flex items-end justify-center pb-2 text-xs font-bold ${activeKeys.has(note) ?
                            'bg-blue-300 text-blue-900 shadow-lg' :
                            'bg-white text-gray-800'}`
                          }
                          style={{ marginRight: index < whiteKeys.length - 1 ? '2px' : '0' }}>

                          {note.replace(/[0-9]/g, '')}
                        </button>
                      )}

                      {/* Black keys */}
                      {blackKeys.map(({ note, left }) =>
                        <button
                          key={note}
                          onClick={() => {
                            stopProgression();
                            playNoteByFreq(noteFreqs[note], 500, note);
                          }}
                          className={`absolute w-8 h-24 border border-gray-700 hover:bg-gray-800 active:bg-gray-700 transition-all flex items-end justify-center pb-2 text-xs font-bold z-10 ${activeKeys.has(note) ?
                            'bg-blue-600 text-white shadow-lg' :
                            'bg-gray-900 text-white'}`
                          }
                          style={{ left: `calc(${left} + 1rem)`, top: '1rem' }}>

                          {note.replace(/[0-9]/g, '')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-center mt-4 text-gray-400 text-sm">
                  Piano keys now use your custom sound design settings - experiment!
                </div>
              </CardContent>
            </Card>

            {/* Explanation */}
            <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30">
              <CardHeader className="p-6 sm:p-8">
                <CardTitle className="text-white">Why This Works</CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 pt-0">
                <p className="text-gray-300 leading-relaxed">{removeSourceCitations(result.explanation)}</p>
              </CardContent>
            </Card>

            {/* Production Tips */}
            <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30">
              <CardHeader className="p-6 sm:p-8">
                <CardTitle className="text-white">Production Tips</CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 pt-0">
                <p className="text-gray-300 leading-relaxed">{removeSourceCitations(result.tips)}</p>
              </CardContent>
            </Card>

            {/* Variations */}
            <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30">
              <CardHeader className="p-6 sm:p-8">
                <CardTitle className="text-white">Variations & Ideas</CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 pt-0">
                <p className="text-gray-300 leading-relaxed">{removeSourceCitations(result.variations)}</p>
              </CardContent>
            </Card>

            {/* Generate Another */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={() => {
                  setResult(null);
                  setPrompt('');
                  setError(null);
                  stopProgression();
                }}
                variant="outline"
                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">

                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Another
              </Button>
            </div>
          </div>
        }

        {/* Quick Access Buttons (when no result is shown) */}
        {!result && !isGenerating &&
          <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30 w-full">
            <CardContent className="p-8 text-center">
              <h3 className="text-white font-semibold mb-6">Quick Actions</h3>
              <div className="flex justify-center gap-6">
                <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">

                      <FolderOpen className="w-4 h-4 mr-2" />
                      Browse Saved Progressions
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="backdrop-blur-xl bg-black/90 border border-blue-500/30 w-[95vw] max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl rounded-lg max-h-[85vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle className="text-white">My Saved Progressions</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2 p-4">
                      {isLoadingProgressions ?
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                          <span className="ml-2 text-blue-300">Loading progressions...</span>
                        </div> :
                        savedProgressions.length === 0 ?
                          <div className="text-center py-8">
                            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">No saved progressions yet.</p>
                            <p className="text-gray-500 text-sm">Generate and save your first progression!</p>
                          </div> :

                          <div className="grid gap-4">
                            {savedProgressions.map((savedProgression) =>
                              <Card key={savedProgression.id} className="backdrop-blur-xl bg-black/50 border border-blue-500/20">
                                <CardContent className="p-3 sm:p-4">
                                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                    <div className="flex-1">
                                      <h3 className="text-white font-semibold mb-2">{savedProgression.name}</h3>
                                      <div className="text-sm text-gray-400 space-y-1">
                                        <p className="truncate">Chords: {savedProgression.progression.map((p) => p.symbol).join(' - ')}</p>
                                        <p>Key: {savedProgression.key} • Genre: {savedProgression.genre} • {savedProgression.bpm} BPM</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <Clock className="w-3 h-3" />
                                          {format(new Date(savedProgression.created_date), 'MMM d, yyyy • HH:mm')}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 self-start sm:self-center flex-shrink-0">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleLoadProgression(savedProgression)}
                                        className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">

                                        Load
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleDeleteProgression(savedProgression.id)}
                                        className="border-red-500/30 text-red-300 hover:bg-red-500/10">

                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                      }
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        }
      </div>
    </EngineLayout>);

}
