import React from 'react';
import { motion } from 'motion/react';

const markSrc = `${import.meta.env.BASE_URL}logo-mark.png`;

interface SplashScreenProps {
  /** وقتی true شود، اسپلش با انیمیشن محو می‌شود */
  leaving?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ leaving = false }) => {
  const isDark =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: isDark ? '#0F1222' : '#FFFFFF' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      aria-hidden="true"
    >
      <motion.img
        src={markSrc}
        alt=""
        className="w-32 h-32 object-contain"
        initial={{ opacity: 0, scale: 0.85, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 0.8, 0.28, 1] }}
      />
      <motion.p
        className="mt-6 text-[26px] font-black tracking-tight"
        style={{ color: isDark ? '#F2F0F6' : '#2E2A33' }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
      >
        آرامیتو
      </motion.p>
      <motion.p
        className="mt-2 text-[12px]"
        style={{ color: isDark ? '#A7A3B5' : '#6B6572' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        نفس بکش، آرام‌تر زندگی کن
      </motion.p>
    </motion.div>
  );
};
