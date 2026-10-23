import React from 'react';
import { motion } from 'motion/react';

export const AuroraBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none">
      {/* Top right sage / teal aura orb */}
      <motion.div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full glow-orb bg-[#8FAE9B] dark:bg-[#7FD1C7] opacity-40 dark:opacity-20"
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 20, 0],
          y: [0, 25, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Center left mist blue orb */}
      <motion.div
        className="absolute top-1/3 -left-32 w-[28rem] h-[28rem] rounded-full glow-orb bg-[#9DB4C8] dark:bg-[#1C2340] opacity-40 dark:opacity-35"
        animate={{
          scale: [1.1, 0.95, 1.1],
          x: [0, -25, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Bottom warm peach / lavender orb (DSA.png accent) */}
      <motion.div
        className="absolute -bottom-24 right-1/4 w-80 h-80 rounded-full glow-orb bg-[#B8A9D9] dark:bg-[#9181B7] opacity-35 dark:opacity-15"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Subtle warm sun glow orb inspired by DSA.png */}
      <motion.div
        className="absolute top-1/2 right-4 w-44 h-44 rounded-full glow-orb bg-[#E28859] dark:bg-[#E9966E] opacity-20 dark:opacity-10"
        animate={{
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
};
