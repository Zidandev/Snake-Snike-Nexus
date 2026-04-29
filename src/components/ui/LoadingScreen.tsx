import { motion } from 'motion/react';

export const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-[#00f2ff]"
    >
      <div className="relative h-24 w-24">
        {/* Matrix-like loading animation */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 border-4 border-t-transparent border-[#00f2ff] rounded-full"
        />
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-4 border-2 border-b-transparent border-[#bc13fe] rounded-full shadow-[0_0_15px_#bc13fe]"
        />
      </div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 font-mono text-sm tracking-[0.3em] uppercase"
      >
        Accessing Nexus...
      </motion.p>
    </motion.div>
  );
};
