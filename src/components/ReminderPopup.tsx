import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Bell, Sparkles, RefreshCw, Wind, Settings } from 'lucide-react';
import { getDailyAffirmations, getImportantReminder } from '../data/affirmations';
import { haptics } from '../services/haptics';

interface ReminderPopupProps {
  onClose: () => void;
  onStartQuick: () => void;
  onOpenSettings: () => void;
}

export const ReminderPopup: React.FC<ReminderPopupProps> = ({ onClose, onStartQuick, onOpenSettings }) => {
  const [shift, setShift] = useState(0);
  const reminder = getImportantReminder();
  const sentences = getDailyAffirmations(4, shift);

  return (
    <motion.div
      className="fixed inset-0 z-[58] flex items-center justify-center p-5 bg-black/45 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="یادآوری مهم"
        initial={{ scale: 0.94, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm max-h-[86vh] overflow-y-auto rounded-[30px] bg-[var(--bg-primary)] border border-[var(--border-glass)] shadow-2xl p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#52C9BB] to-[#2FA99B] text-white flex items-center justify-center shadow-md">
              <Bell className="w-5 h-5" />
            </span>
            <h3 className="text-[16px] font-black text-[var(--text-primary)]">یادآوری مهم</h3>
          </div>
          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            aria-label="بستن"
            className="w-9 h-9 rounded-full liquid-glass-subtle flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* یادآوری مهم */}
        <div className="mt-4 rounded-3xl p-4 bg-[var(--accent-sage)]/12 border border-[var(--accent-sage)]/25">
          <p className="text-[13px] font-black text-[var(--accent-sage)]">{reminder.title}</p>
          <p className="text-[12.5px] leading-7 text-[var(--text-primary)] mt-1.5">{reminder.text}</p>
          <button
            onClick={() => {
              haptics.medium();
              onStartQuick();
            }}
            className="mt-3 w-full py-2.5 rounded-2xl bg-gradient-to-l from-[#52C9BB] to-[#2FA99B] text-white text-[12px] font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
          >
            <Wind className="w-4 h-4" />
            <span>شروع یک دقیقه آرامش</span>
          </button>
        </div>

        {/* جملات مثبت */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--text-primary)]">
              <Sparkles className="w-4 h-4 text-amber-500" />
              جملات مثبت امروز
            </span>
            <button
              onClick={() => {
                haptics.light();
                setShift((s) => s + 1);
              }}
              aria-label="جملات دیگر"
              className="w-8 h-8 rounded-full liquid-glass-subtle flex items-center justify-center text-[var(--text-muted)] active:scale-90 transition-transform"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="space-y-2">
            {sentences.map((t, i) => (
              <motion.li
                key={`${shift}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="liquid-glass-subtle rounded-2xl px-3.5 py-3 text-[12.5px] leading-7 text-[var(--text-primary)]"
              >
                {t}
              </motion.li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => {
            haptics.light();
            onOpenSettings();
          }}
          className="mt-4 w-full py-2.5 rounded-2xl text-[11.5px] font-bold text-[var(--text-secondary)] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>تنظیم یادآورها در تنظیمات</span>
        </button>
      </motion.div>
    </motion.div>
  );
};
