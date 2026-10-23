import React from 'react';
import { motion } from 'motion/react';
import { BreathingTechnique, BreathPhase } from '../../data/breathing';
import { toPersianDigits } from '../../utils/persian';

interface BreathingAnimationProps {
  technique: BreathingTechnique;
  currentPhase: BreathPhase;
  phaseProgress: number; // 0 to 1
  phaseRemaining: number;
}

export const BreathingAnimation: React.FC<BreathingAnimationProps> = ({
  technique,
  currentPhase,
  phaseProgress,
  phaseRemaining,
}) => {
  const style = technique.animationStyle;

  // Box Perimeter animation: square path perimeter is 4 * 180 = 720
  if (style === 'box') {
    const side = 170;
    const perimeter = side * 4;
    // Stroke offset based on current phase index (0 to 3) + progress
    const phaseIndex = technique.phases.findIndex((p) => p.name === currentPhase.name);
    const overallProgress = (Math.max(0, phaseIndex) + phaseProgress) / technique.phases.length;
    const strokeDashoffset = perimeter * (1 - overallProgress);

    return (
      <div className="relative w-64 h-64 flex items-center justify-center mx-auto my-4">
        {/* Soft glowing ambient circle behind */}
        <div className="absolute inset-4 rounded-full bg-[var(--accent-sage)] opacity-15 filter blur-2xl" />

        <svg className="w-56 h-56 -rotate-90" viewBox="0 0 200 200">
          {/* Background track */}
          <rect
            x="15"
            y="15"
            width={side}
            height={side}
            rx="24"
            fill="none"
            stroke="currentColor"
            className="text-black/10 dark:text-white/10"
            strokeWidth="6"
          />
          {/* Animated active path */}
          <rect
            x="15"
            y="15"
            width={side}
            height={side}
            rx="24"
            fill="none"
            stroke="currentColor"
            className="text-[var(--accent-sage)] transition-all duration-150"
            strokeWidth="7"
            strokeDasharray={perimeter}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span className="text-3xl font-black text-[var(--text-primary)] font-mono">
            {toPersianDigits(Math.ceil(phaseRemaining))}
          </span>
          <span className="text-xs font-bold text-[var(--accent-sage)] mt-1">
            {currentPhase.name}
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 max-w-[140px]">
            {currentPhase.cue}
          </span>
        </div>
      </div>
    );
  }

  // Sine Wave (Coherent / Resonance ~5.5 bpm)
  if (style === 'sine') {
    // Generate sine curve path
    const isInhale = currentPhase.type === 'inhale';
    const progress = phaseProgress;
    // Map progress to dot position: X from 20 to 180, Y follows sine
    const dotX = 20 + (isInhale ? progress : 1 - progress) * 160;
    const dotY = 100 - Math.sin((isInhale ? progress : 1 - progress) * Math.PI) * 45;

    return (
      <div className="relative w-64 h-64 flex items-center justify-center mx-auto my-4">
        <div className="absolute inset-4 rounded-full bg-[var(--accent-mist)] opacity-20 filter blur-3xl" />
        <svg className="w-60 h-44" viewBox="0 0 200 140">
          {/* Sine curve path */}
          <path
            d="M 20 100 Q 60 40 100 100 T 180 100"
            fill="none"
            stroke="currentColor"
            className="text-black/15 dark:text-white/15"
            strokeWidth="4"
            strokeDasharray="4 4"
          />
          {/* Active path */}
          <path
            d="M 20 100 Q 60 40 100 100 T 180 100"
            fill="none"
            stroke="currentColor"
            className="text-[var(--accent-sage)]"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Traveling dot indicator */}
          <circle
            cx={dotX}
            cy={dotY}
            r="8"
            fill="var(--accent-sage)"
            className="shadow-md transition-all duration-100"
          />
          <circle cx={dotX} cy={dotY} r="14" fill="var(--accent-sage)" opacity="0.3" />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none mt-16">
          <span className="text-3xl font-black text-[var(--text-primary)] font-mono">
            {toPersianDigits(Math.ceil(phaseRemaining))}
          </span>
          <span className="text-xs font-bold text-[var(--accent-sage)] mt-0.5">
            {currentPhase.name}
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">
            {currentPhase.cue}
          </span>
        </div>
      </div>
    );
  }

  // Physiological Sigh: Dual Inhales + Long Exhale
  if (style === 'sigh') {
    let scale = 1.0;
    if (currentPhase.type === 'inhale') {
      scale = 1.0 + phaseProgress * 0.35; // grows to 1.35
    } else if (currentPhase.type === 'inhale2') {
      scale = 1.35 + phaseProgress * 0.2; // grows to 1.55 (top off)
    } else {
      scale = 1.55 - phaseProgress * 0.55; // deflates smoothly back to 1.0
    }

    return (
      <div className="relative w-64 h-64 flex items-center justify-center mx-auto my-4">
        {/* Dual pulse aura */}
        <motion.div
          animate={{ scale: scale * 1.15 }}
          transition={{ duration: 0.1, ease: 'linear' }}
          className="absolute w-44 h-44 rounded-full bg-[var(--accent-sage)] opacity-20 filter blur-xl"
        />

        <motion.div
          animate={{ scale }}
          transition={{ duration: 0.1, ease: 'linear' }}
          className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-[#8FAE9B]/80 to-[#7FD1C7]/80 backdrop-blur-md border border-white/50 dark:border-white/20 shadow-2xl flex flex-col items-center justify-center"
        >
          <span className="text-3xl font-black text-white font-mono">
            {toPersianDigits(Math.ceil(phaseRemaining))}
          </span>
          <span className="text-[11px] font-bold text-white/90 mt-0.5">
            {currentPhase.name}
          </span>
        </motion.div>

        {/* Phase subtitle */}
        <div className="absolute bottom-2 text-center pointer-events-none select-none">
          <span className="text-xs font-medium text-[var(--text-secondary)] bg-white/40 dark:bg-white/10 px-3 py-1 rounded-full">
            {currentPhase.cue}
          </span>
        </div>
      </div>
    );
  }

  // Alternate Nostril (Nadi Shodhana): Two half-circles
  if (style === 'alternate') {
    const isLeft = currentPhase.name.includes('چپ');
    const isRight = currentPhase.name.includes('راست');

    return (
      <div className="relative w-64 h-64 flex items-center justify-center mx-auto my-4">
        <div className="flex items-center gap-4">
          {/* Left Nostril Semicircle */}
          <motion.div
            animate={{
              scale: isLeft ? 1.15 : 0.9,
              opacity: isLeft ? 1 : 0.35,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`w-20 h-28 rounded-r-none rounded-l-full border-2 border-r-0 flex items-center justify-center ${
              isLeft
                ? 'bg-[var(--accent-sage)]/25 border-[var(--accent-sage)] shadow-lg'
                : 'border-black/20 dark:border-white/20'
            }`}
          >
            <span className="text-xs font-bold text-[var(--text-primary)]">سمت چپ</span>
          </motion.div>

          {/* Right Nostril Semicircle */}
          <motion.div
            animate={{
              scale: isRight ? 1.15 : 0.9,
              opacity: isRight ? 1 : 0.35,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`w-20 h-28 rounded-l-none rounded-r-full border-2 border-l-0 flex items-center justify-center ${
              isRight
                ? 'bg-[var(--accent-sage)]/25 border-[var(--accent-sage)] shadow-lg'
                : 'border-black/20 dark:border-white/20'
            }`}
          >
            <span className="text-xs font-bold text-[var(--text-primary)]">سمت راست</span>
          </motion.div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none mt-28">
          <span className="text-2xl font-black text-[var(--text-primary)] font-mono">
            {toPersianDigits(Math.ceil(phaseRemaining))}
          </span>
          <span className="text-[11px] font-bold text-[var(--accent-sage)] mt-0.5">
            {currentPhase.name}
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 max-w-[150px]">
            {currentPhase.cue}
          </span>
        </div>
      </div>
    );
  }

  // Default: Circle Pulsing Sphere (4-7-8, Long Exhale, Diaphragm)
  let scale = 1.0;
  if (currentPhase.type === 'inhale') {
    scale = 0.9 + phaseProgress * 0.45; // expands from 0.9 to 1.35
  } else if (currentPhase.type === 'hold') {
    scale = 1.35; // holds at expanded size
  } else if (currentPhase.type === 'exhale') {
    scale = 1.35 - phaseProgress * 0.45; // contracts from 1.35 to 0.9
  } else {
    scale = 0.9; // hold-empty
  }

  return (
    <div className="relative w-64 h-64 flex items-center justify-center mx-auto my-4">
      {/* Outer blurred glow */}
      <motion.div
        animate={{ scale: scale * 1.25 }}
        transition={{ duration: 0.1, ease: 'linear' }}
        className="absolute w-44 h-44 rounded-full bg-[var(--accent-sage)] opacity-25 filter blur-2xl"
      />

      {/* Main Liquid Glass Sphere matching ASD.png & DSA.png */}
      <motion.div
        animate={{ scale }}
        transition={{ duration: 0.1, ease: 'linear' }}
        className="w-40 h-40 rounded-full liquid-glass border border-white/60 dark:border-white/20 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden"
      >
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/40 blur-md pointer-events-none" />
        <span className="text-3xl font-black text-[var(--text-primary)] font-mono">
          {toPersianDigits(Math.ceil(phaseRemaining))}
        </span>
        <span className="text-xs font-bold text-[var(--accent-sage)] mt-0.5">
          {currentPhase.name}
        </span>
        <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 px-3 text-center truncate">
          {currentPhase.cue}
        </span>
      </motion.div>
    </div>
  );
};
