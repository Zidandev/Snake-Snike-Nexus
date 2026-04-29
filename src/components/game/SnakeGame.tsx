import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Coins, 
  Play, 
  Pause, 
  RotateCcw, 
  LayoutGrid, 
  ShoppingBag, 
  ShieldAlert, 
  Zap, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Maximize2
} from 'lucide-react';
import { useSnakeGame } from '../../hooks/useSnakeGame';
import { SKINS, ACHIEVEMENTS, GRID_SIZE } from '../../constants';
import { supabase } from '../../lib/supabase';

interface SnakeGameProps {
  profile: any;
  onNavigate: (page: any) => void;
  isPotatoMode: boolean;
  onTogglePotato: () => void;
  onLogout: () => void;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ 
  profile: initialProfile, 
  onNavigate, 
  isPotatoMode, 
  onTogglePotato,
  onLogout
}) => {
  const [profile, setProfile] = useState(initialProfile);
  const [showShop, setShowShop] = useState(false);
  const [gameOverStats, setGameOverStats] = useState<{ score: number, coins: number } | null>(null);
  const touchStart = useRef<{ x: number, y: number } | null>(null);

  const isProcessing = useRef(false);

  const handleGameOver = useCallback(async (score: number, coins: number) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    
    setGameOverStats({ score, coins });
    
    try {
      // 1. Save match record
      await supabase.from('scores').insert({
        user_id: profile.id,
        score,
        username: profile.username
      });

      // 2. Update cumulative stats via RPC (Total Score & Coins)
      await supabase.rpc('update_player_stats', { 
        p_user_id: profile.id, 
        p_score_add: score,
        p_coins_add: coins 
      });

      // 3. Refresh profile state to show updated totals
      const { data } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
      if (data) setProfile(data);
    } catch (err) {
      console.error("Nexus Sync Error:", err);
    } finally {
      isProcessing.current = false;
    }
  }, [profile]);

  const {
    snake,
    food,
    coin,
    score,
    coinsCollected,
    isPaused,
    direction,
    setDirection,
    startGame: triggerStart,
  } = useSnakeGame(handleGameOver);

  const startGame = () => {
    isProcessing.current = false;
    triggerStart();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Block scrolling for game keys
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)) {
        if (!isPaused || key === ' ') {
          e.preventDefault();
        }
      }

      if ((key === 'arrowup' || key === 'w') && direction !== 'DOWN') setDirection('UP');
      if ((key === 'arrowdown' || key === 's') && direction !== 'UP') setDirection('DOWN');
      if ((key === 'arrowleft' || key === 'a') && direction !== 'RIGHT') setDirection('LEFT');
      if ((key === 'arrowright' || key === 'd') && direction !== 'LEFT') setDirection('RIGHT');
      if (key === ' ') startGame();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, setDirection, startGame, isPaused]);

  // Swipe controls
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30 && direction !== 'LEFT') setDirection('RIGHT');
      else if (dx < -30 && direction !== 'RIGHT') setDirection('LEFT');
    } else {
      if (dy > 30 && direction !== 'UP') setDirection('DOWN');
      else if (dy < -30 && direction !== 'DOWN') setDirection('UP');
    }
    touchStart.current = null;
  };

  const buySkin = async (skin: any) => {
    if (profile.coins >= skin.price && !profile.unlocked_skins.includes(skin.id)) {
      const newUnlocked = [...profile.unlocked_skins, skin.id];
      const { error } = await supabase
        .from('profiles')
        .update({ coins: profile.coins - skin.price, unlocked_skins: newUnlocked })
        .eq('id', profile.id);
      
      if (!error) {
        setProfile({ ...profile, coins: profile.coins - skin.price, unlocked_skins: newUnlocked });
      }
    }
  };

  const selectSkin = async (skinId: string) => {
    if (profile.unlocked_skins.includes(skinId)) {
      await supabase.from('profiles').update({ active_skin: skinId }).eq('id', profile.id);
      setProfile({ ...profile, active_skin: skinId });
    }
  };

  const activeSkinColor = SKINS.find(s => s.id === profile.active_skin)?.color || '#00f2ff';

  // Toggle body scroll for "freeze" mechanism
  useEffect(() => {
    if (!isPaused && !gameOverStats) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPaused, gameOverStats]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050505] p-4 md:p-8 gap-8">
      {/* Sidebar / HUD */}
      <div className="w-full md:w-64 flex flex-col gap-4">
        <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-[#00f2ff]/20 flex items-center justify-center">
              <span className="text-[#00f2ff] font-bold">{profile.username[0].toUpperCase()}</span>
            </div>
            <div>
              <p className="text-sm font-bold truncate">{profile.username}</p>
              <p className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">{profile.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group">
              <div className="flex justify-between items-center mb-1">
                <Trophy className="h-4 w-4 text-[#bc13fe]" />
                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-mono">Total Score</span>
              </div>
              <p className="text-3xl font-black font-mono text-white leading-none mb-2">{profile.total_score}</p>
              
              {/* Progress to next achievement */}
              {(() => {
                const nextAch = ACHIEVEMENTS.find(a => a.score > profile.total_score) || ACHIEVEMENTS[ACHIEVEMENTS.length-1];
                const progress = Math.min(100, (profile.total_score / nextAch.score) * 100);
                return (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[7px] uppercase tracking-tighter text-gray-400 font-mono">
                      <span>Next: {nextAch.name}</span>
                      <span>{Math.floor(progress)}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-[#bc13fe] to-[#00f2ff]" 
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-mono">Wallet</span>
              </div>
              <p className="text-3xl font-black font-mono text-yellow-500 leading-none">{profile.coins}</p>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <button 
              onClick={() => onNavigate('leaderboard')}
              className="w-full py-3 rounded-xl bg-[#00f2ff]/10 border border-[#00f2ff]/30 flex items-center justify-center gap-2 hover:bg-[#00f2ff]/20 transition-all text-[#00f2ff] text-xs font-bold uppercase tracking-widest"
            >
              <LayoutGrid className="h-4 w-4" /> Rankings
            </button>
            <button 
              onClick={() => setShowShop(true)}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
            >
              <ShoppingBag className="h-4 w-4" /> Shop
            </button>
            {profile.role === 'admin' && (
              <button 
                onClick={() => onNavigate('admin')}
                className="w-full py-3 rounded-xl bg-[#bc13fe]/20 border border-[#bc13fe]/30 flex items-center justify-center gap-2 hover:bg-[#bc13fe]/40 transition-all text-[#bc13fe] text-xs font-bold uppercase tracking-widest"
              >
                <ShieldAlert className="h-4 w-4" /> Nexus Core
              </button>
            )}
            <button 
              onClick={onLogout}
              className="w-full py-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all text-[10px] font-bold uppercase tracking-widest mt-4"
            >
              <LogOut className="h-3 w-3 inline mr-1" /> Terminate Link
            </button>
          </div>
        </div>

        {/* Global Achievements Status */}
        <div className="p-6 rounded-3xl border border-white/10 bg-white/5 text-[10px] font-mono tracking-tighter uppercase space-y-3">
          <p className="text-gray-500 mb-2">Matrix Milestones</p>
          {ACHIEVEMENTS.map((ach) => (
            <div key={ach.name} className={`flex justify-between items-center ${profile.total_score >= ach.score ? 'text-[#00f2ff]' : 'text-gray-700'}`}>
              <span>{ach.name}</span>
              <div className={`h-1 w-8 rounded-full ${profile.total_score >= ach.score ? 'bg-[#00f2ff]' : 'bg-gray-800'}`} />
            </div>
          ))}
        </div>

        {/* Potato Mode Toggle */}
        <button 
          onClick={onTogglePotato}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] uppercase font-mono transition-all ${isPotatoMode ? 'bg-orange-500 text-black' : 'bg-white/5 text-gray-500'}`}
        >
          <Zap className="h-3 w-3" /> {isPotatoMode ? 'Potato Mode Active' : 'Nexus Ultra'}
        </button>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div 
          className="relative aspect-square w-full max-w-[600px] border border-white/10 bg-[#0a0a0a] rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] cursor-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Real-time Score HUD Overlay */}
          {!isPaused && !gameOverStats && (
            <div className="absolute top-4 left-0 w-full flex justify-center z-30 pointer-events-none select-none">
              <div className="px-6 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/5 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#00f2ff] opacity-50" />
                  <span className="text-2xl font-black font-mono tracking-tighter">{score}</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-yellow-500 opacity-50" />
                  <span className="text-xl font-black font-mono tracking-tighter text-yellow-500">{coinsCollected}</span>
                </div>
              </div>
            </div>
          )}

          {/* Grid Background */}
          {!isPotatoMode && (
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
              <div className="h-full w-full bg-[linear-gradient(to_right,#00f2ff_1px,transparent_1px),linear-gradient(to_bottom,#00f2ff_1px,transparent_1px)] bg-[size:5%_5%]" />
            </div>
          )}

          {/* Snake Rendering */}
          {snake.map((segment, i) => (
            <motion.div
              layout={!isPotatoMode}
              key={`${segment.x}-${segment.y}-${i}`}
              className="absolute rounded-sm z-20"
              style={{
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                left: `${(segment.x / GRID_SIZE) * 100}%`,
                top: `${(segment.y / GRID_SIZE) * 100}%`,
                backgroundColor: i === 0 ? '#fff' : activeSkinColor,
                boxShadow: !isPotatoMode ? `0 0 10px ${activeSkinColor}` : 'none',
                opacity: 1 - (i / snake.length) * 0.7
              }}
            />
          ))}

          {/* Food Rendering */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute rounded-full z-10 bg-[#bc13fe] shadow-[0_0_15px_#bc13fe]"
            style={{
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              left: `${(food.x / GRID_SIZE) * 100}%`,
              top: `${(food.y / GRID_SIZE) * 100}%`,
            }}
          />

          {/* Coin Rendering */}
          {coin && (
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute rounded-full z-15 bg-yellow-400 shadow-[0_0_20px_#fbbf24] flex items-center justify-center p-0.5"
              style={{
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                left: `${(coin.x / GRID_SIZE) * 100}%`,
                top: `${(coin.y / GRID_SIZE) * 100}%`,
              }}
            >
              <Coins className="w-full h-full text-black" />
            </motion.div>
          )}

          {/* Start / Pause Overlay */}
          <AnimatePresence>
            {isPaused && !gameOverStats && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
              >
                <h3 className="text-4xl font-black mb-4 flex items-center gap-3">
                  <Play className="h-8 w-8 text-[#00f2ff]" /> READY?
                </h3>
                <p className="text-gray-400 mb-8 max-w-xs font-mono text-xs uppercase tracking-widest">
                  Use WASD or Arrows to maneuver. Warp through walls to strike.
                </p>
                <button
                  onClick={startGame}
                  className="px-12 py-4 bg-[#00f2ff] text-black font-black rounded-full hover:scale-110 transition-transform"
                >
                  INITIALIZE
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Over Overlay */}
          <AnimatePresence>
            {gameOverStats && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-8 text-center"
              >
                <h3 className="text-5xl font-black mb-2 text-red-500">LINK SEVERED</h3>
                <p className="text-gray-500 mb-8 uppercase font-mono text-xs tracking-[0.3em]">Critical Failure - Resetting Core</p>
                
                <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-12">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Final Score</p>
                    <p className="text-3xl font-black text-white">{gameOverStats.score}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Nexus Coins</p>
                    <p className="text-3xl font-black text-[#00f2ff] flex items-center justify-center gap-1">
                       {gameOverStats.coins}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setGameOverStats(null)}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform"
                  >
                    <RotateCcw className="h-4 w-4" /> RETRY
                  </button>
                  <button
                    onClick={() => {
                        setGameOverStats(null);
                        setShowShop(true);
                    }}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:scale-105 transition-transform"
                  >
                    <ShoppingBag className="h-4 w-4" /> UPGRADE
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile D-Pad (Visible on small screens or always for accessibility) */}
        <div className="mt-8 grid grid-cols-3 gap-2 md:hidden">
          <div />
          <button 
            onClick={() => direction !== 'DOWN' && setDirection('UP')}
            className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 active:bg-[#00f2ff] active:text-black transition-colors"
          >
            <ChevronUp className="h-8 w-8" />
          </button>
          <div />
          <button 
            onClick={() => direction !== 'RIGHT' && setDirection('LEFT')}
            className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 active:bg-[#00f2ff] active:text-black transition-colors"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button 
            onClick={() => direction !== 'UP' && setDirection('DOWN')}
            className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 active:bg-[#00f2ff] active:text-black transition-colors"
          >
            <ChevronDown className="h-8 w-8" />
          </button>
          <button 
            onClick={() => direction !== 'LEFT' && setDirection('RIGHT')}
            className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 active:bg-[#00f2ff] active:text-black transition-colors"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      </div>

      {/* Shop Overlay */}
      <AnimatePresence>
        {showShop && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6"
          >
            <div className="w-full max-w-4xl max-h-[80vh] overflow-y-auto bg-white/5 rounded-[40px] border border-white/10 p-8 md:p-12 relative">
              <button 
                onClick={() => setShowShop(false)}
                className="absolute top-8 right-8 h-10 w-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                ✕
              </button>

              <h2 className="text-4xl font-black mb-2 flex items-center gap-4">
                <ShoppingBag className="h-8 w-8 text-[#bc13fe]" /> NEXUS ARMORY
              </h2>
              <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-12">Enhance your digital manifestation</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {SKINS.map((skin) => {
                  const isUnlocked = profile.unlocked_skins.includes(skin.id);
                  const isActive = profile.active_skin === skin.id;
                  const canAfford = profile.coins >= skin.price;

                  return (
                    <div 
                      key={skin.id}
                      className={`p-6 rounded-3xl border ${isActive ? 'border-[#00f2ff] bg-[#00f2ff]/5' : 'border-white/10 bg-white/5'}`}
                    >
                      <div 
                        className="h-20 w-20 rounded-2xl mb-6 shadow-lg shadow-black/50 mx-auto transform rotate-45"
                        style={{ backgroundColor: skin.color, boxShadow: `0 0 20px ${skin.color}44` }}
                      />
                      <h3 className="text-xl font-bold text-center mb-1">{skin.name}</h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center mb-6">Nexus Fragment</p>
                      
                      {isUnlocked ? (
                        <button
                          onClick={() => selectSkin(skin.id)}
                          disabled={isActive}
                          className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${isActive ? 'bg-[#00f2ff] text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                          {isActive ? 'ACTIVE' : 'EQUIP'}
                        </button>
                      ) : (
                        <button
                          onClick={() => buySkin(skin)}
                          disabled={!canAfford}
                          className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${canAfford ? 'bg-white text-black hover:bg-[#bc13fe] hover:text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                        >
                          <Coins className="h-3 w-3" /> {skin.price}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
