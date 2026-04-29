import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Activity, 
  Database, 
  Trash2, 
  Edit3, 
  Search, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalPlayers: 0,
    totalScores: 0,
    onlinePlayers: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: playersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { count: scoresCount } = await supabase.from('scores').select('*', { count: 'exact', head: true });
    
    if (playersData) {
      setPlayers(playersData);
      setStats({
        totalPlayers: playersData.length,
        totalScores: scoresCount || 0,
        onlinePlayers: Math.floor(playersData.length * 0.15) // Mocked online users
      });
    }
    setLoading(false);
  };

  const deletePlayer = async (id: string) => {
    if (window.confirm('Acknowledge: Irreversible deletion of player manifestation?')) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const updatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('profiles')
      .update({ 
        username: editingPlayer.username,
        coins: editingPlayer.coins,
        role: editingPlayer.role 
      })
      .eq('id', editingPlayer.id);
    
    if (!error) {
      setEditingPlayer(null);
      fetchData();
    }
  };

  const filteredPlayers = players.filter(p => 
    p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.includes(searchTerm)
  );

  // Mock data for 14-day activity
  const chartData = Array.from({ length: 14 }).map((_, i) => ({
    day: `D-${13-i}`,
    activity: 20 + Math.floor(Math.random() * 50) + (i * 2)
  }));

  return (
    <div className="min-h-screen bg-[#050505] p-6 md:p-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <button 
              onClick={onBack}
              className="group flex items-center gap-2 text-[#00f2ff] mb-4 hover:opacity-70 transition-opacity"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] uppercase font-mono tracking-[0.3em]">Return to Matrix</span>
            </button>
            <h1 className="text-4xl font-black tracking-tighter">NEXUS <span className="text-[#bc13fe]">CORE</span> CONTROL</h1>
            <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mt-1">v4.0 Protocol Active • Secure Connection</p>
          </div>

          <div className="flex gap-4">
            <div className="px-6 py-3 rounded-2xl bg-[#00f2ff]/10 border border-[#00f2ff]/20 text-[#00f2ff]">
              <p className="text-[8px] uppercase tracking-widest font-mono mb-1 text-[#00f2ff]/50">Status</p>
              <p className="text-sm font-bold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00f2ff] animate-pulse" /> SYSTEM OPTIMAL
              </p>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Player Manifestations', value: stats.totalPlayers, icon: Users, color: '#00f2ff' },
            { label: 'Data Transactions', value: stats.totalScores, icon: Database, color: '#bc13fe' },
            { label: 'Hyper-Activity (14D)', value: '+24%', icon: TrendingUp, color: '#00FF41' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl border border-white/10 bg-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <stat.icon className="h-16 w-16" style={{ color: stat.color }} />
              </div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500 mb-2">{stat.label}</p>
              <p className="text-4xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 p-8 rounded-3xl border border-white/10 bg-white/5 order-2 lg:order-1">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <Activity className="h-5 w-5 text-[#bc13fe]" /> 14-DAY ACTIVITY FLOW
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#bc13fe" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#bc13fe" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff11" vertical={false} />
                  <XAxis dataKey="day" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                    itemStyle={{ color: '#bc13fe' }}
                  />
                  <Area type="monotone" dataKey="activity" stroke="#bc13fe" strokeWidth={2} fillOpacity={1} fill="url(#colorAct)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Player Management */}
          <div className="flex flex-col gap-6 order-1 lg:order-2">
            <div className="p-8 rounded-3xl border border-white/10 bg-white/5 flex flex-col h-full max-h-[600px]">
              <div className="flex items-center justify-between gap-4 mb-8">
                <h3 className="text-xl font-bold flex items-center gap-3 shrink-0">
                  <Users className="h-5 w-5 text-[#00f2ff]" /> PLAYERS
                </h3>
                <div className="relative flex-1 max-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-[10px] focus:border-[#00f2ff] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-white/10">
                {filteredPlayers.map((player) => (
                  <div key={player.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{player.username}</p>
                      <p className="text-[8px] text-gray-500 font-mono truncate">{player.id}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] text-[#00f2ff] font-mono border border-[#00f2ff]/20">
                          {player.role.toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] text-yellow-500 font-mono border border-yellow-500/20">
                          {player.coins} C
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingPlayer(player)}
                        className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={() => deletePlayer(player.id)}
                        className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPlayer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md"
          >
            <div className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[40px] shadow-2xl">
              <h2 className="text-2xl font-black mb-8">MODIFY PLAYER DATA</h2>
              <form onSubmit={updatePlayer} className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase font-mono text-[#00f2ff] tracking-widest block mb-2">Username</label>
                  <input 
                    type="text" 
                    value={editingPlayer.username}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, username: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-[#00f2ff] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-[#00f2ff] tracking-widest block mb-2">Coins</label>
                  <input 
                    type="number" 
                    value={editingPlayer.coins}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, coins: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-[#00f2ff] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-[#00f2ff] tracking-widest block mb-2">Role</label>
                  <select 
                    value={editingPlayer.role}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, role: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-[#00f2ff] outline-none appearance-none"
                  >
                    <option value="player" className="bg-[#111]">PLAYER</option>
                    <option value="admin" className="bg-[#111]">ADMIN</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingPlayer(null)}
                    className="flex-1 py-4 bg-white/5 text-gray-500 font-bold rounded-2xl hover:bg-white/10"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-[#00f2ff] text-black font-bold rounded-2xl hover:scale-105 transition-transform"
                  >
                    UPDATE CELL
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
