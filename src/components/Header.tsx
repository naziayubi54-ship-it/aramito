import React from 'react';
import { Menu, Wind, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { getGreeting, getPersianDate } from '../utils/persian';
import { haptics } from '../services/haptics';

const logoSrc = `${import.meta.env.BASE_URL}logo.png`;

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  onOpenQuickSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMenu,
  onOpenNotifications,
  onOpenQuickSession
}) => {
  const greeting = getGreeting();
  const todayPersian = getPersianDate();

  return (
    <header className="sticky top-0 z-30 pt-safe px-4 pb-2.5">
      <div className="max-w-md mx-auto liquid-glass rounded-[24px] px-3.5 py-2.5 flex items-center justify-between gap-2">
        {/* برند و سلام */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm shrink-0 overflow-hidden ring-1 ring-black/[0.06] dark:ring-white/15">
            <img src={logoSrc} alt="لوگوی آرامیتو" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[13.5px] font-bold text-[var(--text-primary)] leading-tight truncate">
              {greeting.text}
              <span className="font-normal text-[var(--text-secondary)]"> · آرامیتو</span>
            </h1>
            <p className="text-[9.5px] text-[var(--text-muted)] mt-1 leading-none">{todayPersian}</p>
          </div>
        </div>

        {/* اقدام‌های سریع */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              haptics.medium();
              onOpenQuickSession();
            }}
            title="یک دقیقه تنفس آرام"
            aria-label="یک دقیقه تنفس آرام"
            className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[#52C9BB] to-[#2FA99B] text-white flex items-center justify-center shadow-md shadow-[#40BCAE]/30 active:scale-90 transition-transform"
          >
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-[#40BCAE]"
              animate={{ scale: [1, 1.5], opacity: [0.55, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              className="relative flex"
              animate={{ scale: [1, 1.14, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Wind className="w-[18px] h-[18px]" strokeWidth={2.2} />
            </motion.span>
          </button>

          <button
            onClick={() => {
              haptics.light();
              onOpenNotifications();
            }}
            title="یادآوری مهم و جملات مثبت"
            aria-label="یادآوری مهم"
            className="w-9 h-9 rounded-full liquid-glass-subtle flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-transform"
          >
            <Bell className="w-[15px] h-[15px]" />
          </button>

          <button
            onClick={() => {
              haptics.light();
              onOpenMenu();
            }}
            title="منو"
            aria-label="باز کردن منو"
            className="w-9 h-9 rounded-full liquid-glass-subtle flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-transform"
          >
            <Menu className="w-[17px] h-[17px]" />
          </button>
        </div>
      </div>
    </header>
  );
};
