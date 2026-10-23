import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, RotateCcw, Volume2, CheckCircle, RotateCw } from 'lucide-react';
import { MeditationItem } from '../../data/meditations';
import { audioEngine } from '../../services/audioEngine';
import { haptics } from '../../services/haptics';
import { storage } from '../../services/storage';
import { formatSeconds, toPersianDigits } from '../../utils/persian';

interface MeditationSessionModalProps {
  meditation: MeditationItem | null;
  mode: 'guided' | 'silent';
  silentMinutes?: number;
  onClose: () => void;
}

export const MeditationSessionModal: React.FC<MeditationSessionModalProps> = ({
  meditation,
  mode,
  silentMinutes = 10,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [bgSound, setBgSound] = useState<string>('waves');
  const [soundMenuOpen, setSoundMenuOpen] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const sessionRecordedRef = useRef(false);

  const totalDuration = mode === 'guided' && meditation ? meditation.duration : silentMinutes * 60;
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Start chime bell
    audioEngine.playChime('bowl');
    haptics.heavy();

    // Start background sound
    const defaultBg = (meditation && meditation.bgSound) ? meditation.bgSound : 'waves';
    setBgSound(defaultBg);
    audioEngine.startChannel(defaultBg);

    return () => {
      audioEngine.stopChannel(defaultBg);
    };
  }, [meditation]);

  useEffect(() => {
    if (!isPlaying || isCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;
        if (next >= totalDuration) {
          setIsCompleted(true);
          setIsPlaying(false);
          if (!sessionRecordedRef.current) {
            sessionRecordedRef.current = true;
            storage.recordSession('meditation', totalDuration);
          }
          audioEngine.playChime('bowl');
          haptics.heavy();
          return totalDuration;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isCompleted, totalDuration]);

  // Find currently active text segment for guided mode
  const currentSegment = (mode === 'guided' && meditation)
    ? [...meditation.script].reverse().find((seg) => secondsElapsed >= seg.start) || meditation.script[0]
    : null;

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

  const handleSeek = (newSec: number) => {
    haptics.light();
    setSecondsElapsed(Math.max(0, Math.min(totalDuration, newSec)));
  };

  const progressRatio = Math.max(0, Math.min(1, secondsElapsed / totalDuration));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md h-[90vh] max-h-[700px] liquid-glass rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="text-right">
            <span className="text-[10px] font-bold text-[var(--accent-sage)]">
              {mode === 'guided' ? 'مدیتیشن باکلام (متن آگاهانه)' : 'مدیتیشن بی‌کلام (سکوت و زنگ)'}
            </span>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {meditation ? meditation.title : 'مدیتیشن آزاد'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Background sound toggle */}
            <div className="relative">
              <button
                onClick={() => setSoundMenuOpen(!soundMenuOpen)}
                className={`p-2 rounded-full transition-all ${
                  bgSound !== 'none'
                    ? 'bg-[var(--accent-sage)] text-white'
                    : 'liquid-glass-subtle text-[var(--text-secondary)]'
                }`}
                title="صدای همراه"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {soundMenuOpen && (
                <div className="absolute left-0 top-12 z-20 w-44 liquid-glass rounded-2xl p-2 shadow-xl border border-white/40 space-y-1">
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] px-2 py-1">صدای طبیعت همراه:</p>
                  {[
                    { id: 'waves', name: 'موج دریا' },
                    { id: 'rain', name: 'باران ملایم' },
                    { id: 'river', name: 'رودخانه' },
                    { id: 'crickets', name: 'جیرجیرک شب' },
                    { id: 'binaural_theta', name: 'امواج تتا' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
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
                if (secondsElapsed > 60 && !sessionRecordedRef.current) {
                  sessionRecordedRef.current = true;
                  storage.recordSession('meditation', secondsElapsed);
                }
                onClose();
              }}
              className="p-2 rounded-full liquid-glass-subtle text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center: Glowing Visual Sphere & Calming Subtitles */}
        <div className="flex-1 flex flex-col items-center justify-center my-auto text-center px-2">
          {!isCompleted ? (
            <>
              {/* Soft Ethereal Sphere (matches ASD.png) */}
              <div className="relative w-56 h-56 flex items-center justify-center my-4">
                <motion.div
                  animate={{
                    scale: [1, 1.18, 1],
                    opacity: [0.35, 0.6, 0.35]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="absolute w-48 h-48 rounded-full bg-[var(--accent-sage)] filter blur-3xl"
                />

                <motion.div
                  animate={{
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="relative w-40 h-40 rounded-full liquid-glass border border-white/60 dark:border-white/20 shadow-2xl flex flex-col items-center justify-center"
                >
                  <span className="text-3xl font-black text-[var(--text-primary)] font-mono">
                    {formatSeconds(Math.max(0, totalDuration - secondsElapsed))}
                  </span>
                  <span className="text-[11px] font-bold text-[var(--accent-sage)] mt-1">
                    باقیمانده
                  </span>
                </motion.div>
              </div>

              {/* Subtitle text presentation */}
              {mode === 'guided' && currentSegment && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSegment.start}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.6 }}
                    className="p-4 rounded-2xl liquid-glass-subtle max-w-sm mx-auto shadow-sm"
                  >
                    <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                      {currentSegment.text}
                    </p>
                  </motion.div>
                </AnimatePresence>
              )}

              {mode === 'silent' && (
                <p className="text-xs text-[var(--text-secondary)] mt-2">
                  تنها نظاره‌گر رفت‌وآمد نفس‌ها باشید. سکوت، ژرف‌ترین آموزگار است.
                </p>
              )}
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
                <h3 className="text-xl font-bold text-[var(--text-primary)]">جلسه با موفقیت به پایان رسید</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  از خودتان برای اهدای این لحظات آگاهانه به ذهنتان سپاسگزار باشید.
                </p>
              </div>

              <div className="p-3 rounded-2xl liquid-glass-subtle">
                <span className="text-xs text-[var(--text-secondary)]">مدت مراقبه</span>
                <p className="text-xl font-bold text-[var(--accent-sage)] mt-0.5">
                  {formatSeconds(secondsElapsed)} دقیقه
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Scrubber & Controls */}
        <div className="space-y-3 pt-3 border-t border-[var(--border-glass-subtle)]">
          {!isCompleted && (
            <>
              {/* Progress Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={totalDuration}
                  value={secondsElapsed}
                  onChange={(e) => handleSeek(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent-sage)]"
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                  <span>{formatSeconds(secondsElapsed)}</span>
                  <span>{formatSeconds(totalDuration)}</span>
                </div>
              </div>

              {/* Controls bar */}
              <div className="flex items-center justify-center gap-5">
                <button
                  onClick={() => handleSeek(secondsElapsed - 15)}
                  className="p-2.5 rounded-full liquid-glass-subtle text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95"
                  title="۱۵ ثانیه قبل"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    haptics.medium();
                    setIsPlaying(!isPlaying);
                  }}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#8FAE9B] to-[#7FD1C7] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={() => handleSeek(secondsElapsed + 15)}
                  className="p-2.5 rounded-full liquid-glass-subtle text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95"
                  title="۱۵ ثانیه بعد"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {isCompleted && (
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-[var(--accent-sage)] text-white font-bold text-xs shadow-md"
            >
              ثبت در کارنامه و بازگشت
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
