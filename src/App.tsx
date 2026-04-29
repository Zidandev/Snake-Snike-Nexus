import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { LandingPage } from './components/LandingPage';
import { AuthPages } from './components/auth/AuthPages';
import { SnakeGame } from './components/game/SnakeGame';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Leaderboard } from './components/game/Leaderboard';

type Page = 'landing' | 'auth' | 'game' | 'admin' | 'shop' | 'leaderboard';

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isPotatoMode, setIsPotatoMode] = useState(false);

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setProfile(data);
  };

  const navigate = useCallback((target: Page) => {
    setIsLoading(true);
    // Dramatic delay for assets/nexus feel
    setTimeout(() => {
      setPage(target);
      setIsLoading(false);
    }, 1500);
  }, []);

  return (
    <div className={`min-h-screen bg-[#050505] text-white selection:bg-[#00f2ff] selection:text-black ${isPotatoMode ? 'potato-mode' : ''}`}>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen key="loading" />}
      </AnimatePresence>

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {page === 'landing' && (
            <LandingPage key="landing" onStart={() => navigate(user ? 'game' : 'auth')} />
          )}
          {page === 'auth' && (
            <AuthPages 
              key="auth" 
              onBack={() => navigate('landing')} 
              onSuccess={() => navigate('game')} 
            />
          )}
          {page === 'game' && user && profile && (
            <SnakeGame 
              key="game" 
              profile={profile} 
              onNavigate={navigate}
              isPotatoMode={isPotatoMode}
              onTogglePotato={() => setIsPotatoMode(!isPotatoMode)}
              onLogout={async () => {
                await supabase.auth.signOut();
                navigate('landing');
              }}
            />
          )}
          {page === 'admin' && profile?.role === 'admin' && (
            <AdminDashboard 
              key="admin" 
              onBack={() => navigate('game')} 
            />
          )}
          {page === 'leaderboard' && (
            <Leaderboard 
              key="leaderboard" 
              onBack={() => navigate('game')} 
            />
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Audio Visualizer Background (Simulation) */}
      {!isPotatoMode && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.1),transparent_70%)]" />
          <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>
      )}
      
      {/* Potato mode styles */}
      <style>{`
        .potato-mode * {
          box-shadow: none !important;
          text-shadow: none !important;
          animation-duration: 0.01s !important;
          transition-duration: 0.01s !important;
        }
      `}</style>
    </div>
  );
}
