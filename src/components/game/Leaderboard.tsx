import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, ArrowLeft, Medal, Users, Coins } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LeaderboardProps {
  onBack: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('username, total_score, active_skin')
        .order('total_score', { ascending: false })
        .limit(10);
      
      if (data) setLeaders(data);
      setLoading(false);
    };

    fetchLeaders();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl px-4 py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-[#00f2ff] transition-colors mb-12 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase font-mono tracking-widest">Back to Nexus</span>
        </button>

        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 rounded-3xl bg-[#bc13fe]/20 mb-6"
          >
            <Trophy className="h-10 w-10 text-[#bc13fe]" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter">GLOBAL <span className="text-[#00f2ff]">MATRIX</span> RANKINGS</h1>
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mt-2">Top 10 Nexus Manifestations</p>
        </div>

        <div className="space-y-3">
          {loading ? (
             Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 w-full bg-white/5 rounded-2xl animate-pulse" />
             ))
          ) : (
            leaders.map((leader, index) => (
              <motion.div
                key={leader.username}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-5 rounded-3xl border ${index === 0 ? 'border-[#00f2ff] bg-[#00f2ff]/10' : 'border-white/5 bg-white/5'} flex items-center justify-between`}
              >
                <div className="flex items-center gap-6">
                  <span className={`text-2xl font-black font-mono w-8 ${index === 0 ? 'text-[#00f2ff]' : 'text-gray-700'}`}>
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg">{leader.username}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Digital Entity</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <span className="text-2xl font-black font-mono">{leader.total_score}</span>
                    <Medal className={`h-4 w-4 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-gray-700'}`} />
                  </div>
                  <p className="text-[8px] text-gray-500 uppercase tracking-tighter">Cumulative Progress</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
