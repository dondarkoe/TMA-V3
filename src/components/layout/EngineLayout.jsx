
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Music,
  BarChart3,
  GitCompare,
  Wrench,
  Zap,
  Video,
  ClipboardList,
  Award,
  User,
  FileText,
  Target,
  Palette,
  Settings,
  BrainCircuit,
  Sparkles
  // ChevronLeft, // Removed as Sidebar components will manage collapse UI
  // ChevronRight // Removed as Sidebar components will manage collapse UI
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger } from
'@/components/ui/sidebar';

const engineConfigs = {
  KOE: {
    name: 'KOE',
    subtitle: 'Audio Engine',
    color: 'blue',
    gradient: 'from-blue-600/20 via-blue-500/10 to-cyan-400/20',
    accentColor: 'rgb(59, 130, 246)',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    tools: [
    {
      id: 'chat',
      name: 'KOE Studio Session',
      icon: MessageSquare,
      path: 'KOE',
      description: 'AI Production Assistant'
    },
    {
      id: 'sessions',
      name: 'View Sessions',
      icon: MessageSquare,
      path: 'KOE', // Will use URL param or state to show sessions view
      description: 'Previous Conversations',
      isSubTool: true, // Mark as sub-tool for styling
      parentTool: 'chat'
    },
    {
      id: 'upload',
      name: 'Music Analysis',
      icon: Music,
      path: 'Upload',
      description: 'Analyze Your Tracks'
    },
    {
      id: 'analyses',
      name: 'My Analyses',
      icon: BarChart3,
      path: 'Analyses',
      description: 'Analysis History'
    },
    {
      id: 'compare',
      name: 'Mix Comparison',
      icon: GitCompare,
      path: 'MixCompare',
      description: 'A/B Testing'
    },
    {
      id: 'serenader',
      name: 'KOE Serenader',
      icon: Wrench,
      path: 'KoeSerenader',
      description: 'Chord Generator'
    }]

  },
  ARK: {
    name: 'ARK',
    subtitle: 'Content Turbo',
    color: 'orange',
    gradient: 'from-orange-600/20 via-orange-500/10 to-amber-400/20',
    accentColor: 'rgb(249, 115, 22)',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    tools: [
    {
      id: 'dashboard',
      name: 'Creative Intelligence',
      icon: BarChart3,
      path: 'ArkDashboard',
      description: 'Your creative readiness & insights'
    },
    {
      id: 'chat',
      name: 'ARK Creative Studio',
      icon: Sparkles,
      path: 'ArkChat',
      description: 'Content creation workspace'
    },
    {
      id: 'content-ideas',
      name: 'Your Content Ideas',
      icon: FileText,
      path: 'YourContentIdeas',
      description: 'Saved Scripts Library'
    },
    {
      id: 'braindumps',
      name: 'Your Brain Dumps',
      icon: BrainCircuit,
      path: 'YourBrainDumps',
      description: 'Review your raw thoughts'
    },
    {
      id: 'shotlist',
      name: 'Shotlist Builder',
      icon: ClipboardList,
      path: 'ArkShotlistBuilder',
      description: 'Visual Planning'
    },
    {
      id: 'my-shotlists',
      name: 'My Shotlists',
      icon: Video,
      path: 'MyShotlists',
      description: 'Saved Visual Storyboards'
    }]

  },
  INDI: {
    name: 'INDI',
    subtitle: 'Brand Dynamics',
    color: 'green',
    gradient: 'from-emerald-600/20 via-green-500/10 to-teal-400/20',
    accentColor: 'rgb(16, 185, 129)',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    tools: [
    {
      id: 'identity',
      name: 'Brand Identity Analysis',
      icon: User,
      path: 'INDI',
      description: 'Discover Your Archetype',
      disabled: true
    },
    {
      id: 'epk',
      name: 'EPK Generator',
      icon: FileText,
      path: 'INDI',
      description: 'Professional Press Kit',
      disabled: true
    },
    {
      id: 'audience',
      name: 'Audience Targeting',
      icon: Target,
      path: 'INDI',
      description: 'Know Your Fans',
      disabled: true
    },
    {
      id: 'visual',
      name: 'Visual Identity',
      icon: Palette,
      path: 'INDI',
      description: 'Consistent Branding',
      disabled: true
    }]

  },
  TMA: {
    name: 'SYSTEM',
    subtitle: 'Engine OS',
    color: 'cyan',
    gradient: 'from-cyan-600/20 via-gray-500/10 to-gray-400/20',
    accentColor: 'rgb(34, 211, 238)',
    glowColor: 'rgba(34, 211, 238, 0.3)',
    tools: [
      {
        id: 'global-settings',
        name: 'Global AI Settings',
        icon: Settings,
        path: 'GlobalAISettings',
        description: 'Manage universal system prompts'
      },
      {
        id: 'manage-assistants',
        name: 'Manage Assistants',
        icon: BrainCircuit,
        path: 'ManageAssistants',
        description: 'Configure AI assistant personas'
      }
    ]
  }
};

export default function EngineLayout({
  children,
  engineType,
  currentPageName,
  defaultTool = 'chat'
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTool, setCurrentTool] = useState(defaultTool);
  const [user, setUser] = useState(null);

  // Add user fetching - MOVED BEFORE CONFIG CHECK
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { User } = await import('@/api/entities');
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.log('User not authenticated:', error);
      }
    };
    fetchUser();
  }, []);

  const config = engineConfigs[engineType];

  useEffect(() => {
    // Only run if config exists to avoid errors
    if (!config || !config.tools) return;

    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1].toLowerCase();
    const queryParams = new URLSearchParams(location.search);
    const viewParam = queryParams.get('view');

    let newCurrentTool = defaultTool; // Start with default

    if (engineType === 'KOE') {
      if (lastSegment === 'koepreferences') {
        newCurrentTool = 'preferences';
      } else if (lastSegment === 'koe' || lastSegment === 'koechat') {
        if (viewParam === 'sessions') {
          newCurrentTool = 'sessions';
        } else {
          newCurrentTool = 'chat';
        }
      } else {
        // Find if any other KOE tool matches the path (excluding sub-tools which share a path)
        const matchedTool = config.tools.find((tool) =>
          tool.path.toLowerCase() === lastSegment && !tool.isSubTool
        );
        if (matchedTool) {
          newCurrentTool = matchedTool.id;
        } else {
          // If no match, default to 'chat' for KOE unless it's preferences
          newCurrentTool = 'chat';
        }
      }
    } else {
      // For ARK, INDI and TMA engines
      const matchedTool = config.tools.find((tool) =>
        tool.path.toLowerCase() === lastSegment ||
        tool.id === lastSegment
      );
      if (matchedTool) {
        newCurrentTool = matchedTool.id;
      } else {
        // Fallback for other engines if no tool matches
        newCurrentTool = defaultTool;
      }
    }

    setCurrentTool(newCurrentTool);

  }, [location, config, engineType, defaultTool]); // Added 'config' to dependency array

  // Add error handling for undefined config - MOVED AFTER HOOKS
  if (!config) {
    console.error(`Invalid engineType: ${engineType}. Available types:`, Object.keys(engineConfigs));
    // Fallback to a default config or redirect
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
          <p className="text-gray-400 mb-6">Invalid engine type: {engineType}</p>
          <button
            onClick={() => navigate('/Dashboard')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // const toggleSidebar = () => setSidebarOpen(!sidebarOpen); // Removed
  // const toggleSidebarCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed); // Removed
  const handleLinkClick = () => {


    // The sidebar will auto-close on mobile via the new system
  };return <SidebarProvider>
      <div className="h-screen flex relative overflow-hidden engine-layout" style={{ background: `transparent`, '--engine-accent': config.accentColor, '--engine-glow': config.glowColor
      }}>

        {/* REMOVED: All Spline 3D Backgrounds and generic background elements */}

        {/* Mobile Header - Only shows on mobile */}
        <header className="fixed top-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/20 px-4 py-3 md:hidden">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight uppercase">
                TMA ENGINE OS
              </h1>
              <p className="text-sm text-gray-300 font-medium tracking-wider">
                {config.name} - {config.subtitle}
              </p>
            </div>
          </div>
        </header>

        {/* SIDEBAR using new system */}
        <Sidebar className="bg-black/80 mx-auto my-1 px-3 fixed left-0 top-0 h-full z-50 w-70 flex-shrink-0 backdrop-blur-xl border-r border-white/20 shadow-2xl">
          {/* Desktop Header - Hidden on mobile since we have the mobile header */}
          <SidebarHeader className="flex-shrink-0 p-4 border-b border-white/10 hidden md:block">
            <h1 className="text-xl font-bold text-white tracking-tight uppercase mb-2">
              TMA ENGINE OS
            </h1>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight uppercase">
                {config.name}
              </h2>
              <p className="text-sm text-gray-300 font-medium tracking-wider">
                {config.subtitle}
              </p>
            </div>
          </SidebarHeader>

          {/* Sidebar Navigation - Added breathing room on mobile */}
          <SidebarContent className="pt-16 pr-5 pb-3 flex-1 overflow-y-auto md:pt-3 space-y-3">
            <SidebarMenu>
              {config.tools.map((tool) => {
              const isActive = currentTool === tool.id;
              const IconComponent = tool.icon;
              const isSubTool = tool.isSubTool;

              return (
                <SidebarMenuItem key={tool.id}>
                    <Link
                    to={tool.id === 'sessions' ? createPageUrl(tool.path) + '?view=sessions' : createPageUrl(tool.path)}
                    onClick={handleLinkClick}>

                      <SidebarMenuButton
                      isActive={isActive}
                      className={`
                          ${isSubTool ? 'ml-4 border-l-2 border-l-blue-500/30' : ''}
                          ${tool.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          py-4 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02]
                        `}
                      style={isActive ? {
                        boxShadow: `0 0 20px ${config.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                      } : {}}>

                        {isActive &&
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                        style={{ backgroundColor: config.accentColor }} />

                      }

                        <div className={`
                          ${isSubTool ? 'w-8 h-8' : 'w-12 h-12'} rounded-xl flex items-center justify-center flex-shrink-0
                          ${isActive ? 'bg-white/15' : 'bg-white/5'}
                          transition-all duration-300 mr-4
                        `}>
                          <IconComponent
                          className={`${isSubTool ? 'w-4 h-4' : 'w-6 h-6'} ${isActive ? 'text-white' : 'text-white/80'}`} />

                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`
                            font-semibold truncate mb-1
                            ${isSubTool ? 'text-sm' : 'text-lg'}
                            ${isActive ? 'text-white' : 'text-white/90'}
                          `}>
                            {tool.name}
                          </p>
                          <p className={`
                            text-sm truncate
                            ${isActive ? 'text-white/80' : 'text-white/60'}
                          `}>
                            {tool.description}
                          </p>
                        </div>

                        {tool.disabled &&
                      <div className="px-2 py-1 bg-gray-600/50 rounded text-xs text-gray-300 ml-auto">
                            SOON
                          </div>
                      }
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>);

            })}
            </SidebarMenu>
          </SidebarContent>

          {/* Sidebar Footer */}
          <SidebarFooter className="p-4 space-y-4">
            {/* Compact User Profile */}
            {user &&
          <div className="mr-16 pr-1 flex items-center justify-between">
                <button
              onClick={() => {
                const targetPage = engineType === 'KOE' ? 'KoePreferences' : 'ArkOnboarding';
                navigate(createPageUrl(targetPage));
              }}
              className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">

                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  {user.membership_level && user.membership_level !== 'guest' &&
              <span className="px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300 text-xs uppercase font-medium">
                      {user.membership_level}
                    </span>
              }
                </button>

                {/* Settings/Preferences Icon */}
                <button
              onClick={() => {
                const targetPage = engineType === 'KOE' ? 'KoePreferences' : 'ArkOnboarding';
                navigate(createPageUrl(targetPage));
              }} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center text-gray-400 hover:text-white">


                  <Settings className="w-4 h-4" />
                </button>
              </div>
          }

            {/* Back to Dashboard */}
            <Link to={createPageUrl('Dashboard')} onClick={handleLinkClick}>
              <Button
              variant="ghost" className="text-white/60 my-4 px-3 py-12 text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 w-full hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 justify-start">


                <span className="text-sm font-medium">← Back to Dashboard</span>
              </Button>
            </Link>
          </SidebarFooter>
        </Sidebar>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 relative z-20 md:pt-0 pt-20" style={{ background: 'transparent' }}>
          <div className="flex-1 relative overflow-hidden" style={{ background: 'transparent' }}>
            <motion.div
            key={currentPageName}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }} className="h-full"

            style={{ background: 'transparent' }}>

              {/* CONTENT CONTAINER */}
              <div className={`h-full backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-30 m-2 sm:m-3 md:m-6`}
            style={{ background: 'transparent' }}>
                <div className="h-full overflow-y-auto custom-scrollbar" style={{ background: 'transparent' }}>
                  {/* CONTENT WITH FULL INTERACTION - Removed padding to fit screen */}
                  <div className="w-full h-full relative z-40" style={{ background: 'transparent' }}>
                    {children}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Global Styles for consistency */}
        <style jsx global>{`
          .engine-accent {
            color: var(--engine-accent) !important;
          }

          .engine-glow {
            box-shadow: 0 0 20px var(--engine-glow) !important;
          }

          .engine-border {
            border-color: var(--engine-accent) !important;
          }

          .engine-bg {
            background-color: var(--engine-glow) !important;
          }

          .premium-button:hover {
            box-shadow: 0 15px var(--engine-glow);
            border-color: var(--engine-accent);
          }

          .glass-panel {
            backdrop-filter: blur(16px);
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          }

          .engine-layout ::-webkit-scrollbar {
            width: 6px;
          }

          .engine-layout ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
          }

          .engine-layout ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }

          .engine-layout ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}</style>
      </div>
    </SidebarProvider>;

}
