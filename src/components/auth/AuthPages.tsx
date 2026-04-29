import React, { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, User, Lock, Mail, ChevronRight } from 'lucide-react';

interface AuthPagesProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ onBack, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            username: formData.username,
            role: 'player',
          });
          if (profileError) throw profileError;
        }
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-[#00f2ff] transition-colors mb-8 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase font-mono tracking-widest">Back to Terminal</span>
        </button>

        <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f2ff] to-[#bc13fe]" />
          
          <h2 className="text-3xl font-bold mb-2">
            {isLogin ? 'WELCOME BACK' : 'CREATE IDENTITY'}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Accessing Nexus Secure Layer v2.0
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-[#00f2ff] tracking-[0.2em] ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input
                    required
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] outline-none transition-all placeholder:text-gray-700"
                    placeholder="PLAYER_ONE"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-[#00f2ff] tracking-[0.2em] ml-1">Quantum Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] outline-none transition-all placeholder:text-gray-700"
                  placeholder="nexus@matrix.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-[#00f2ff] tracking-[0.2em] ml-1">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] outline-none transition-all placeholder:text-gray-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-mono bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                ERROR: {error}
              </p>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 mt-6 hover:bg-[#00f2ff] transition-colors disabled:opacity-50"
            >
              {loading ? 'SYNCING...' : isLogin ? 'ESTABLISH LINK' : 'INITIATE SYNC'}
              {!loading && <ChevronRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-gray-500 hover:text-white transition-colors uppercase font-mono tracking-widest"
            >
              {isLogin ? "Don't have an identity? Create one" : "Access existing identity? Login"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
