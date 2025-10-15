

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';

export default function Layout({ children, currentPageName }) {
  // Initialize state based on whether the app has loaded before in this session.
  // This prevents the full loading screen on subsequent page navigations.
  const [user, setUser] = useState(window.tmaCachedUser || null);
  const [userLoading, setUserLoading] = useState(false); // Changed to false to skip loading screen

  // This effect will still run on each navigation to get fresh user data
  // and handle redirects, but it won't trigger the main loading screen again.
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        window.tmaCachedUser = currentUser; // Cache user data for seamless transitions
      } catch (error) {
        console.log('User not authenticated or error:', error);
        window.tmaCachedUser = null;
        // Don't block rendering on error
      } finally {
        // Mark the app as initialized so the main loader doesn't run again.
        window.tmaAppInitialized = true; 
        if (userLoading) {
          setUserLoading(false);
        }
      }
    };
    
    checkUser();
  }, [currentPageName, userLoading]);

  // Handle onboarding redirects separately.
  useEffect(() => {
    if (user && !user.onboarding_complete && currentPageName !== 'Onboarding') {
      // Commenting out redirect for now to allow app to load
      // window.location.href = createPageUrl('Onboarding');
    }
  }, [user, currentPageName]);

  // This full-screen loader will now only show on the very first load of the session.
  if (userLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="spinner">
          <div className="spinnerin"></div>
        </div>
        <div className="text-white text-lg font-medium tracking-wider">Firing up the engines...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white font-sans print:bg-white print:text-black">
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      
      {/* NEW: Matte Black Background */}
      <div className="fixed inset-0 z-0">
        {/* Base matte black background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />
        
        {/* Subtle texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse at center, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent)'
          }}
        />

        {/* Vignette effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col w-full px-2 sm:px-6 lg:px-8 custom-scrollbar overflow-y-auto min-h-screen print:px-8">
        {children}
      </main>

      {/* Global Styles - Enhanced with matte black theme */}
      <style jsx global>{`
        /* Global font size reduction */
        html {
          font-size: 87.5%; /* This makes 1rem = 14px instead of 16px (87.5% of 16px) */
        }
        
        /* Ensure html and body take full height with matte black */
        html, body, #root {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background: #000000 !important;
        }
        
        /* Enhanced CSS variables for matte black theme */
        :root {
          --background: 0 0% 0%; /* Pure black */
          --foreground: 0 0% 98%; /* White text */
          --card: 0 0% 5%; /* Very dark cards */
          --card-foreground: 0 0% 98%;
          --popover: 0 0% 5%;
          --popover-foreground: 0 0% 98%;
          --primary: 221 83.2% 53.9%; /* Blue shade for primary elements */
          --primary-foreground: 0 0% 98%;
          --secondary: 0 0% 8%; /* Darker secondary */
          --secondary-foreground: 0 0% 98%;
          --muted: 0 0% 8%; /* Darker muted */
          --muted-foreground: 0 0% 60%;
          --accent: 0 0% 8%; /* Darker accent */
          --accent-foreground: 0 0% 98%;
          --destructive: 0 72.2% 50.6%;
          --destructive-foreground: 0 0% 98%;
          --border: 0 0% 12%; /* Subtle borders */
          --input: 0 0% 12%;
          --ring: 221 83.2% 53.9%;
          --radius: 0.5rem;
        }

        /* Make sure body is pure black */
        body {
          background: #000000 !important;
          color: hsl(var(--foreground));
          -webkit-tap-highlight-color: transparent;
        }
        
        .glass-card {
          backdrop-filter: blur(16px);
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.6);
        }
        
        .glass-card-blue {
          backdrop-filter: blur(16px);
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.15);
        }
        
        .fade-in {
          animation: fadeIn 0.8s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        /* Mobile-specific optimizations */
        @media (max-width: 767px) {
          .fade-in {
            animation-duration: 0.5s;
          }
          
          h1 {
            font-size: 1.5rem !important;
          }
          
          h2 {
            font-size: 1.25rem !important;
          }
          
          button, a {
            -webkit-tap-highlight-color: rgba(255, 255, 255, 0.1);
          }
          
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
        
        @media print {
          .no-print { display: none !important; }
          body { color: black !important; background: white !important; }
        }
        
        /* Custom Loading Spinner - Enhanced for matte black */
        .spinner {
          width: 3em;
          height: 3em;
          cursor: not-allowed;
          border-radius: 50%;
          border: 2px solid #111;
          box-shadow: -10px -10px 10px #6359f8, 0px -10px 10px 0px #9c32e2, 10px -10px 10px #f36896, 10px 0 10px #ff0b0b, 10px 10px 10px 0px#ff5500, 0 10px 10px 0px #ff9500, -10px 10px 10px 0px #ffb700;
          animation: rot55 0.7s linear infinite;
          position: relative;
        }

        .spinnerin {
          border: 2px solid #111;
          width: 1.5em;
          height: 1.5em;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        @keyframes rot55 {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

