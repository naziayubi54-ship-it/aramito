import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, Volume2, RotateCcw, CheckCircle, ShieldAlert } from 'lucide-react';
import { BreathingTechnique, BreathPhase } from '../../data/breathing';
import { BreathingAnimation } from './BreathingAnimation';
import { audioEngine } from '../../services/audioEngine';
import { haptics } from '../../services/haptics';
import { storage } from '../../services/storage';
import { toPersianDigits, formatSeconds } from '../../utils/persian';

interface BreathingSessionModalProps {
  technique: BreathingTechnique | null;
  onClose: () => void;
}

export const BreathingSessionModal: React.FC<BreathingSessionModalProps> = ({
  technique,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [phaseRemaining, setPhaseRemaining] = useState<number>(0);
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [bgSound, setBgSound] = useState<string>('none');
  const [soundMenuOpen, setSoundMenuOpen] = useState<boolean>(false);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Initialize phase
  useEffect(() => {
    if (technique) {
      setPhaseIndex(0);
      setPhaseRemaining(technique.phases[0].duration);
      setCurrentCycle(1);
      setTotalSecondsElapsed(0);
      setIsCompleted(false);
      setIsPlaying(true);
      audioEngine.playChime('bowl');
      haptics.phaseChange();
    }
  }, [technique]);

  // Main animation / timer frame loop
  useEffect(() => {
    if (!technique || !isPlaying || isCompleted) {
      lastTimeRef.current = null;
      return;
    }

    const onFrame = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = (time - lastTimeRef.current) / 1000;
        setTotalSecondsElapsed((prev) => prev + delta);

        setPhaseRemaining((prev) => {
          const next = prev - delta;
          if (next <= 0) {
            // Phase completed!
            const currentPhase = technique.phases[phaseIndex];
            const nextIndex = (phaseIndex + 1) % technique.phases.length;

            if (nextIndex === 0) {
              // Completed one cycle
              if (currentCycle >= technique.defaultCycles) {
                // Completed entire session
                setIsCompleted(true);
                setIsPlaying(false);
                storage.recordSession('breathing', totalSecondsElapsed);
                audioEngine.playChime('bowl');
                haptics.heavy();
                return 0;
              } else {
                setCurrentCycle((c) => c + 1);
              }
            }

            setPhaseIndex(nextIndex);
            haptics.phaseChange();
            audioEngine.playChime('phase');
            return technique.phases[nextIndex].duration;
          }
          return next;
        });
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(onFrame);
    };

    requestRef.current = requestAnimationFrame(onFrame);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [technique, isPlaying, isCompleted, phaseIndex, currentCycle, totalSecondsElapsed]);

  // Clean up on unmount or close
  useEffect(() => {
    return () => {
      if (bgSound !== 'none') {
        audioEngine.stopChannel(bgSound);
      }
    };
  }, [bgSound]);

  if (!technique) return null;

  const currentPhase: BreathPhase = technique.phases[phaseIndex] || technique.phases[0];
  const phaseProgress = Math.max(0, Math.min(1, 1 - phaseRemaining / currentPhase.duration));

  const handleToggleBgSound = (id: string) => {
    if (bgSound === id) {
      audioEngine.stopChannel(id);
      setBgSound('none');
    } else {
      if (bgSound !== 'none') {
        audioEngine.stopChannel(bgSound);
      }
      audioEngine.startChannel(id);
      setBgSound(id);
    }
  };

  const handleRestart = () => {
    haptics.medium();
    setPhaseIndex(0);
    setPhaseRemaining(technique.phases[0].duration);
    setCurrentCycle(1);
    setTotalSecondsElapsed(0);
    setIsCompleted(false);
    setIsPlaying(true);
    audioEngine.playChime('bowl');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md h-[90vh] max-h-[700px] liquid-glass rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="text-right">
            <h3 className="text-base font-bold text-[var(--text-primary)]">{technique.name}</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              دور {toPersianDigits(currentCycle)} از {toPersianDigits(technique.defaultCycles)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Background sound picker */}
            <div className="relative">
              <button
                onClick={() => {
                  haptics.light();
                  setSoundMenuOpen(!soundMenuOpen);
                }}
                className={`p-2 rounded-full transition-all ${
                  bgSound !== 'none'
                    ? 'bg-[var(--accent-sage)] text-white'
                    : 'liquid-glass-subtle text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="صدای پس‌زمینه"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {soundMenuOpen && (
                <div className="absolute left-0 top-12 z-20 w-44 liquid-glass rounded-2xl p-2 shadow-xl border border-white/40 space-y-1">
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] px-2 py-1">صدای همراه:</p>
                  {[
                    { id: 'rain', name: 'باران' },
                    { id: 'waves', name: 'امواج دریا' },
                    { id: 'wind', name: 'نسیم باد' },
                    { id: 'river', name: 'رودخانه' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        haptics.light();
                        handleToggleBgSound(s.id);
                        setSoundMenuOpen(false);
                      }}
                      className={`w-full text-right text-xs px-2.5 py-1.5 rounded-xl transition-all ${
                        bgSound === s.id ? 'bg-[var(--accent-sage)] text-white' : 'hover:bg-white/40'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                  {bgSound !== 'none' && (
                    <button
                      onClick={() => {
                        audioEngine.stopChannel(bgSound);
                        setBgSound('none');
                        setSoundMenuOpen(false);
                      }}
                      className="w-full text-right text-xs text-rose-500 px-2.5 py-1.5 rounded-xl hover:bg-rose-500/10"
                    >
                      خاموش کردن صدا
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                haptics.light();
                onClose();
              }}
              className="p-2 rounded-full liquid-glass-subtle text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center: Animation or Completed Screen */}
        <div className="flex-1 flex flex-col items-center justify-center my-auto">
          {!isCompleted ? (
            <>
              <BreathingAnimation
                technique={technique}
                currentPhase={currentPhase}
                phaseProgress={phaseProgress}
                phaseRemaining={phaseRemaining}
              />

              {/* Safety notice disclaimer */}
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] mt-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>اگر احساس سرگیجه کردی، نفس طبیعی بکش</span>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-4 py-8"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">خسته نباشی، عالی بود!</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  سیستم عصبی پاراسمپاتیک شما اکنون در وضعیت تعادل و آرامش قرار گرفته است.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl liquid-glass-subtle">
                  <span className="text-xs text-[var(--text-secondary)]">تعداد دور</span>
                  <p className="text-lg font-bold text-[var(--accent-sage)] mt-0.5">
                    {toPersianDigits(technique.defaultCycles)} دور کامل
                  </p>
                </div>
                <div className="p-3 rounded-2xl liquid-glass-subtle">
                  <span className="text-xs text-[var(--text-secondary)]">زمان کل</span>
                  <p className="text-lg font-bold text-[var(--accent-sage)] mt-0.5">
                    {formatSeconds(Math.round(totalSecondsElapsed))}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="pt-3 border-t border-[var(--border-glass-subtle)] flex items-center justify-center gap-4">
          {!isCompleted ? (
            <>
              <button
                onClick={handleRestart}
                className="p-3 rounded-2xl liquid-glass-subtle text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95"
                title="شروع مجدد"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  haptics.medium();
                  setIsPlaying(!isPlaying);
                }}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#8FAE9B] to-[#7FD1C7] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                title={isPlaying ? 'مکث' : 'ادامه'}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                haptics.medium();
                onClose();
              }}
              className="w-full py-3.5 rounded-2xl bg-[var(--accent-sage)] text-white font-bold text-xs shadow-md active:scale-98 transition-all"
            >
              اتمام و بازگشت به خانه
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
