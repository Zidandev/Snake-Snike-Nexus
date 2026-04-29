import React from 'react';
import { motion } from 'motion/react';
import { Rocket, Zap, Shield, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505]">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#00f2ff] opacity-10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#bc13fe] opacity-10 blur-[120px]" />

      <div className="container mx-auto px-6 pt-32 pb-20 relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-[#00f2ff]/30 bg-[#00f2ff]/10 text-[#00f2ff] text-xs font-mono tracking-widest uppercase mb-6">
            Cybernetic Evolution
          </span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6">
            SNAKE <span className="text-[#00f2ff]">SNIKE</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#bc13fe]">NEXUS</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 font-light leading-relaxed">
            The grid is your matrix. Evolve your serpent across the digital void. 
            Pass through boundaries, collect cyber-coins, and dominate the global leaderboard.
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 242, 255, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="group relative flex items-center gap-3 px-10 py-5 bg-[#00f2ff] text-black font-bold rounded-full overflow-hidden"
        >
          <span className="relative z-10 text-xl tracking-tighter">INITIALIZE NEXUS</span>
          <ChevronRight className="relative z-10 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </motion.button>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 w-full max-w-5xl">
          {[
            { icon: Rocket, label: 'Hyper Shift', desc: 'No walls can hold you. Warp through space.' },
            { icon: Zap, label: 'Plasma Skins', desc: 'Customize your aura with rare nexus fragments.' },
            { icon: Shield, label: 'Admin Matrix', desc: 'Powerful tools for the guardians of the grid.' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="p-8 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="h-12 w-12 rounded-2xl bg-[#00f2ff]/20 flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-[#00f2ff]" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.label}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <footer className="mt-40 text-gray-600 font-mono text-xs uppercase tracking-[0.4em]">
          Created by <span className="text-[#00f2ff]">Zidandev</span> © 2026
        </footer>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-[-1] opacity-5 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#00f2ff_1px,transparent_1px),linear-gradient(to_bottom,#00f2ff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>
    </div>
  );
};
