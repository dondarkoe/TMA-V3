
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Sparkles, Music, Instagram, Users, ArrowRight } from 'lucide-react';
import { User as UserEntity } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    skool_profile_link: '',
    instagram_link: '',
    music_journey_stage: '',
    music_genre: '',
    excited_to_try: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await UserEntity.updateMyUserData({
        ...formData,
        onboarding_complete: true,
        membership_level: 'pro' // Grant pro access immediately upon onboarding completion
      });

      // Redirect to dashboard
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      alert('There was an error completing your onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = formData.skool_profile_link && formData.instagram_link && formData.music_journey_stage;
  const canSubmit = canProceedToStep2 && formData.music_genre && formData.excited_to_try;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to TMA Engine OS! 🎵
          </h1>
          <p className="text-gray-300 text-lg">
            Let's get to know you and set up your personalized music production experience
          </p>
        </motion.div>

        <Card className="backdrop-blur-xl bg-black/50 border border-blue-500/30 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-400" />
              Step {currentStep} of 2: {currentStep === 1 ? 'Community & Experience' : 'Music & Goals'}
            </CardTitle>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 2) * 100}%` }}
              />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Skool Profile Link */}
                  <div>
                    <label className="flex items-center gap-2 text-white font-medium mb-3">
                      <Users className="w-5 h-5 text-blue-400" />
                      Your Skool Community Profile Link *
                    </label>
                    <Input
                      type="url"
                      placeholder="https://www.skool.com/your-profile"
                      value={formData.skool_profile_link}
                      onChange={(e) => handleInputChange('skool_profile_link', e.target.value)}
                      className="backdrop-blur-xl bg-black/60 border-blue-500/40 text-white placeholder-gray-400"
                      required
                    />
                    <p className="text-gray-400 text-sm mt-2">
                      This helps us verify your membership in our community
                    </p>
                  </div>

                  {/* Instagram Link - NOW REQUIRED */}
                  <div>
                    <label className="flex items-center gap-2 text-white font-medium mb-3">
                      <Instagram className="w-5 h-5 text-blue-400" />
                      Instagram Profile *
                    </label>
                    <Input
                      type="url"
                      placeholder="https://instagram.com/yourusername"
                      value={formData.instagram_link}
                      onChange={(e) => handleInputChange('instagram_link', e.target.value)}
                      className="backdrop-blur-xl bg-black/60 border-blue-500/40 text-white placeholder-gray-400"
                      required
                    />
                    <p className="text-gray-400 text-sm mt-2">
                      Required to verify your identity and connect with the community
                    </p>
                  </div>

                  {/* Music Journey Stage */}
                  <div>
                    <label className="flex items-center gap-2 text-white font-medium mb-3">
                      <User className="w-5 h-5 text-blue-400" />
                      Where are you on your music journey? *
                    </label>
                    <Select value={formData.music_journey_stage} onValueChange={(value) => handleInputChange('music_journey_stage', value)}>
                      <SelectTrigger className="backdrop-blur-xl bg-black/60 border-blue-500/40 text-white">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">🌱 Beginner - Just starting out</SelectItem>
                        <SelectItem value="intermediate">🎵 Intermediate - Been at it for a while</SelectItem>
                        <SelectItem value="advanced">🚀 Advanced - Pretty experienced</SelectItem>
                        <SelectItem value="professional">⭐ Professional - This is my career</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      disabled={!canProceedToStep2}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold border-0 disabled:opacity-50"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Music Genre */}
                  <div>
                    <label className="flex items-center gap-2 text-white font-medium mb-3">
                      <Music className="w-5 h-5 text-blue-400" />
                      What type of music do you primarily make? *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Hip-hop, EDM, Pop, Rock, Jazz, etc."
                      value={formData.music_genre}
                      onChange={(e) => handleInputChange('music_genre', e.target.value)}
                      className="backdrop-blur-xl bg-black/60 border-blue-500/40 text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  {/* Excited to Try */}
                  <div>
                    <label className="flex items-center gap-2 text-white font-medium mb-3">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                      What are you most excited to try with TMA Engine OS? *
                    </label>
                    <Textarea
                      placeholder="Tell us what you're hoping to learn, create, or improve on..."
                      value={formData.excited_to_try}
                      onChange={(e) => handleInputChange('excited_to_try', e.target.value)}
                      className="backdrop-blur-xl bg-black/60 border-blue-500/40 text-white placeholder-gray-400 h-24"
                      required
                    />
                    <p className="text-gray-400 text-sm mt-2">
                      This helps us personalize your experience and connect you with relevant features
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold border-0 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Completing...' : 'Complete Setup'}
                      <Sparkles className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </form>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 text-sm">
            After completing this setup, your account will be reviewed for access approval.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
