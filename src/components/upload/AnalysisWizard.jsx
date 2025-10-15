
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle }
  from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, FileAudio, Music, Palette, Target, BarChart3, Loader2 } from 'lucide-react';

const WizardStep = ({ children, title, subtitle, step, totalSteps }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className="w-full max-w-2xl mx-auto"
  >
    <div className="mb-8">
      <Progress value={(step / totalSteps) * 100} className="mb-4" />
      <div className="flex justify-between text-sm text-gray-400 mb-6">
        <span>Step {step} of {totalSteps}</span>
        <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-300 text-lg">{subtitle}</p>
    </div>
    {children}
  </motion.div>
);

const SelectionButton = ({ selected, onClick, children, icon: Icon }) => (
  <Button
    variant={selected ? "default" : "outline"}
    onClick={onClick}
    className={`p-6 h-auto flex items-center gap-3 text-left transition-all duration-300 ${
      selected 
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg' 
        : 'bg-black/40 border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50'
    }`}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    <span className="flex-1">{children}</span>
  </Button>
);

export default function AnalysisWizard({ file, onAnalyze, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selections, setSelections] = useState({
    trackType: null,
    genre: null,
    style: null
  });

  const trackTypes = [
    { id: 'mix', label: 'Mix', description: 'Track is mixed and ready for mastering', icon: Music },
    { id: 'master', label: 'Master', description: 'Track is mastered and ready for release', icon: Target }
  ];

  const genres = [
    'Acoustic', 'Afrobeat', 'Ambient', 'Blues', 'Country', 'Drum \'n\' Bass', 'Electronic', 
    'Experimental', 'Folk', 'Funk', 'Hip-hop/Grime', 'House', 'Indie Pop', 'Indie Rock', 
    'Jazz', 'Latin', 'Lo-Fi', 'Metal', 'Orchestra/Classical', 'Pop', 'Punk', 'R\'n\'B', 
    'Reggae', 'Rock', 'Soul', 'Techno', 'Trance', 'Trap'
  ];

  const styles = [
    'Aggressive', 'Airy/Expansive', 'Bright', 'Gritty/Crunchy', 'Mellow/Smooth', 
    'Sharp/Bassy', 'Thumping/Boomy', 'Warm', 'Neutral'
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Start analysis with collected data - Fix the genre mapping
      const genreMapping = {
        'Acoustic': 'ACOUSTIC',
        'Afrobeat': 'AFROBEAT', 
        'Ambient': 'AMBIENT',
        'Blues': 'BLUES',
        'Country': 'COUNTRY',
        'Drum \'n\' Bass': 'DRUM_N_BASS', // Fixed: single underscores
        'Electronic': 'ELECTRONIC',
        'Experimental': 'EXPERIMENTAL',
        'Folk': 'FOLK',
        'Funk': 'FUNK',
        'Hip-hop/Grime': 'HIP_HOP_GRIME',
        'House': 'HOUSE',
        'Indie Pop': 'INDIE_POP',
        'Indie Rock': 'INDIE_ROCK',
        'Jazz': 'JAZZ',
        'Latin': 'LATIN',
        'Lo-Fi': 'LO_FI',
        'Metal': 'METAL',
        'Orchestra/Classical': 'ORCHESTRAL',
        'Pop': 'POP',
        'Punk': 'PUNK',
        'R\'n\'B': 'RNB',
        'Reggae': 'REGGAE',
        'Rock': 'ROCK',
        'Soul': 'SOUL',
        'Techno': 'TECHNO',
        'Trance': 'TRANCE',
        'Trap': 'TRAP'
      };

      onAnalyze({
        trackType: selections.trackType,
        genre: selections.genre,
        style: selections.style,
        musicalStyle: genreMapping[selections.genre] || 'DRUM_N_BASS',
        isMaster: selections.trackType === 'master'
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selections.trackType;
      case 2: return selections.genre;
      case 3: return selections.style;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30 shadow-2xl">
      <CardContent className="p-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <WizardStep
              key="step1"
              title="Is your track a mix or master?"
              subtitle="You should only upload audio files that you own, control or have permission from the relevant rights holder/s to use. Your privacy matters: We do not use your songs to train AI."
              step={1}
              totalSteps={4}
            >
              <div className="space-y-4 mb-8">
                {trackTypes.map(type => (
                  <SelectionButton
                    key={type.id}
                    selected={selections.trackType === type.id}
                    onClick={() => setSelections({...selections, trackType: type.id})}
                    icon={type.icon}
                  >
                    <div>
                      <div className="font-semibold">{type.label}</div>
                      <div className="text-sm opacity-80">{type.description}</div>
                    </div>
                  </SelectionButton>
                ))}
              </div>
            </WizardStep>
          )}

          {currentStep === 2 && (
            <WizardStep
              key="step2"
              title="Which genre most closely describes your sound?"
              subtitle="This will help provide more tailored feedback for your mix report."
              step={2}
              totalSteps={4}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {genres.map(genre => (
                  <Button
                    key={genre}
                    variant={selections.genre === genre ? "default" : "outline"}
                    onClick={() => setSelections({...selections, genre})}
                    className={`transition-all duration-300 ${
                      selections.genre === genre
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0' 
                        : 'bg-black/40 border-blue-500/30 text-white hover:bg-blue-500/10'
                    }`}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </WizardStep>
          )}

          {currentStep === 3 && (
            <WizardStep
              key="step3"
              title="How would you describe your mix style for this track? (Optional)"
              subtitle="Tell us more about your intended style to help us fine-tune our analysis."
              step={3}
              totalSteps={4}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {styles.map(style => (
                  <Button
                    key={style}
                    variant={selections.style === style ? "default" : "outline"}
                    onClick={() => setSelections({...selections, style})}
                    className={`transition-all duration-300 ${
                      selections.style === style
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0' 
                        : 'bg-black/40 border-blue-500/30 text-white hover:bg-blue-500/10'
                    }`}
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </WizardStep>
          )}

          {currentStep === 4 && (
            <WizardStep
              key="step4"
              title="Ready to analyze your track"
              subtitle="We'll analyze your audio using advanced AI to provide detailed feedback and suggestions."
              step={4}
              totalSteps={4}
            >
              <div className="bg-black/40 rounded-xl p-6 border border-blue-500/30 mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <FileAudio className="w-8 h-8 text-blue-400" />
                  <div>
                    <h3 className="text-white font-semibold">{file.name}</h3>
                    <p className="text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <p className="text-white font-medium capitalize">{selections.trackType}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Genre:</span>
                    <p className="text-white font-medium">{selections.genre}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Style:</span>
                    <p className="text-white font-medium">{selections.style || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </WizardStep>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 font-semibold disabled:opacity-50"
          >
            {currentStep === 4 ? (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Start Analysis
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
