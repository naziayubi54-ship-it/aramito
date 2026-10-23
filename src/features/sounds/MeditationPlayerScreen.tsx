import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Clock,
  Compass,
  Flower2,
  FolderOpen,
  Heart,
  Loader2,
  Moon,
  Pause,
  Play,
  RefreshCw,
  Repeat,
  Repeat1,
  RotateCcw,
  RotateCw,
  Scan,
  SkipBack,
  SkipForward,
  Sparkles,
  Sun,
  Volume1,
  Waves,
  X
} from 'lucide-react';
import {
  MEDITATION_TRACKS,
  MeditationTrack,
  getMeditationAudioPath,
  getMeditationTrack,
  getMeditationTrackIndex
} from '../../data/meditationTracks';
import { meditationPlayer, MeditationPlayerState } from '../../services/meditationPlayer';
import { haptics } from '../../services/haptics';
import { formatSeconds, toPersianDigits } from '../../utils/persian';

const ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Heart,
  Waves,
  Compass,
  Moon,
  Sun,
  Flower2,
  Scan
};

const SLEEP_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

interface MeditationPlayerScreenProps {
  trackId: string;
  onClose: () => void;
  onOpenTrack: (trackId: string) => void;
}

export const MeditationPlayerScreen: React.FC<MeditationPlayerScreenProps> = ({
  trackId,
  onClose,
  onOpenTrack
}) => {
  const track = getMeditationTrack(trackId) ?? MEDITATION_TRACKS[0];
  const [state, setState] = useState<MeditationPlayerState>(() => meditationPlayer.getState());
  const [sleepSheetOpen, setSleepSheetOpen] = useState(false);

  useEffect(() => meditationPlayer.subscribe(() => setState(meditationPlayer.getState())), []);

  // شروع پخش ترک انتخاب‌شده از فهرست
  useEffect(() => {
    void meditationPlayer.playTrack(trackId);
  }, [trackId]);

  // قفل اسکرول پس‌زمینه
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // کلیدهای صفحه‌کلید (وب‌اپ / دسکتاپ)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        void meditationPlayer.toggle();
      }
      if (e.key === 'ArrowLeft') meditationPlayer.skip(-15);
      if (e.key === 'ArrowRight') meditationPlayer.skip(15);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const duration = state.duration || track.durationHint;
  const progress = duration > 0 ? Math.min(1, (state.currentTime || 0) / duration) : 0;
  const current = state.currentTime;
  const remaining = Math.max(0, duration - current);

  const stars = useMemo(() => {
    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: 34 }, () => ({
      top: `${rand() * 62}%`,
      left: `${rand() * 100}%`,
      size: rand() > 0.78 ? 3 : rand() > 0.4 ? 2 : 1,
      opacity: 0.25 + rand() * 0.5,
      delay: rand() * 6
    }));
  }, []);

  const handleSeek = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (rect.right - e.clientX) / rect.width));
    meditationPlayer.seek(ratio * duration);
  };

  const accentStyle = {
    '--p-a': track.accent.from,
    '--p-b': track.accent.to,
    '--p-glow': track.accent.glow
  } as React.CSSProperties;

  const index = getMeditationTrackIndex(track.id);
  const queue = [MEDITATION_TRACKS[index - 1], MEDITATION_TRACKS[index + 1]].filter(Boolean) as MeditationTrack[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="med-player fixed inset-0 z-[60] overflow-hidden select-none"
      style={accentStyle}
      dir="rtl"
    >
      {/* لایه‌های پس‌زمینه */}
      <div className="med-player__bg absolute inset-0" />
      <div className="med-player__shade absolute inset-0" />
      <div className="med-player__grain absolute inset-0" />

      {/* ستاره‌ها */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((s, i) => (
          <span
            key={i}
            className="med-star"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              animationDelay: `${s.delay}s`
            }}
          />
        ))}
      </div>

      {/* کوه‌های محو پایین صفحه */}
      <svg
        className="med-mountains absolute bottom-0 left-0 w-full pointer-events-none"
        viewBox="0 0 390 240"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="mtn1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.82" />
          </linearGradient>
          <linearGradient id="mtn2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <path d="M0 128 L58 86 L104 118 L156 62 L214 120 L262 92 L322 132 L390 96 L390 240 L0 240 Z" fill="url(#mtn2)" />
        <path d="M0 178 L64 132 L118 164 L182 116 L248 170 L310 138 L390 176 L390 240 L0 240 Z" fill="url(#mtn1)" />
      </svg>

      {/* محتوا */}
      <div className="relative z-10 h-full flex flex-col px-6 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1.25rem)] overflow-y-auto no-scrollbar">
        {/* هدر */}
        <div className="flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            aria-label="بازگشت به موسیقی آرامش"
            className="med-glass w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowRight className="w-5 h-5" style={{ color: 'var(--p-ink)' }} />
          </button>

          <div className="flex flex-col items-center leading-none">
            <span className="med-brand" style={{ color: 'var(--p-ink)' }}>
              آرامیتو
            </span>
            <span className="med-brand-sub" style={{ color: 'var(--p-soft)' }}>
              CALM MUSIC
            </span>
          </div>

          <button
            onClick={() => {
              haptics.light();
              setSleepSheetOpen(true);
            }}
            aria-label="تایمر خواب"
            className={`med-glass w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform ${
              state.sleepRemaining > 0 ? 'med-glass-active' : ''
            }`}
          >
            {state.sleepRemaining > 0 ? (
              <span className="text-[10px] font-bold tabular-nums" style={{ color: 'var(--p-ink)' }}>
                {formatSeconds(state.sleepRemaining)}
              </span>
            ) : (
              <Clock className="w-[18px] h-[18px]" style={{ color: 'var(--p-ink)' }} />
            )}
          </button>
        </div>

        {/* عنوان */}
        <div className="mt-4 text-center shrink-0">
          <p className="med-eyebrow" style={{ color: 'var(--p-soft)' }}>
            {toPersianDigits(Math.max(1, Math.round(duration / 60)))} دقیقه · مدیتیشن هدایت‌شده
          </p>
        </div>

        {/* گوی نورانی */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-2">
          <button
            onClick={() => {
              haptics.medium();
              void meditationPlayer.toggle();
            }}
            aria-label={state.isPlaying ? 'توقف' : 'پخش'}
            className="relative flex items-center justify-center active:scale-[0.985] transition-transform shrink-0"
            style={{ width: 'clamp(196px, 29vh, 264px)', height: 'clamp(196px, 29vh, 264px)' }}
          >
            <motion.div
              className="absolute inset-6 rounded-full blur-3xl"
              animate={
                state.isPlaying
                  ? { scale: [1, 1.12, 1], opacity: [0.55, 0.8, 0.55] }
                  : { scale: 1, opacity: 0.4 }
              }
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: `radial-gradient(circle, ${track.accent.glow} 0%, rgba(255,255,255,0.35) 55%, transparent 72%)`
              }}
            />

            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 264 264">
              <circle cx="132" cy="132" r="126" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="1.4" />
              <circle
                cx="132"
                cy="132"
                r="126"
                fill="none"
                stroke="rgba(255,255,255,0.92)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 126}
                strokeDashoffset={2 * Math.PI * 126 * (1 - progress)}
                style={{ transition: 'stroke-dashoffset 0.35s linear' }}
              />
            </svg>

            <motion.div
              className="absolute inset-[11.5%] rounded-full flex flex-col items-center justify-center"
              animate={state.isPlaying ? { scale: [1, 1.022, 1] } : { scale: 1 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background:
                  'radial-gradient(circle at 34% 26%, #ffffff 0%, #f7f8ff 38%, #e6ebfb 68%, #d5ddf5 100%)',
                boxShadow:
                  '0 26px 60px -22px rgba(74, 92, 155, 0.55), inset 0 -16px 36px rgba(150,168,214,0.32), 0 0 46px 6px rgba(255,255,255,0.5)'
              }}
            >
              <span className="med-time tabular-nums">{formatSeconds(remaining)}</span>
              <span className="med-time-sub">
                {state.isLoading
                  ? 'در حال آماده‌سازی…'
                  : state.isMissing
                  ? 'مدت مدیتیشن'
                  : state.isPlaying
                  ? 'در حال پخش'
                  : 'باقی‌مانده'}
              </span>
            </motion.div>
          </button>

          <div className="text-center mt-4 px-2">
            <h1 className="text-[21px] font-bold leading-snug" style={{ color: 'var(--p-ink)' }}>
              {track.title}
            </h1>
            <p className="med-latin mt-2" style={{ color: 'var(--p-soft)' }}>
              {track.latinTitle}
            </p>

            {state.isMissing ? (
              <div className="mx-auto mt-3 max-w-[19rem] rounded-2xl border border-white/45 bg-white/25 backdrop-blur-md px-3 py-2.5 text-right">
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold" style={{ color: 'var(--p-ink)' }}>
                  <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                  فایل صوتی هنوز اضافه نشده
                </div>
                <p className="text-[9.5px] mt-1 leading-relaxed" style={{ color: 'var(--p-soft)' }}>
                  این فایل را با همین نام در پوشه پروژه بگذارید و «بررسی مجدد» را بزنید:
                </p>
                <code
                  dir="ltr"
                  className="block mt-1 text-[9px] font-mono bg-white/45 rounded-lg px-1.5 py-1 break-all text-left"
                  style={{ color: 'var(--p-ink)' }}
                >
                  {getMeditationAudioPath(track)}
                </code>
                <button
                  onClick={() => meditationPlayer.reloadCurrent()}
                  className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/70 active:scale-95 transition-transform"
                  style={{ color: '#2E3557' }}
                >
                  <RefreshCw className="w-3 h-3" />
                  بررسی مجدد
                </button>
              </div>
            ) : (
              <p className="med-desc mx-auto mt-2.5" style={{ color: 'var(--p-soft)' }}>
                {track.description}
              </p>
            )}
          </div>
        </div>

        {/* نوار پیشرفت */}
        <div className="shrink-0 mt-2">
          <div className="flex items-center justify-between med-time-small tabular-nums" style={{ color: 'var(--p-faint)' }}>
            <span>{formatSeconds(current)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>
          <div
            onPointerDown={handleSeek}
            className="mt-2 h-6 flex items-center cursor-pointer group touch-none"
          >
            <div className="relative w-full h-[3px] rounded-full overflow-visible" style={{ background: 'rgba(255,255,255,0.4)' }}>
              <div
                className="absolute inset-y-0 right-0 rounded-full"
                style={{ width: `${progress * 100}%`, background: 'rgba(255,255,255,0.95)' }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow"
                style={{ right: `calc(${progress * 100}% - 5px)` }}
              />
            </div>
          </div>
        </div>

        {/* کنترل‌ها */}
        <div className="shrink-0 mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              haptics.light();
              void meditationPlayer.playPrevious();
            }}
            aria-label="قبلی"
            className="med-glass w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <SkipBack className="w-[18px] h-[18px]" style={{ color: 'var(--p-ink)' }} />
          </button>

          <button
            onClick={() => {
              haptics.light();
              meditationPlayer.skip(-15);
            }}
            aria-label="۱۵ ثانیه عقب"
            className="med-glass w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <RotateCcw className="w-[18px] h-[18px]" style={{ color: 'var(--p-ink)' }} />
          </button>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              haptics.medium();
              void meditationPlayer.toggle();
            }}
            aria-label={state.isPlaying ? 'توقف' : 'پخش'}
            className="w-[70px] h-[70px] rounded-full flex items-center justify-center shadow-xl"
            style={{
              background: 'rgba(255,255,255,0.94)',
              boxShadow: '0 18px 38px -14px rgba(60,74,124,0.6), 0 0 0 1px rgba(255,255,255,0.6) inset'
            }}
          >
            {state.isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#2E3557' }} />
            ) : state.isPlaying ? (
              <Pause className="w-6 h-6 fill-current" style={{ color: '#2E3557' }} />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-[1px]" style={{ color: '#2E3557' }} />
            )}
          </motion.button>

          <button
            onClick={() => {
              haptics.light();
              meditationPlayer.skip(15);
            }}
            aria-label="۱۵ ثانیه جلو"
            className="med-glass w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <RotateCw className="w-[18px] h-[18px]" style={{ color: 'var(--p-ink)' }} />
          </button>

          <button
            onClick={() => {
              haptics.light();
              void meditationPlayer.playNext();
            }}
            aria-label="بعدی"
            className="med-glass w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <SkipForward className="w-[18px] h-[18px]" style={{ color: 'var(--p-ink)' }} />
          </button>
        </div>

        {/* پاورقی: صدا، سرعت، تکرار */}
        <div className="shrink-0 mt-4 space-y-2.5">
          <div className="flex items-center gap-3">
            <Volume1 className="w-4 h-4 shrink-0" style={{ color: 'var(--p-soft)' }} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={state.volume}
              dir="ltr"
              onChange={(e) => meditationPlayer.setVolume(parseFloat(e.target.value))}
              aria-label="حجم صدا"
              className="med-range flex-1"
              style={{
                background: `linear-gradient(to right, var(--p-range-fill) 0%, var(--p-range-fill) ${
                  state.volume * 100
                }%, var(--p-range-track) ${state.volume * 100}%, var(--p-range-track) 100%)`
              }}
            />
            <button
              onClick={() => {
                haptics.light();
                const rates = [0.75, 1, 1.25, 1.5];
                const next = rates[(rates.indexOf(state.rate) + 1) % rates.length] ?? 1;
                meditationPlayer.setRate(next);
              }}
              className="med-pill px-2.5 py-1 text-[10px] font-bold tabular-nums"
              style={{ color: 'var(--p-ink)' }}
              title="سرعت پخش"
            >
              {toPersianDigits(state.rate)}×
            </button>
            <button
              onClick={() => {
                haptics.light();
                meditationPlayer.cycleRepeat();
              }}
              aria-label="حالت تکرار"
              className="med-glass w-9 h-9 rounded-full flex items-center justify-center"
              title={state.repeat === 'one' ? 'تکرار همین ترک' : state.repeat === 'all' ? 'پخش پشت‌سرهم' : 'بدون تکرار'}
            >
              {state.repeat === 'one' ? (
                <Repeat1 className="w-4 h-4" style={{ color: 'var(--p-ink)' }} />
              ) : (
                <Repeat
                  className="w-4 h-4"
                  style={{ color: state.repeat === 'all' ? 'var(--p-ink)' : 'var(--p-faint)' }}
                />
              )}
            </button>
          </div>

          {/* پیشنهاد بعدی */}
          {queue.length > 0 && !state.isMissing && (
            <button
              onClick={() => {
                haptics.light();
                onOpenTrack(queue[0].id);
              }}
              className="w-full flex items-center justify-between rounded-2xl px-3 py-2 med-pill"
              style={{ color: 'var(--p-soft)' }}
            >
              <span className="text-[10px]">بعدی: {queue[0].title}</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}
        </div>
      </div>

      {/* شیت تایمر خواب */}
      <AnimatePresence>
        {sleepSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSleepSheetOpen(false)}
              className="absolute inset-0 z-20 bg-black/25 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="absolute bottom-0 left-0 right-0 z-30 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-[#F7F7FF]/95 dark:bg-[#171B2E]/95 backdrop-blur-2xl p-5 pb-[max(env(safe-area-inset-bottom),2.5rem)] text-right"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6C76A8]" />
                  <h3 className="text-sm font-bold text-[#2C3252] dark:text-[#F4F2FB]">تایمر خواب</h3>
                </div>
                <button
                  onClick={() => setSleepSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-[#6C76A8] dark:text-[#C9CCE6]" />
                </button>
              </div>

              <p className="text-[11px] text-[#6C76A8] dark:text-[#A9AECB] mt-1 leading-relaxed">
                صدا پس از پایان زمان انتخاب‌شده آرام‌آرام محو می‌شود و دستگاه به خواب می‌رود.
              </p>

              <div className="grid grid-cols-4 gap-2 mt-4">
                {SLEEP_OPTIONS.map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => {
                      haptics.light();
                      meditationPlayer.setSleepTimer(minutes);
                      setSleepSheetOpen(false);
                    }}
                    className={`py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                      state.sleepRemaining > 0 && state.sleepTotal === minutes
                        ? 'bg-[#7FA9A0] text-white border-transparent'
                        : 'bg-white/60 dark:bg-white/10 text-[#3A4166] dark:text-[#E6E4F5] border-white/60 dark:border-white/10'
                    }`}
                  >
                    {toPersianDigits(minutes)} دقیقه
                  </button>
                ))}
              </div>

              {state.sleepRemaining > 0 && (
                <button
                  onClick={() => {
                    haptics.light();
                    meditationPlayer.clearSleepTimer();
                    setSleepSheetOpen(false);
                  }}
                  className="w-full mt-3 py-2.5 rounded-2xl text-xs font-bold text-rose-500 bg-rose-500/10"
                >
                  لغو تایمر ({formatSeconds(state.sleepRemaining)} باقی‌مانده)
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
