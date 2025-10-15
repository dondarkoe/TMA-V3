
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
// import { summarizeArkUserProfile } from '@/api/functions'; // This import is no longer needed

const ONBOARDING_STEPS = [
  {
    id: 'friend_group_role',
    title: "When you're hanging out with friends...",
    subtitle: "What role do you naturally play in the group?",
    field: 'friend_group_role',
    options: [
      {
        value: 'comedian',
        label: 'The Comedian',
        description: 'Always cracking jokes, making people laugh, sharing memes',
        icon: '😂'
      },
      {
        value: 'advisor',
        label: 'The Advisor',
        description: 'People come to you for advice, you share helpful tips',
        icon: '🧠'
      },
      {
        value: 'storyteller',
        label: 'The Storyteller',
        description: 'You love sharing experiences and telling detailed stories',
        icon: '📖'
      },
      {
        value: 'motivator',
        label: 'The Motivator',
        description: 'You\'re always encouraging others and lifting spirits',
        icon: '💪'
      },
      {
        value: 'cool_one',
        label: 'The Cool One',
        description: 'You keep things chill, don\'t say much but it\'s always good',
        icon: '😎'
      }
    ]
  },
  {
    id: 'sharing_news',
    title: "When something exciting happens to you...",
    subtitle: "How do you usually share the news?",
    field: 'sharing_news',
    options: [
      {
        value: 'full_story',
        label: 'Tell the Full Story',
        description: 'All the details, context, how it happened step by step',
        icon: '📚'
      },
      {
        value: 'quick_blast',
        label: 'Quick Blast',
        description: 'Straight to the point, no fluff, just the main thing',
        icon: '⚡'
      },
      {
        value: 'show_not_tell',
        label: 'Show, Don\'t Tell',
        description: 'Post a photo/video, let people figure it out',
        icon: '📸'
      },
      {
        value: 'casual_mention',
        label: 'Casual Mention',
        description: 'Bring it up naturally in conversation, no big announcement',
        icon: '💬'
      }
    ]
  },
  {
    id: 'social_media_vibe',
    title: "When you post on social media...",
    subtitle: "What vibe are you usually going for?",
    field: 'social_media_vibe',
    options: [
      {
        value: 'fun_vibes',
        label: 'Fun Vibes',
        description: 'Keep it light, entertaining, good energy',
        icon: '🎉'
      },
      {
        value: 'real_talk',
        label: 'Real Talk',
        description: 'Honest, authentic, no filter, keep it 100',
        icon: '💯'
      },
      {
        value: 'helpful_content',
        label: 'Helpful Content',
        description: 'Share useful stuff, tips, things people can learn from',
        icon: '🤝'
      },
      {
        value: 'inspire_people',
        label: 'Inspire People',
        description: 'Motivate others, share positive energy and encouragement',
        icon: '✨'
      },
      {
        value: 'professional_image',
        label: 'Professional Image',
        description: 'Clean, polished, show your expertise and credibility',
        icon: '💼'
      }
    ]
  },
  {
    id: 'music_posts_engagement',
    title: "When you post about your music...",
    subtitle: "Who usually engages the most?",
    field: 'music_posts_engagement',
    options: [
      {
        value: 'other_producers',
        label: 'Other Producers',
        description: 'People who make music, understand the technical stuff',
        icon: '🎛️'
      },
      {
        value: 'regular_music_fans',
        label: 'Regular Music Fans',
        description: 'People who just love music, not necessarily producers',
        icon: '🎵'
      },
      {
        value: 'aspiring_musicians',
        label: 'Aspiring Musicians',
        description: 'People trying to learn, asking "how did you do this?"',
        icon: '🌟'
      },
      {
        value: 'industry_people',
        label: 'Industry People',
        description: 'Labels, managers, other professionals in music',
        icon: '🏢'
      },
      {
        value: 'mixed_crowd',
        label: 'Mixed Crowd',
        description: 'All different types of people, hard to pin down',
        icon: '🌍'
      }
    ]
  },
  {
    id: 'content_creation_comfort',
    title: "What types of content do you actually enjoy making?",
    subtitle: "Select all that apply - what feels natural to you?",
    field: 'content_creation_comfort',
    multiple: true,
    options: [
      {
        value: 'phone_videos',
        label: 'Phone Videos',
        description: 'Quick videos on your phone, nothing fancy',
        icon: '📱'
      },
      {
        value: 'behind_scenes',
        label: 'Behind the Scenes',
        description: 'Showing your process, how you work',
        icon: '🎬'
      },
      {
        value: 'talking_to_camera',
        label: 'Talking to Camera',
        description: 'Just you explaining or sharing thoughts',
        icon: '🗣️'
      },
      {
        value: 'text_posts',
        label: 'Text Posts',
        description: 'Writing thoughts, stories, updates',
        icon: '📝'
      },
      {
        value: 'photo_stories',
        label: 'Photo Stories',
        description: 'Pictures with captions that tell a story',
        icon: '📖'
      },
      {
        value: 'tutorials',
        label: 'Tutorials',
        description: 'Teaching others how to do things',
        icon: '🎓'
      }
    ]
  },
  {
    id: 'personal_sharing',
    title: "When it comes to sharing personal stuff online...",
    subtitle: "What feels right for you?",
    field: 'personal_sharing',
    options: [
      {
        value: 'open_book',
        label: 'I\'m an Open Book',
        description: 'Share struggles, wins, personal journey openly',
        icon: '📖'
      },
      {
        value: 'selective_sharing',
        label: 'Selective Sharing',
        description: 'Share some personal stuff but pick and choose',
        icon: '🎯'
      },
      {
        value: 'mostly_professional',
        label: 'Keep It Professional',
        description: 'Focus on the music/work, less personal stuff',
        icon: '💼'
      },
      {
        value: 'private_person',
        label: 'I\'m Pretty Private',
        description: 'Prefer to keep personal life separate',
        icon: '🔒'
      }
    ]
  }
];

export default function ArkOnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const totalSteps = ONBOARDING_STEPS.length;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        // Load existing responses if user has completed onboarding
        if (currentUser.ark_onboarding_complete && currentUser.ark_onboarding_responses) {
          setResponses(currentUser.ark_onboarding_responses);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        navigate(createPageUrl('Dashboard'));
      }
    };
    fetchUser();
  }, [navigate]);

  const handleResponse = (value) => {
    if (currentStepData.multiple) {
      // Multiple choice handling
      const currentValues = responses[currentStepData.field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      setResponses(prev => ({
        ...prev,
        [currentStepData.field]: newValues
      }));
    } else {
      // Single choice handling
      setResponses(prev => ({
        ...prev,
        [currentStepData.field]: value
      }));
    }
  };

  const canProceed = () => {
    if (currentStepData.multiple) {
      return responses[currentStepData.field]?.length > 0;
    }
    return responses[currentStepData.field] !== undefined;
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Map easy answers to ARK preferences
  const mapResponsesToArkPreferences = (responses) => {
    const mapped = {};

    // Map friend group role to content voice
    switch (responses.friend_group_role) {
      case 'comedian':
        mapped.ark_content_voice = 'casual_funny';
        break;
      case 'advisor':
        mapped.ark_content_voice = 'educational_helpful';
        break;
      case 'storyteller':
        mapped.ark_content_voice = 'educational_helpful';
        break;
      case 'motivator':
        mapped.ark_content_voice = 'inspirational_motivational';
        break;
      case 'cool_one':
        mapped.ark_content_voice = 'edgy_authentic';
        break;
      default:
        mapped.ark_content_voice = 'professional_clean';
    }

    // Map sharing news to storytelling style
    switch (responses.sharing_news) {
      case 'full_story':
        mapped.ark_storytelling_style = 'detailed_storyteller';
        break;
      case 'quick_blast':
        mapped.ark_storytelling_style = 'quick_punchy';
        break;
      case 'show_not_tell':
        mapped.ark_storytelling_style = 'visual_focused';
        break;
      case 'casual_mention':
        mapped.ark_storytelling_style = 'conversation_style';
        break;
      default:
        mapped.ark_storytelling_style = 'quick_punchy';
    }

    // Map social media vibe to brand personality
    switch (responses.social_media_vibe) {
      case 'fun_vibes':
        mapped.ark_brand_personality = 'fun_playful';
        break;
      case 'real_talk':
        mapped.ark_brand_personality = 'relatable_friend';
        break;
      case 'helpful_content':
        mapped.ark_brand_personality = 'expert_teacher';
        break;
      case 'inspire_people':
        mapped.ark_brand_personality = 'expert_teacher';
        break;
      case 'professional_image':
        mapped.ark_brand_personality = 'serious_professional';
        break;
      default:
        mapped.ark_brand_personality = 'relatable_friend';
    }

    // Map music engagement to audience type
    switch (responses.music_posts_engagement) {
      case 'other_producers':
        mapped.ark_audience_type = 'fellow_producers';
        break;
      case 'regular_music_fans':
        mapped.ark_audience_type = 'general_music_fans';
        break;
      case 'aspiring_musicians':
        mapped.ark_audience_type = 'aspiring_artists';
        break;
      case 'industry_people':
        mapped.ark_audience_type = 'industry_professionals';
        break;
      case 'mixed_crowd':
        mapped.ark_audience_type = 'mixed_audience';
        break;
      default:
        mapped.ark_audience_type = 'mixed_audience';
    }

    // Map content creation comfort to content formats
    if (responses.content_creation_comfort) {
      mapped.ark_content_formats = responses.content_creation_comfort.map(comfort => {
        switch (comfort) {
          case 'phone_videos': return 'instagram_reels';
          case 'behind_scenes': return 'instagram_stories';
          case 'talking_to_camera': return 'tiktok';
          case 'text_posts': return 'twitter_threads';
          case 'photo_stories': return 'instagram_stories';
          case 'tutorials': return 'youtube_long';
          default: return 'instagram_reels';
        }
      });
    } else {
      mapped.ark_content_formats = ['instagram_reels'];
    }

    // Map personal sharing to vulnerability level
    switch (responses.personal_sharing) {
      case 'open_book':
        mapped.ark_vulnerability_level = 'very_open';
        break;
      case 'selective_sharing':
        mapped.ark_vulnerability_level = 'selectively_vulnerable';
        break;
      case 'mostly_professional':
        mapped.ark_vulnerability_level = 'professional_boundaries';
        break;
      case 'private_person':
        mapped.ark_vulnerability_level = 'private_person';
        break;
      default:
        mapped.ark_vulnerability_level = 'selectively_vulnerable';
    }

    return mapped;
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const arkPreferences = mapResponsesToArkPreferences(responses);

      const updatePayload = {
        ...arkPreferences,
        ark_onboarding_complete: true,
        ark_onboarding_responses: responses
      };

      await User.updateMyUserData(updatePayload);

      // Generate personalized system prompts after completing onboarding
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

      navigate(createPageUrl('ArkDashboard'));
    } catch (error) {
      console.error('Failed to save ARK preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative">
      {/* Back Button - Fixed position */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="text-white/90 hover:text-white hover:bg-white/20 rounded-xl backdrop-blur-xl bg-black/40 border border-white/20 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div
        className="absolute inset-0 opacity-20 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(249, 115, 22, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(249, 115, 22, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-20 sm:pt-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Let's Get to Know You
          </h1>
          <p className="text-orange-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Just a few quick questions about how you naturally communicate. No wrong answers - just be yourself!
          </p>
        </motion.div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete</span>
          </div>
          <Progress value={((currentStep + 1) / totalSteps) * 100} className="h-2" />
        </div>

        <Card className="backdrop-blur-xl bg-black/50 border border-orange-500/30 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-white text-2xl">
              {currentStepData.title}
            </CardTitle>
            <p className="text-gray-300 text-lg">{currentStepData.subtitle}</p>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {currentStepData.options.map((option) => {
                  const isSelected = currentStepData.multiple
                    ? (responses[currentStepData.field] || []).includes(option.value)
                    : responses[currentStepData.field] === option.value;

                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => handleResponse(option.value)}
                      className={`w-full p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? 'border-orange-400 bg-orange-500/20 shadow-lg'
                          : 'border-gray-600 hover:border-orange-500/50 hover:bg-orange-500/10 bg-black/20'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-2xl flex-shrink-0 mt-1">
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {option.label}
                          </h3>
                          <p className="text-gray-400 text-sm leading-relaxed">
                            {option.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-orange-500/20">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 font-semibold disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 mr-2"
                    >
                      ⏳
                    </motion.div>
                    Setting up ARK...
                  </>
                ) : currentStep === totalSteps - 1 ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Let's Go!
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 text-sm">
            We're learning about your natural communication style to make ARK work perfectly for you.
            <br />
            This helps us suggest content that feels authentically <em>you</em>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
