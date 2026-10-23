import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Play, Clock, Mic, Bell, Volume2, Shield } from 'lucide-react';
import { MEDITATIONS, MeditationItem } from '../../data/meditations';
import { MeditationSessionModal } from './MeditationSessionModal';
import { SpeakerScriptModal } from './SpeakerScriptModal';
import { toPersianDigits, formatSeconds } from '../../utils/persian';
import { haptics } from '../../services/haptics';

export const MeditateScreen: React.FC<{ initialMeditationId?: string | null }> = ({
  initialMeditationId
}) => {
  const [mode, setMode] = useState<'guided' | 'silent'>('guided');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [silentMinutes, setSilentMinutes] = useState<number>(10);
  const [activeSession, setActiveSession] = useState<{ item: MeditationItem | null; mode: 'guided' | 'silent' } | null>(() => {
    if (initialMeditationId) {
      const item = MEDITATIONS.find((m) => m.id === initialMeditationId) || null;
      if (item) return { item, mode: 'guided' };
    }
    return null;
  });
  const [scriptModalItem, setScriptModalItem] = useState<MeditationItem | null>(null);

  const categories = [
    { id: 'all', label: 'همه' },
    { id: 'mbsr', label: 'MBSR' },
    { id: 'body_scan', label: 'اسکن بدن' },
    { id: 'loving_kindness', label: 'مهربانی' },
    { id: 'sleep', label: 'خواب' },
    { id: 'anxiety', label: 'اضطراب' },
    { id: 'focus', label: 'تمرکز' },
    { id: 'emergency', label: '۳ دقیقه‌ای' },
  ];

  const filtered = selectedCategory === 'all'
    ? MEDITATIONS
    : MEDITATIONS.filter((m) => m.category === selectedCategory);

  return (
    <div className="space-y-4 pb-safe px-4 max-w-md mx-auto">
      {/* Header Banner */}
      <div className="liquid-glass rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--accent-sage)]" />
          <h2 className="text-base font-bold text-[var(--text-primary)]">مدیتیشن و ذهن‌آگاهی علمی</h2>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          تمرینات ساختاریافته کاهش استرس مبتنی بر ذهن‌آگاهی (MBSR). با هدایت متن یا در خلوت سکوت با کاسه تبتی.
        </p>

        {/* Guided vs Silent mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-2xl">
          <button
            onClick={() => {
              haptics.light();
              setMode('guided');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'guided'
                ? 'bg-white dark:bg-white/15 text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            مدیتیشن باکلام (راهنمایی‌شده)
          </button>
          <button
            onClick={() => {
              haptics.light();
              setMode('silent');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'silent'
                ? 'bg-white dark:bg-white/15 text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            مدیتیشن بی‌کلام (تایمر و زنگ)
          </button>
        </div>
      </div>

      {/* Guided Mode content */}
      {mode === 'guided' && (
        <div className="space-y-3">
          {/* Category filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  haptics.light();
                  setSelectedCategory(c.id);
                }}
                className={`px-3 py-1.5 rounded-2xl text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === c.id
                    ? 'bg-[var(--accent-sage)] text-white shadow-sm'
                    : 'liquid-glass-subtle text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Meditations list */}
          <div className="space-y-3">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="liquid-glass rounded-3xl p-4 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">{item.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-sage-soft)] text-[var(--accent-sage)]">
                        {item.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{item.subtitle}</p>
                  </div>

                  {/* Speaker script trigger */}
                  <button
                    onClick={() => {
                      haptics.light();
                      setScriptModalItem(item);
                    }}
                    title="مشاهده و کپی متن گوینده"
                    className="p-2 rounded-full liquid-glass-subtle text-[var(--text-secondary)] hover:text-[var(--accent-sage)]"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2 border-t border-[var(--border-glass-subtle)] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatSeconds(item.duration)}</span>
                  </div>

                  <button
                    onClick={() => {
                      haptics.medium();
                      setActiveSession({ item, mode: 'guided' });
                    }}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#8FAE9B] to-[#7FD1C7] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <span>شروع مراقبه</span>
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Silent Mode content */}
      {mode === 'silent' && (
        <div className="space-y-4">
          <div className="liquid-glass rounded-3xl p-6 shadow-lg text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-sage-soft)] text-[var(--accent-sage)] flex items-center justify-center mx-auto shadow-md">
              <Bell className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">مدیتیشن بی‌کلام با زنگ تبتی</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                مدت زمان مورد نظرتان را انتخاب کنید. با صدای زنگ آغاز می‌شود، صدای ملایم طبیعت در پس‌زمینه پخش می‌شود و در پایان با ۳ زنگ ملایم به پایان می‌رسد.
              </p>
            </div>

            {/* Minutes selector */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[5, 10, 15, 20].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    haptics.light();
                    setSilentMinutes(m);
                  }}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all ${
                    silentMinutes === m
                      ? 'bg-[var(--accent-sage)] text-white shadow-md'
                      : 'liquid-glass-subtle text-[var(--text-primary)] hover:bg-white/60'
                  }`}
                >
                  {toPersianDigits(m)} دقیقه
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                haptics.medium();
                setActiveSession({ item: null, mode: 'silent' });
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8FAE9B] to-[#7FD1C7] text-white text-xs font-bold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>آغاز سکوت ({toPersianDigits(silentMinutes)} دقیقه)</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Session Modal */}
      {activeSession && (
        <MeditationSessionModal
          meditation={activeSession.item}
          mode={activeSession.mode}
          silentMinutes={silentMinutes}
          onClose={() => setActiveSession(null)}
        />
      )}

      {/* Speaker Script Modal */}
      {scriptModalItem && (
        <SpeakerScriptModal
          meditation={scriptModalItem}
          onClose={() => setScriptModalItem(null)}
        />
      )}
    </div>
  );
};
