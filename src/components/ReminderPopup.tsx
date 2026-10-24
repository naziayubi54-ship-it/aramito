import React from 'react';
import { motion } from 'motion/react';
import { Wind, Settings, Sparkles } from 'lucide-react';
import { getDailyAffirmations } from '../data/affirmations';
import { haptics } from '../services/haptics';

interface ReminderPopupProps {
  onClose: () => void;
  onStartQuick: () => void;
  onOpenSettings: () => void;
}

/**
 * یادآور کشویی: چسبیده به هدر (داخل خود هدر رندر می‌شود) و فقط یک جمله در روز.
 * جمله هر روز تغییر می‌کند (بر اساس شمارهٔ روز).
 */
export const ReminderPopup: React.FC<ReminderPopupProps> = ({ onClose, onStartQuick, onOpenSettings }) => {
  const [sentence] = getDailyAffirmations(1, 0);

  return (
    <>
      {/* لایهٔ نامرئی برای بستن با لمس بیرون */}
      <div className="fixed inset-0 z-[-1]" onClick={onClose} aria-hidden="true" />

      <motion.div
        role="dialog"
        aria-label="یادآوری امروز"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18 }}
        className="absolute top-full left-4 mt-1.5 w-[min(345px,calc(100vw-2rem))] rounded-[28px] bg-[var(--bg-primary)] border border-[var(--border-glass)] shadow-[0_12px_36px_rgba(0,0,0,0.12)] p-5"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-[15px] font-extrabold text-[var(--text-primary)]">یادآوری امروز</h3>
        </div>
        <p className="text-[13px] leading-7 text-[var(--text-secondary)] mt-2">{sentence}</p>

        <hr className="border-[var(--border-glass)] my-3.5" />

        <div className="space-y-1.5">
          <button
            onClick={() => {
              haptics.medium();
              onStartQuick();
            }}
            className="w-full flex items-center gap-3 py-1.5 text-right active:scale-[0.98] transition-transform"
          >
            <span className="w-10 h-10 rounded-2xl bg-[var(--accent-sage)]/15 text-[var(--accent-sage)] flex items-center justify-center shrink-0">
              <Wind className="w-5 h-5" />
            </span>
            <span className="text-[13.5px] font-bold text-[var(--text-primary)]">شروع یک دقیقه آرامش</span>
          </button>

          <button
            onClick={() => {
              haptics.light();
              onOpenSettings();
            }}
            className="w-full flex items-center gap-3 py-1.5 text-right active:scale-[0.98] transition-transform"
          >
            <span className="w-10 h-10 rounded-2xl bg-[var(--accent-sage)]/15 text-[var(--accent-sage)] flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5" />
            </span>
            <span className="text-[13.5px] font-bold text-[var(--text-primary)]">تنظیم یادآورها</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};
