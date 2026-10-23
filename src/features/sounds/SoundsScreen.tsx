import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  Square,
  Clock,
  Headphones,
  Sliders,
  Sparkles,
  BookmarkPlus,
  Play,
  Pause,
  CloudRain,
  CloudLightning,
  Waves,
  Droplets,
  Wind,
  Flame,
  Trees,
  Bird,
  Moon,
  Coffee,
  Activity,
  Radio,
  Compass,
  Music2,
  FolderOpen,
  ChevronLeft,
  Heart,
  Sun,
  Flower2,
  Scan
} from 'lucide-react';
import { SOUND_CHANNELS, PRESET_MIXES } from '../../data/sounds';
import { MEDITATION_TRACKS, MeditationTrack, getMeditationTrack } from '../../data/meditationTracks';
import { audioEngine } from '../../services/audioEngine';
import { meditationPlayer, MeditationPlayerState } from '../../services/meditationPlayer';
import { haptics } from '../../services/haptics';
import { toPersianDigits, formatSeconds, formatPercent } from '../../utils/persian';

type Tab = 'mixer' | 'presets' | 'meditations';

const TRACK_ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Heart,
  Waves,
  Compass,
  Moon,
  Sun,
  Flower2,
  Scan
};

interface SoundsScreenProps {
  onOpenTrack: (trackId: string) => void;
  /** با هر تغییر، بخش موردنظر (موسیقی آرامش یا میکسر) باز می‌شود */
  openSection?: { tab: 'meditations' | 'mixer'; n: number };
}

export const SoundsScreen: React.FC<SoundsScreenProps> = ({ onOpenTrack, openSection }) => {
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('meditations');
  const [sleepTimerModal, setSleepTimerModal] = useState<boolean>(false);
  const [customMixName, setCustomMixName] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [showFolderHelp, setShowFolderHelp] = useState<boolean>(false);
  const [player, setPlayer] = useState<MeditationPlayerState>(() => meditationPlayer.getState());
  const [userPresets, setUserPresets] = useState<{ id: string; name: string; channels: { soundId: string; volume: number }[] }[]>(() => {
    try {
      const saved = localStorage.getItem('aramito_user_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (openSection) setActiveTab(openSection.tab);
  }, [openSection?.n]);

  useEffect(() => {
    const unsubAudio = audioEngine.subscribe(() => setTick((t) => t + 1));
    const unsubPlayer = meditationPlayer.subscribe(() => setPlayer(meditationPlayer.getState()));
    return () => {
      unsubAudio();
      unsubPlayer();
    };
  }, []);

  const iconMap: Record<string, React.ElementType> = {
    CloudRain,
    CloudLightning,
    Waves,
    Droplets,
    Wind,
    Flame,
    Trees,
    Bird,
    Moon,
    Coffee,
    Activity,
    Sliders,
    Compass,
    Headphones,
    Radio
  };

  const activeCount = audioEngine.getActiveCount();
  const sleepTimerRemaining = audioEngine.getSleepTimerRemaining();
  const activeTrack = getMeditationTrack(player.trackId);

  const handleSaveMix = () => {
    if (!customMixName.trim()) return;
    const channels = SOUND_CHANNELS.filter((ch) => audioEngine.isChannelActive(ch.id)).map((ch) => ({
      soundId: ch.id,
      volume: audioEngine.getChannelVolume(ch.id)
    }));

    if (channels.length === 0) return;

    const newPreset = {
      id: Date.now().toString(),
      name: customMixName.trim(),
      channels
    };

    const updated = [newPreset, ...userPresets];
    setUserPresets(updated);
    try {
      localStorage.setItem('aramito_user_presets', JSON.stringify(updated));
    } catch {}
    setCustomMixName('');
    setShowSaveModal(false);
    haptics.heavy();
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'meditations', label: 'موسیقی آرامش', count: MEDITATION_TRACKS.length },
    { id: 'mixer', label: 'میکسر طبیعت', count: SOUND_CHANNELS.length },
    { id: 'presets', label: 'میکس‌های آماده' }
  ];

  return (
    <div className="pb-safe px-4 max-w-md mx-auto space-y-4">
      {/* هدر بخش */}
      <div className="liquid-glass rounded-[26px] p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -left-10 -top-12 w-36 h-36 rounded-full bg-[var(--accent-lavender)] opacity-[0.16] blur-2xl pointer-events-none" />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <span className="section-eyebrow">SOUNDSCAPE</span>
            <h2 className="text-lg font-black text-[var(--text-primary)] mt-1">صدا و آرامش</h2>
            <p className="text-[11.5px] text-[var(--text-secondary)] mt-1 leading-relaxed">
              مدیتیشن‌های هدایت‌شده، میکسر طبیعت و ترکیب‌های آماده — همه در یک جا.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                haptics.light();
                setSleepTimerModal(true);
              }}
              title="تایمر خواب میکسر"
              className={`p-2 rounded-full transition-all flex items-center gap-1 ${
                sleepTimerRemaining > 0
                  ? 'bg-[var(--accent-warm)] text-white'
                  : 'liquid-glass-subtle text-[var(--text-secondary)]'
              }`}
            >
              <Clock className="w-4 h-4" />
              {sleepTimerRemaining > 0 && (
                <span className="text-[10px] num">{formatSeconds(sleepTimerRemaining)}</span>
              )}
            </button>
          </div>
        </div>

        {/* کارت وضعیت پخش و توقف همه */}
        <AnimatePresence initial={false}>
          {activeCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="relative overflow-hidden"
            >
              <div className="now-playing flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="now-playing__orb shrink-0">
                    <span className="eq-bars">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[11.5px] font-extrabold text-[var(--text-primary)]">
                      در حال پخش
                      <span className="num-badge bg-[var(--accent-sage)] text-white text-[10px] shadow-sm">
                        {toPersianDigits(activeCount)}
                      </span>
                    </p>
                    <div className="mt-1.5 flex items-center">
                      {audioEngine
                        .getActiveChannelList()
                        .slice(0, 4)
                        .map((ch) => {
                          const ChipIcon = iconMap[ch.icon] || Waves;
                          return (
                            <span key={ch.id} className="chan-chip" title={ch.name}>
                              <ChipIcon className="w-3 h-3" />
                            </span>
                          );
                        })}
                      {audioEngine.getActiveChannelList().length > 4 && (
                        <span className="mr-1.5 text-[10px] font-bold num text-[var(--text-muted)]">
                          +{toPersianDigits(audioEngine.getActiveChannelList().length - 4)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    haptics.medium();
                    audioEngine.stopAllChannels();
                  }}
                  className="stop-all shrink-0"
                  aria-label="توقف همه صداها"
                >
                  <span className="stop-all__icon">
                    <Square className="w-3 h-3 fill-current" />
                  </span>
                  <span>توقف همه</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* سوییچ تب‌ها */}
        <div className="relative mt-4 flex items-center gap-1 p-1 rounded-2xl bg-black/[0.045] dark:bg-white/[0.06]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  haptics.light();
                  setActiveTab(tab.id);
                }}
                className="relative flex-1 py-2 rounded-xl text-[10.5px] font-bold transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="soundsTabPill"
                    className="absolute inset-0 rounded-xl bg-white dark:bg-white/15 shadow-sm"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* تب موسیقی آرامش */}
      {activeTab === 'meditations' && (
        <div className="page-rise space-y-3">
          {activeTrack && (
            <button
              onClick={() => {
                haptics.light();
                onOpenTrack(activeTrack.id);
              }}
              className="w-full liquid-glass rounded-3xl p-3.5 flex items-center gap-3 text-right active:scale-[0.99] transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent-sage)] text-white flex items-center justify-center shrink-0">
                <Music2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[var(--accent-sage)] font-bold">
                  {player.isPlaying ? 'در حال پخش' : 'پخش متوقف شده'}
                </p>
                <p className="text-xs font-bold text-[var(--text-primary)] truncate mt-0.5">{activeTrack.title}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {player.isPlaying ? (
                  <span className="text-[var(--accent-sage)] eq-bars">
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  <span className="text-[10px] text-[var(--text-secondary)]">متوقف</span>
                )}
                <span className="w-8 h-8 rounded-full bg-white/70 dark:bg-white/15 flex items-center justify-center text-[var(--text-primary)]">
                  <ChevronLeft className="w-4 h-4" />
                </span>
              </div>
            </button>
          )}

          <div className="flex items-center justify-between px-1 pt-1">
            <span className="section-eyebrow">GUIDED MEDITATIONS</span>
            <span className="text-[10.5px] text-[var(--text-muted)] flex items-center gap-1">
              <span className="num text-[var(--accent-sage)]">{toPersianDigits(MEDITATION_TRACKS.length)}</span>
              مدیتیشن
            </span>
          </div>

          <div className="space-y-2.5">
            {MEDITATION_TRACKS.map((track, index) => {
              const Icon = TRACK_ICONS[track.icon] || Sparkles;
              const isCurrent = player.trackId === track.id;

              return (
                <motion.button
                  key={track.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.2) }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => {
                    haptics.medium();
                    onOpenTrack(track.id);
                  }}
                  className={`w-full liquid-glass rounded-3xl p-3 flex items-center gap-3 text-right transition-all ${
                    isCurrent ? 'ring-2 ring-[var(--accent-sage)]/60' : ''
                  }`}
                >
                  {/* کاور */}
                  <div
                    className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center relative overflow-hidden shadow-sm"
                    style={{
                      background: `linear-gradient(150deg, ${track.accent.from}, ${track.accent.to})`
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-70"
                      style={{
                        background: `radial-gradient(circle at 30% 22%, #ffffff 0%, transparent 62%)`
                      }}
                    />
                    <Icon className="w-[22px] h-[22px] relative z-10" style={{ color: '#465075' }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-[12.5px] font-bold text-[var(--text-primary)] truncate">{track.title}</h3>
                    <p className="text-[9px] font-semibold tracking-[0.18em] text-[var(--text-muted)] mt-0.5 truncate">
                      {track.latinTitle}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1 truncate">
                      <span className="num">{toPersianDigits(Math.max(1, Math.round(track.durationHint / 60)))}</span> دقیقه · {track.subtitle}
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-[var(--accent-sage)] text-white shadow-sm">
                    {isCurrent && player.isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current translate-x-[1px]" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* راهنمای افزودن فایل */}
          <div className="liquid-glass-subtle rounded-3xl p-4">
            <button
              onClick={() => {
                haptics.light();
                setShowFolderHelp((v) => !v);
              }}
              className="w-full flex items-center justify-between text-right"
            >
              <span className="flex items-center gap-2 text-[11.5px] font-bold text-[var(--text-primary)]">
                <FolderOpen className="w-4 h-4 text-[var(--accent-sage)]" />
                فایل‌های صوتی را کجا بگذارم؟
              </span>
              <ChevronLeft
                className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${
                  showFolderHelp ? '-rotate-90' : ''
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {showFolderHelp && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-[10.5px] text-[var(--text-secondary)] leading-relaxed mt-3">
                    همه فایل‌های mp3 را داخل پوشه زیر قرار دهید. نام فایل باید دقیقاً همان چیزی باشد که روبه‌روی هر
                    مدیتیشن نوشته شده است:
                  </p>
                  <div dir="ltr" className="mt-2 text-left rounded-2xl bg-black/[0.05] dark:bg-white/10 p-2.5 space-y-1">
                    <p className="text-[9.5px] font-mono text-[var(--accent-sage)] font-bold">
                      public/audio/meditations/
                    </p>
                    {MEDITATION_TRACKS.map((t) => (
                      <p key={t.id} className="text-[9.5px] font-mono text-[var(--text-secondary)]">
                        {t.file}
                      </p>
                    ))}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mt-2">
                    پس از افزودن فایل، اگر اپ باز است یک‌بار رفرش کنید. تا وقتی فایل اضافه نشده باشد، پلیر پیام
                    «فایل پیدا نشد» را با همان مسیر دقیق نشان می‌دهد.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* تب میکسر */}
      {activeTab === 'mixer' && (
        <div className="page-rise space-y-3">
          {activeCount > 0 && (
            <div className="liquid-glass rounded-2xl p-3 flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-secondary)]">
                <span className="num-badge bg-[var(--accent-sage-soft)] text-[var(--accent-sage)] text-[10px] ml-1.5">
                {toPersianDigits(activeCount)}
              </span>
              کانال فعال است
              </span>
              <button
                onClick={() => {
                  haptics.light();
                  setShowSaveModal(true);
                }}
                className="text-[11px] font-bold text-[var(--accent-sage)] flex items-center gap-1.5"
              >
                <BookmarkPlus className="w-4 h-4" />
                ذخیره این ترکیب
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {SOUND_CHANNELS.map((ch) => {
              const Icon = iconMap[ch.icon] || Waves;
              const isActive = audioEngine.isChannelActive(ch.id);
              const volume = audioEngine.getChannelVolume(ch.id);

              return (
                <div
                  key={ch.id}
                  className={`liquid-glass rounded-3xl p-3.5 flex flex-col justify-between transition-all ${
                    isActive
                      ? 'ring-2 ring-[var(--accent-sage)]/55 shadow-md'
                      : 'hover:bg-white/60 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => {
                        haptics.light();
                        audioEngine.toggleChannel(ch.id);
                      }}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-[var(--accent-sage)] text-white shadow-md scale-105'
                          : 'liquid-glass-subtle text-[var(--text-secondary)]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                    </button>

                    <button
                      onClick={() => {
                        haptics.light();
                        audioEngine.toggleChannel(ch.id);
                      }}
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-[var(--accent-sage-soft)] text-[var(--accent-sage)]'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {isActive ? 'روشن' : 'خاموش'}
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[var(--text-primary)] truncate">{ch.name}</span>
                      {ch.requiresHeadphones && (
                        <span title="نیاز به هدفون" className="inline-flex">
                          <Headphones className="w-3 h-3 text-[var(--accent-warm)] shrink-0 mr-1" />
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-2" dir="ltr">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          audioEngine.setChannelVolume(ch.id, v);
                          if (!isActive && v > 0) {
                            audioEngine.startChannel(ch.id);
                          }
                        }}
                        className="w-full accent-[var(--accent-sage)]"
                      />
                      <span
                        className={`num text-[10px] w-9 text-center rounded-full py-0.5 transition-colors ${
                          isActive
                            ? 'bg-[var(--accent-sage-soft)] text-[var(--accent-sage)]'
                            : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {formatPercent(volume)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* تب میکس‌های آماده */}
      {activeTab === 'presets' && (
        <div className="page-rise space-y-3">
          <p className="text-[11px] text-[var(--text-secondary)] px-1 leading-relaxed">
            ترکیب‌های از پیش طراحی‌شده برای موقعیت‌های مختلف:
          </p>

          <div className="space-y-2.5">
            {PRESET_MIXES.map((preset) => (
              <motion.div
                key={preset.id}
                whileTap={{ scale: 0.985 }}
                onClick={() => {
                  haptics.medium();
                  audioEngine.applyPreset(preset.id);
                }}
                className="liquid-glass rounded-3xl p-4 cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex-1 text-right">
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{preset.name}</h4>
                  <p className="text-[10.5px] text-[var(--text-secondary)] mt-1 leading-relaxed">{preset.description}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[var(--accent-sage)] font-semibold">
                    <Sparkles className="w-3 h-3" />
                    <span>
                      <span className="num">{toPersianDigits(preset.channels.length)}</span> لایه صوتی
                    </span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-[var(--accent-sage)] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Play className="w-4 h-4 fill-current translate-x-[1px]" />
                </div>
              </motion.div>
            ))}
          </div>

          {userPresets.length > 0 && (
            <div className="pt-2 space-y-2.5">
              <h4 className="section-eyebrow px-1">MY MIXES</h4>
              {userPresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    haptics.medium();
                    audioEngine.stopAllChannels();
                    setTimeout(() => {
                      preset.channels.forEach(({ soundId, volume }) => {
                        audioEngine.setChannelVolume(soundId, volume);
                        audioEngine.startChannel(soundId);
                      });
                    }, 300);
                  }}
                  className="liquid-glass rounded-3xl p-4 cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-[var(--text-primary)]">{preset.name}</h5>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {toPersianDigits(preset.channels.length)} کانال صوتی
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-sage-soft)] text-[var(--accent-sage)] flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 fill-current translate-x-[1px]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* تایمر خواب میکسر */}
      {sleepTimerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm liquid-glass rounded-3xl p-5 shadow-2xl space-y-4 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-sage-soft)] text-[var(--accent-sage)] flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">تایمر خواب میکسر</h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                صداهای طبیعت در پایان زمان تعیین‌شده به‌تدریج محو می‌شوند.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    haptics.light();
                    audioEngine.setSleepTimer(mins);
                    setSleepTimerModal(false);
                  }}
                  className="py-2.5 rounded-2xl liquid-glass-subtle hover:bg-[var(--accent-sage)] hover:text-white text-xs font-bold transition-all"
                >
                  {toPersianDigits(mins)} دقیقه
                </button>
              ))}
            </div>

            {sleepTimerRemaining > 0 && (
              <button
                onClick={() => {
                  haptics.light();
                  audioEngine.clearSleepTimer();
                  setSleepTimerModal(false);
                }}
                className="w-full py-2.5 rounded-2xl text-xs font-bold text-rose-500 bg-rose-500/10"
              >
                لغو تایمر ({formatSeconds(sleepTimerRemaining)})
              </button>
            )}

            <button
              onClick={() => setSleepTimerModal(false)}
              className="text-[11px] text-[var(--text-secondary)] block mx-auto pt-1"
            >
              بستن
            </button>
          </motion.div>
        </div>
      )}

      {/* ذخیره ترکیب */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm liquid-glass rounded-3xl p-5 shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-[var(--text-primary)]">نام‌گذاری ترکیب دلخواه</h3>
            <input
              type="text"
              placeholder="مثلاً: باران و آتش شبانه"
              value={customMixName}
              onChange={(e) => setCustomMixName(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl liquid-glass-subtle text-[var(--text-primary)] border border-[var(--border-glass)] outline-none focus:border-[var(--accent-sage)]"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveMix}
                className="flex-1 py-2.5 rounded-2xl bg-[var(--accent-sage)] text-white text-xs font-bold"
              >
                ذخیره
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2.5 rounded-2xl liquid-glass-subtle text-xs font-bold text-[var(--text-secondary)]"
              >
                انصراف
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
