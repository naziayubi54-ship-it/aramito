import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wind, Play, Info, ShieldAlert, Sparkles, BookOpen, X } from 'lucide-react';
import { BREATHING_TECHNIQUES, BreathingTechnique } from '../../data/breathing';
import { SCIENTIFIC_REFERENCES } from '../../data/references';
import { BreathingSessionModal } from './BreathingSessionModal';
import { haptics } from '../../services/haptics';

export const BreatheScreen: React.FC<{ initialTechniqueId?: string | null }> = ({
  initialTechniqueId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSessionTech, setActiveSessionTech] = useState<BreathingTechnique | null>(() => {
    if (initialTechniqueId) {
      return BREATHING_TECHNIQUES.find((t) => t.id === initialTechniqueId) || null;
    }
    return null;
  });
  const [infoModalTech, setInfoModalTech] = useState<BreathingTechnique | null>(null);

  const categories = [
    { id: 'all', label: 'همه الگوها' },
    { id: 'calm', label: 'آرامش روزمره' },
    { id: 'sleep', label: 'خواب عمیق' },
    { id: 'focus', label: 'تمرکز کاری' },
    { id: 'emergency', label: 'مهار فوری استرس' },
  ];

  const filtered = selectedCategory === 'all'
    ? BREATHING_TECHNIQUES
    : BREATHING_TECHNIQUES.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-4 pb-safe px-4 max-w-md mx-auto">
      {/* Header title & evidence note */}
      <div className="liquid-glass rounded-3xl p-5 shadow-lg">
        <div className="flex items-center gap-2 text-[var(--accent-sage)]">
          <Wind className="w-5 h-5" />
          <h2 className="text-base font-black text-[var(--text-primary)]">تنفس‌های مبتنی بر شواهد بالینی</h2>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
          تنفس، تنها کارکرد سیستم خودمختار است که هم خودکار انجام می‌شود و هم ارادی قابل کنترل است. با ریتم‌های هدفمند، ضربان قلب و عصب واگ را در چند دقیقه هدایت کنید.
        </p>

        {/* Categories segmented filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-4">
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
      </div>

      {/* Techniques list */}
      <div className="space-y-3">
        {filtered.map((tech) => (
          <motion.div
            key={tech.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass rounded-3xl p-4 shadow-md space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{tech.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-sage-soft)] text-[var(--accent-sage)]">
                    شواهد {tech.evidenceLevel}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{tech.persianSubtitle}</p>
              </div>

              <button
                onClick={() => {
                  haptics.light();
                  setInfoModalTech(tech);
                }}
                title="مکانیسم علمی و منبع"
                className="p-2 rounded-full liquid-glass-subtle text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {tech.summary}
            </p>

            {/* Phases summary & Start Button */}
            <div className="pt-2 border-t border-[var(--border-glass-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                {tech.phases.map((p, idx) => (
                  <span key={idx} className="flex items-center gap-1">
                    <span>{p.name.split(' ')[0]} {p.duration}ث</span>
                    {idx < tech.phases.length - 1 && <span>·</span>}
                  </span>
                ))}
              </div>

              <button
                onClick={() => {
                  haptics.medium();
                  setActiveSessionTech(tech);
                }}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#8FAE9B] to-[#7FD1C7] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <span>شروع تمرین</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scientific details modal */}
      {infoModalTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md liquid-glass rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--accent-sage)]">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">مکانیسم فیزیولوژیک</h3>
              </div>
              <button
                onClick={() => setInfoModalTech(null)}
                className="p-1.5 rounded-full liquid-glass-subtle text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              <div>
                <span className="font-bold text-[var(--text-primary)]">عنوان تمرین: </span>
                <span>{infoModalTech.name}</span>
              </div>

              <div className="p-3 rounded-2xl liquid-glass-subtle">
                <span className="font-bold text-[var(--text-primary)] block mb-1">سازوکار اثر در بدن:</span>
                <p>{infoModalTech.mechanism}</p>
              </div>

              {infoModalTech.referenceId && SCIENTIFIC_REFERENCES[infoModalTech.referenceId] && (
                <div className="p-3 rounded-2xl liquid-glass-subtle space-y-1">
                  <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                    <span>منبع معتبر دانشگاهی:</span>
                  </span>
                  <p className="text-[11px] font-mono text-[var(--text-muted)]">
                    {SCIENTIFIC_REFERENCES[infoModalTech.referenceId].authors} ({SCIENTIFIC_REFERENCES[infoModalTech.referenceId].year}).
                  </p>
                  <p className="text-[11px] font-semibold text-[var(--text-primary)]">
                    {SCIENTIFIC_REFERENCES[infoModalTech.referenceId].journal}
                  </p>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 space-y-1">
                <div className="flex items-center gap-1 font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>توصیه ایمنی:</span>
                </div>
                <p className="text-[11px]">{infoModalTech.safetyWarning}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveSessionTech(infoModalTech);
                setInfoModalTech(null);
              }}
              className="w-full py-3 rounded-2xl bg-[var(--accent-sage)] text-white text-xs font-bold active:scale-98 transition-all"
            >
              شروع این تکنیک
            </button>
          </motion.div>
        </div>
      )}

      {/* Active Session Player Modal */}
      {activeSessionTech && (
        <BreathingSessionModal
          technique={activeSessionTech}
          onClose={() => setActiveSessionTech(null)}
        />
      )}
    </div>
  );
};
