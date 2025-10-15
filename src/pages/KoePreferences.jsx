
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, ArrowRight, Sparkles, Volume2, Music, CheckCircle, Play } from 'lucide-react';
import { User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
// Removed: import { summarizeKoeUserProfile } from '@/api/functions';
import { toast } from "sonner";

// Refined EDM Genre List - Core categories for AI context (keeping, though not directly used for selection now)
const EDM_GENRES = [
  {
    id: "house",
    name: "House",
    description: "Four-on-the-floor rhythms, groove-focused, soulful elements",
    ai_context: "Sidechain compression, groove, four-on-the-floor, club culture"
  },
  {
    id: "techno", 
    name: "Techno",
    description: "Industrial, repetitive, mechanical precision, underground culture",
    ai_context: "Repetitive elements, industrial sounds, underground aesthetics"
  },
  {
    id: "trance",
    name: "Trance", 
    description: "Euphoric melodies, emotional builds, epic breakdowns",
    ai_context: "Emotional journeys, builds/breakdowns, festival euphoria"
  },
  {
    id: "dubstep_bass",
    name: "Dubstep/Bass Music",
    description: "Heavy basslines, aggressive sound design, dramatic drops", 
    ai_context: "Wobbles, drops, sound design, festival energy"
  },
  {
    id: "drum_and_bass",
    name: "Drum & Bass",
    description: "Fast breakbeats, complex rhythms, heavy bass emphasis",
    ai_context: "Breakbeat programming, sub-bass management, UK culture"
  },
  {
    id: "trap_electronic", 
    name: "Trap/Electronic Hip-Hop",
    description: "808 drums, hip-hop influences, festival-ready drops",
    ai_context: "808 patterns, hip-hop aesthetics, mainstream crossover"
  },
  {
    id: "hardstyle",
    name: "Hardstyle/Hard Dance", 
    description: "Reverse bass kicks, euphoric melodies, high-energy",
    ai_context: "Kick design, hands-up energy, European festival culture"
  },
  {
    id: "ambient",
    name: "Ambient/Downtempo",
    description: "Atmospheric, spacious, mood-focused over rhythm", 
    ai_context: "Texture over rhythm, soundscapes, emotional atmosphere"
  },
  {
    id: "uk_garage",
    name: "UK Garage/Breakbeat",
    description: "Syncopated rhythms, shuffled beats, UK underground culture",
    ai_context: "Shuffle rhythms, UK underground, vocal chops"
  },
  {
    id: "experimental",
    name: "Experimental/Hybrid EDM", 
    description: "Genre-blending, innovative production, boundary-pushing",
    ai_context: "Innovation, unconventional approaches, artistic risk-taking"
  }
];

// 20 Intuitive Sonic Preference Questions - Grouped into logical steps
// These will be combined into two steps for the new UI
const PREFERENCE_QUESTIONS = {
  // Step 2: Overall Sound Character (now part of new Step 2 - Part 1)
  step2: [
    {
      key: "pref_loudness_scale",
      title: "Overall Loudness Goal",
      question: "How loud and consistently present do you want your final tracks to feel?",
      options: [
        "Gentle & Open - Lots of quiet moments, soft delivery",
        "Natural & Flowing - Realistic ups and downs, like a live performance", 
        "Balanced & Solid - Good average volume, no sudden quiet parts, but still breathes",
        "Punchy & Upfront - Always strong and forward, grabs immediate attention",
        "Max Volume Blast - Full power all the time, no soft parts, extreme energy"
      ]
    },
    {
      key: "pref_dynamic_range", 
      title: "Dynamic Variation (Quiet vs. Loud)",
      question: "How much difference do you like between the softest and loudest parts of your music?",
      options: [
        "Huge Swings - Dramatic shifts between whispering and shouting",
        "Expressive & Free - Natural range of volume changes, feels very open",
        "Controlled & Consistent - Moderate difference, keeps things fairly even without feeling squashed", 
        "Tight & Powerful - Very little difference, everything is loud and direct",
        "Super Solid Wall - Almost no volume difference, pure, unyielding impact"
      ]
    },
    {
      key: "pref_distortion_tolerance",
      title: "Grittiness & Edge", 
      question: "How much \"edge,\" \"warmth,\" or subtle distortion do you like in your sounds?",
      options: [
        "Crystal Clean - Pristine, pure, absolutely no unwanted grit",
        "Smooth & Polished - Very clean, but with a touch of warmth",
        "Present & Characterful - Adds flavor and presence, subtle richness",
        "Raw & Punchy - Noticeable growl or bite, adds aggression and power", 
        "Full On Aggression - Heavily textured, distorted, or purposefully broken sounds"
      ]
    },
    {
      key: "pref_stereo_width",
      title: "Stereo Width (Left-to-Right Space)",
      question: "How wide and expansive do you want your music to feel across your speakers?", 
      options: [
        "Centered & Direct - All main sounds focused in the middle, very direct",
        "Focused & Defined - Clear central image, with just a little space on the sides",
        "Balanced & Immersive - Good spread, feels natural and wraps around you slightly",
        "Wide & Expansive - Spreads far to the sides, fills the listening space",
        "Super Wide & Epic - Hugely spread out, sounds coming from all directions"
      ]
    },
    {
      key: "pref_bass_presence",
      title: "Bass Presence",
      question: "How prominent and impactful should your low-end (bass, sub-bass, kick drum) be?",
      options: [
        "Subtle Support - Bass is felt more than heard, foundational",
        "Clear & Defined - Present and warm, clearly audible but not dominant", 
        "Full & Punchy - Strong and upfront, gives weight to the whole track",
        "Dominant & Rumbling - Very powerful, takes center stage, felt in your chest",
        "Earth-Shaking Impact - Overwhelming, literally shakes the room, the main event"
      ]
    }
  ],
  
  // Step 3: Frequency Balance (now part of new Step 2 - Part 1)
  step3: [
    {
      key: "pref_high_frequency_brightness",
      title: "High-End Sparkle",
      question: "How bright, airy, and \"shimmering\" should the top-end (hi-hats, vocals, cymbals) of your music sound?",
      options: [
        "Warm & Mellow - Soft highs, gentle and smooth",
        "Balanced & Natural - Clear but not sharp, comfortable listening",
        "Present & Crisp - Defined highs, adds clarity and detail",
        "Bright & Lively - Very clear and airy, almost glistening", 
        "Sharp & Shimmering - Extremely bright and cutting, brilliant and precise"
      ]
    },
    {
      key: "pref_mid_range_warmth",
      title: "Mid-Range Warmth & Character",
      question: "How much richness, body, and specific \"color\" do you want in the mid-range (vocals, leads, main melodies)?",
      options: [
        "Crystal Clear - Completely transparent, no added color or character",
        "Clean & Precise - Very clear with just a hint of natural warmth",
        "Balanced & Musical - Some warmth and character, but still clear and defined",
        "Rich & Colored - Noticeable warmth and personality, adds vibe and character",
        "Heavy Character - Lots of warmth, saturation, and distinctive coloration"
      ]
    },
    {
      key: "pref_compression_style",
      title: "Overall Cohesion & Glue",
      question: "How \"glued together\" and controlled should all the elements in your mix feel?",
      options: [
        "Natural & Free - Each element breathes independently, very organic feel",
        "Lightly Connected - Subtle cohesion, still feels natural and open",
        "Balanced Control - Good cohesion without feeling overly controlled",
        "Tightly Glued - Everything feels locked together, controlled and punchy",
        "Heavily Glued - Maximum cohesion, everything moves as one solid unit"
      ]
    },
    {
      key: "pref_transient_impact", 
      title: "Attack & Punch",
      question: "How sharp and impactful should the \"attack\" (initial hit) of your drums and percussive elements be?",
      options: [
        "Soft & Smooth - Gentle, rounded attacks with smooth delivery",
        "Natural & Organic - Clear but not overly sharp, realistic feel",
        "Present & Defined - Good attack clarity, cuts through without being harsh",
        "Sharp & Punchy - Strong, defined attacks that really cut through",
        "Aggressive & Cutting - Maximum attack, extremely sharp and impactful"  
      ]
    },
    {
      key: "pref_vocal_presence",
      title: "Vocal & Lead Prominence", 
      question: "How upfront and prominent should vocals or lead melodies sit in your mix?",
      options: [
        "Blended & Atmospheric - Vocals/leads blend into the overall soundscape",
        "Present but Subtle - Clear but not dominating, part of the whole",
        "Balanced & Clear - Well-defined, sits nicely with other elements",
        "Upfront & Prominent - Clearly the main focus, stands out from the mix",
        "Dominant & Commanding - Completely upfront, dominates everything else"
      ]
    }
  ],

  // Step 4: Technical Approach (now part of new Step 3 - Part 2)
  step4: [
    {
      key: "pref_sub_bass_impact",
      title: "Sub-Bass Impact",
      question: "How powerful and overwhelming should the very lowest frequencies (sub-bass, below 60Hz) be?", 
      options: [
        "Controlled & Subtle - Just enough to provide foundation, very controlled",
        "Present & Warm - Clear sub-bass presence without being overwhelming",
        "Full & Impactful - Strong sub-bass that you can feel in your body",
        "Powerful & Dominant - Very strong sub-bass that takes center stage",
        "Overwhelming & Massive - Earth-shaking sub-bass that dominates everything"
      ]
    },
    {
      key: "pref_limiting_tolerance",
      title: "Maximum Loudness Processing",
      question: "How much \"brick wall\" limiting (maximum loudness processing) are you comfortable with?",
      options: [
        "None - No limiting, completely natural dynamics",
        "Light Touch - Very subtle limiting, mostly natural sound",
        "Moderate Control - Some limiting for consistency without obvious artifacts",
        "Heavy Processing - Significant limiting for competitive loudness",
        "Maximum Limiting - Extreme limiting for maximum possible loudness"
      ]
    },
    {
      key: "pref_clipping_tolerance", 
      title: "Harmonic Saturation & Clipping",
      question: "How much harmonic saturation or even intentional \"clipping\" distortion do you want?",
      options: [
        "Absolutely None - Perfect digital clarity, no saturation whatsoever", 
        "Very Subtle - Just a hint of analog-style warmth",
        "Present Character - Noticeable harmonic content and warmth",
        "Heavy Saturation - Obvious harmonic distortion for character and energy",
        "Intentional Clipping - Aggressive saturation and clipping as an artistic choice"
      ]
    },
    {
      key: "pref_reverb_space",
      title: "Spatial Depth & Reverb",
      question: "How much sense of \"space,\" reverb, and three-dimensional depth should your music have?",
      options: [
        "Dry & Intimate - Very close, direct sound with minimal reverb",
        "Controlled Space - Some sense of room, but mostly direct and upfront", 
        "Natural Ambience - Good balance of direct sound and natural space",
        "Spacious & Atmospheric - Lots of reverb and sense of large spaces",
        "Huge & Epic - Massive reverbs and enormous sense of space"
      ]
    },
    {
      key: "pref_mono_compatibility",
      title: "Mono Playback Compatibility", 
      question: "How important is it that your music sounds good when played back in mono (single speaker)?",
      options: [
        "Not Important - Stereo-only focus, mono playback not a concern",
        "Somewhat Important - Should work okay in mono, but stereo is priority",
        "Balanced Approach - Good mono compatibility while maximizing stereo benefits",
        "Very Important - Must sound great in mono, strong mono compatibility focus",
        "Critical Priority - Mono compatibility is absolutely essential"
      ]
    }
  ],

  // Step 5: Production Philosophy (now part of new Step 3 - Part 2)
  step5: [
    {
      key: "pref_frequency_balance",
      title: "Overall Frequency Balance",
      question: "What kind of overall tonal balance do you prefer across the frequency spectrum?",
      options: [
        "Natural & Flat - Very balanced, natural frequency response", 
        "Slightly Enhanced - Subtle enhancements but still natural sounding",
        "Balanced Character - Some creative EQ choices while maintaining overall balance",
        "Creative Shaping - Noticeable frequency shaping for artistic effect",
        "Extreme Character - Dramatic frequency shaping, very distinctive tonal character"
      ]
    },
    {
      key: "pref_energy_level",
      title: "Overall Energy & Intensity",
      question: "What level of energy and intensity should your music consistently maintain?",
      options: [
        "Relaxed & Chill - Low energy, calm, meditative vibes",
        "Moderate & Flowing - Steady energy with natural ebbs and flows",
        "Energetic & Engaging - Good energy level, keeps listeners engaged",
        "High Energy & Exciting - Consistently high energy, driving and powerful", 
        "Intense & Aggressive - Maximum energy, relentless intensity"
      ]
    },
    {
      key: "pref_technical_focus",
      title: "Technical Precision vs. Artistic Feel",
      question: "How much do you prioritize technical perfection versus artistic expression and \"feel\"?",
      options: [
        "Pure Artistic Feel - Emotion and vibe over technical perfection",
        "Feel-First Approach - Prioritize feel, but maintain basic technical standards",
        "Balanced Approach - Good balance between technical quality and artistic expression",
        "Technical Focus - High technical standards while maintaining musicality", 
        "Technical Perfection - Maximum technical precision and accuracy"
      ]
    },
    {
      key: "pref_streaming_optimization",
      title: "Streaming Platform Optimization", 
      question: "How important is optimizing your music specifically for streaming platforms (Spotify, Apple Music, etc.)?",
      options: [
        "Not Important - Focus on artistic vision, streaming considerations secondary",
        "Somewhat Important - Consider streaming but don't compromise artistic vision",
        "Balanced Approach - Good streaming optimization while maintaining artistic integrity",
        "Very Important - Strong focus on streaming optimization and competitiveness",
        "Critical Priority - Maximum streaming optimization, competitive loudness essential"
      ]
    },
    {
      key: "pref_genre_authenticity",
      title: "Genre Authenticity vs. Innovation",
      question: "How important is staying true to traditional genre conventions versus pushing creative boundaries?",
      options: [
        "Pure Innovation - Constantly pushing boundaries, genre rules don't matter",
        "Creative Evolution - Respect tradition but always evolving and experimenting", 
        "Balanced Approach - Good mix of genre respect and creative innovation",
        "Traditional Focus - Stay close to genre conventions while adding personal touch",
        "Genre Purist - Maintain authentic genre characteristics and traditions"
      ]
    }
  ]
};

export default function KoePreferencesPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  
  // Sonic preferences
  const [sonicPrefs, setSonicPrefs] = useState({});

  // Enhanced state for music journey
  const [musicJourney, setMusicJourney] = useState({
    music_journey_stage: '',
    music_genre: '',
    preferred_daw: '',
    years_producing: '',
    production_goals: [],
    current_challenges: []
  });
  
  const totalSteps = 3; // Step 1: Music Journey, Step 2: Sonic Preferences Part 1, Step 3: Sonic Preferences Part 2

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        // Load existing sonic preferences
        const existingSonicPrefs = {};
        const allSonicQuestions = [
          ...PREFERENCE_QUESTIONS.step2,
          ...PREFERENCE_QUESTIONS.step3,
          ...PREFERENCE_QUESTIONS.step4,
          ...PREFERENCE_QUESTIONS.step5
        ];
        
        allSonicQuestions.forEach(q => {
          existingSonicPrefs[q.key] = currentUser[q.key] !== undefined ? currentUser[q.key] : 3; // Default to 3 if not set
        });
        setSonicPrefs(existingSonicPrefs);
        
        // Load existing music journey data
        setMusicJourney({
          music_journey_stage: currentUser.music_journey_stage || '',
          music_genre: currentUser.music_genre || '',
          preferred_daw: currentUser.preferred_daw || '',
          years_producing: currentUser.years_producing || '',
          production_goals: currentUser.production_goals || [],
          current_challenges: currentUser.current_challenges || []
        });
        
      } catch (error) {
        console.error('Failed to fetch user:', error);
        navigate(createPageUrl('KOE')); // Redirect if user fetch fails
      }
    };
    fetchUser();
  }, [navigate]);

  const handlePreferenceChange = (key, value) => {
    setSonicPrefs(prev => ({
      ...prev,
      [key]: value[0] // Slider returns array, we want the first value
    }));
  };

  const handleProductionGoalsChange = (goal, isChecked) => {
    setMusicJourney(prev => ({
      ...prev,
      production_goals: isChecked 
        ? [...prev.production_goals, goal]
        : prev.production_goals.filter(g => g !== goal)
    }));
  };

  const handleChallengesChange = (challenge, isChecked) => {
    setMusicJourney(prev => ({
      ...prev,
      current_challenges: isChecked 
        ? [...prev.current_challenges, challenge]
        : prev.current_challenges.filter(c => c !== challenge)
    }));
  };

  const handleSavePreferences = async () => {
    setIsSubmitting(true);
    try {
      const updateData = {
        // Music Journey data
        ...musicJourney,
        
        // Sonic Preferences data
        ...sonicPrefs,
        
        // Mark preferences as complete
        koe_preferences_complete: true
      };

      await User.updateMyUserData(updateData);
      
      // Generate personalized system prompts after saving preferences
      if (user && user.id) {
        try {
          const { generateUserSystemPrompts } = await import('@/api/functions');
          await generateUserSystemPrompts({ userId: user.id });
          console.log('System prompts generated successfully');
        } catch (promptError) {
          console.error("Failed to generate system prompts:", promptError);
          // Don't block the UI - prompt generation failure shouldn't prevent completion
        }
      }

      toast.success('Preferences Saved!', {
        description: 'KOE will now use these settings to tailor its advice.',
        duration: 3000,
      });
      navigate(createPageUrl('KOE'));
      
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // All fields for musicJourney must be filled/selected
        return musicJourney.music_journey_stage !== '' && 
               musicJourney.music_genre !== '' && 
               musicJourney.preferred_daw !== '' && 
               musicJourney.years_producing !== '' &&
               musicJourney.production_goals.length > 0 &&
               musicJourney.current_challenges.length > 0;
      case 2:
      case 3: 
        return true; // Sonic preference questions have defaults, so always allow proceed
      default: return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Tell KOE About Your Music Journey";
      case 2: return "Your Sonic Preferences - Part 1";
      case 3: return "Your Sonic Preferences - Part 2";
      default: return "";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1: return "Help KOE understand where you are and where you want to go in your music production journey.";
      case 2: return "How do you like your music to feel overall? (Sound character & frequency balance)";
      case 3: return "Final set of preferences to complete your sonic profile. (Technical approach & production philosophy)";
      default: return "";
    }
  };

  const renderSonicPreferenceSliders = (preferencesData) => {
    return (
      <div className="space-y-6">
        {preferencesData.map((pref, index) => (
          <div key={pref.key}>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              {index + 1}. {pref.title}
            </label>
            <p className="text-gray-300 text-sm mb-4">
              {pref.question}
            </p>
            <div className="px-4">
              <Slider
                value={[sonicPrefs[pref.key] || 3]}
                onValueChange={(value) => handlePreferenceChange(pref.key, value)}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{pref.options[0]}</span>
                <span>{pref.options[4]}</span>
              </div>
            </div>
             <div className="bg-black/30 rounded-lg p-3 mt-4">
               <p className="text-purple-300 text-sm font-medium">
                 Current: {pref.options[(sonicPrefs[pref.key] || 3) - 1]}
               </p>
             </div>
          </div>
        ))}
      </div>
    );
  };


  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <motion.div 
          key="step1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          {/* Titles and subtitles are now in the CardHeader, so these are redundant here: */}
          {/* <div>
            <h2 className="text-2xl font-bold text-white mb-4"></h2>
            <p className="text-blue-200 mb-8"></p>
          </div> */}

          {/* Skill Level */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-3">
              What's your current skill level in music production?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'beginner', label: 'Beginner', desc: 'Just getting started' },
                { value: 'intermediate', label: 'Intermediate', desc: '1-3 years experience' },
                { value: 'advanced', label: 'Advanced', desc: '3+ years, solid foundation' },
                { value: 'professional', label: 'Professional', desc: 'Industry level' }
              ].map((level) => (
                <button
                  key={level.value}
                  onClick={() => setMusicJourney(prev => ({ ...prev, music_journey_stage: level.value }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    musicJourney.music_journey_stage === level.value
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className="font-semibold">{level.label}</div>
                  <div className="text-xs opacity-75">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Years Producing */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-3">
              How long have you been producing music?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { value: 'less_than_1', label: 'Less than 1 year' },
                { value: '1_to_2', label: '1-2 years' },
                { value: '3_to_5', label: '3-5 years' },
                { value: '6_to_10', label: '6-10 years' },
                { value: 'more_than_10', label: '10+ years' }
              ].map((timeframe) => (
                <button
                  key={timeframe.value}
                  onClick={() => setMusicJourney(prev => ({ ...prev, years_producing: timeframe.value }))}
                  className={`p-3 rounded-xl border-2 transition-all text-center text-sm ${
                    musicJourney.years_producing === timeframe.value
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-blue-400'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Genre */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-3">
              What's your primary music genre?
            </label>
            <input
              type="text"
              value={musicJourney.music_genre}
              onChange={(e) => setMusicJourney(prev => ({ ...prev, music_genre: e.target.value }))}
              placeholder="e.g. Electronic, Hip-Hop, House, Drum & Bass..."
              className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* DAW Selection */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-3">
              What's your primary DAW (Digital Audio Workstation)?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: 'ableton', label: 'Ableton Live', icon: '🎛️' },
                { value: 'fl_studio', label: 'FL Studio', icon: '🍓' },
                { value: 'logic', label: 'Logic Pro', icon: '🍎' },
                { value: 'pro_tools', label: 'Pro Tools', icon: '🎚️' },
                { value: 'cubase', label: 'Cubase', icon: '🎹' },
                { value: 'studio_one', label: 'Studio One', icon: '1️⃣' },
                { value: 'bitwig', label: 'Bitwig', icon: '🔧' },
                { value: 'reaper', label: 'REAPER', icon: '💀' },
                { value: 'other', label: 'Other', icon: '❓' }
              ].map((daw) => (
                <button
                  key={daw.value}
                  onClick={() => setMusicJourney(prev => ({ ...prev, preferred_daw: daw.value }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    musicJourney.preferred_daw === daw.value
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{daw.icon}</span>
                    <span className="font-semibold">{daw.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Production Goals */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-3">
              What are your main production goals? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Make my tracks sound more professional',
                'Learn advanced mixing techniques',
                'Improve my sound design skills',
                'Get better at arrangement and structure',
                'Master the technical side of production',
                'Develop my unique sound/style',
                'Finish more tracks',
                'Prepare tracks for release',
                'Learn new genres and styles',
                'Improve workflow efficiency'
              ].map((goal) => (
                <label
                  key={goal}
                  className="flex items-center p-3 rounded-xl bg-gray-800/50 border border-gray-600 hover:border-blue-400 transition-all cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={musicJourney.production_goals.includes(goal)}
                    onChange={(e) => handleProductionGoalsChange(goal, e.target.checked)}
                    className="mr-3 w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-300">{goal}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Current Challenges */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-3">
              Where do you feel you need the most help? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Mixing and EQ',
                'Compression and dynamics',
                'Sound design and synthesis',
                'Arrangement and song structure',
                'Mastering and loudness',
                'Drum programming and rhythm',
                'Basslines and low-end',
                'Melody and harmony',
                'Vocal processing',
                'Finishing tracks',
                'Creative inspiration',
                'Technical troubleshooting'
              ].map((challenge) => (
                <label
                  key={challenge}
                  className="flex items-center p-3 rounded-xl bg-gray-800/50 border border-gray-600 hover:border-blue-400 transition-all cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={musicJourney.current_challenges.includes(challenge)}
                    onChange={(e) => handleChallengesChange(challenge, e.target.checked)}
                    className="mr-3 w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-300">{challenge}</span>
                </label>
              ))}
            </div>
          </div>
        </motion.div>
      );
    }

    if (currentStep === 2) {
      return (
        <motion.div 
          key="step2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          {renderSonicPreferenceSliders([
            ...PREFERENCE_QUESTIONS.step2,
            ...PREFERENCE_QUESTIONS.step3
          ])}
        </motion.div>
      );
    }

    if (currentStep === 3) {
      return (
        <motion.div 
          key="step3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          {renderSonicPreferenceSliders([
            ...PREFERENCE_QUESTIONS.step4,
            ...PREFERENCE_QUESTIONS.step5
          ])}
        </motion.div>
      );
    }
    return null; // Should not happen
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      {/* Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("KOE"))}
          className="text-white/90 hover:text-white hover:bg-white/20 rounded-xl backdrop-blur-xl bg-black/40 border border-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="max-w-4xl mx-auto pt-20 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Personalize Your KOE Experience
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Help KOE understand your musical taste so it can give you perfectly tailored feedback that matches your artistic vision.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="backdrop-blur-xl bg-black/50 border border-purple-500/30 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Music className="w-6 h-6 text-purple-400" />
                {getStepTitle()}
              </div>
            </CardTitle>
            <p className="text-gray-300 text-center">{getStepSubtitle()}</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSavePreferences}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
                >
                  {isSubmitting ? 'Saving...' : 'Complete Setup'}
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 text-sm">
            These preferences help KOE understand your unique artistic vision and provide perfectly tailored feedback.
            <br />
            You can always update these settings later from your KOE dashboard.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
