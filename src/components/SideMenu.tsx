import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Wind,
  Music2,
  Waves,
  BookOpen,
  Zap,
  Settings,
  Sun,
  Moon,
  SunMoon,
  ShieldCheck,
  Flame,
  Clock
} from 'lucide-react';
import { TabType } from './BottomNav';
import { storage, UserStats } from '../services/storage';
import { toPersianDigits } from '../utils/persian';
import { haptics } from '../services/haptics';

const markSrc = `${import.meta.env.BASE_URL}logo-mark.png`;

export type MenuTarget =
  | { kind: 'tab'; tab: TabType }
  | { kind: 'music' }
  | { kind: 'mixer' }
  | { kind: 'quick' }
  | { kind: 'notifications' };

interface SideMenuProps {
  open: boolean;
  currentTab: TabType;
  theme: 'light' | 'dark' | 'auto';
  onClose: () => void;
  onSelect: (target: MenuTarget) => void;
  onToggleTheme: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  open,
  currentTab,
  theme,
  onClose,
  onSelect,
  onToggleTheme
}) => {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (open) storage.getStats().then(setStats).catch(() => {});
  }, [open]);

  const sections: {
    title: string;
    items: { key: string; label: string; icon: React.ElementType; active?: boolean; target: MenuTarget }[];
  }[] = [
    {
      title: 'بخش‌های اصلی',
      items: [
        { key: 'home', label: 'خانه', icon: Home, active: currentTab === 'home', target: { kind: 'tab', tab: 'home' } },
        { key: 'breathe', label: 'تنفس علمی', icon: Wind, active: currentTab === 'breathe', target: { kind: 'tab', tab: 'breathe' } },
        { key: 'music', label: 'موسیقی آرامش', icon: Music2, active: currentTab === 'sounds', target: { kind: 'music' } },
        { key: 'mixer', label: 'میکسر صداهای طبیعت', icon: Waves, target: { kind: 'mixer' } }
      ]
    },
    {
      title: 'یادگیری و تمرین',
      items: [
        { key: 'library', label: 'کتابخانه', icon: BookOpen, active: currentTab === 'library', target: { kind: 'tab', tab: 'library' } },
        { key: 'quick', label: 'یک دقیقه آرامش', icon: Zap, target: { kind: 'quick' } }
      ]
    }
  ];

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : SunMoon;
  const themeLabel = theme === 'dark' ? 'تیره' : theme === 'light' ? 'روشن' : 'خودکار';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[55]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[3px]" onClick={onClose} />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="منوی آرامیتو"
            initial={{ x: '105%' }}
            animate={{ x: 0 }}
            exit={{ x: '105%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="absolute right-0 top-[calc(env(safe-area-inset-top,0px)+0.5rem)] bottom-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] w-[84%] max-w-[340px] mr-2 rounded-[32px] bg-[var(--bg-primary)] border border-[var(--border-glass)] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* سرتیتر: پروفایل و میان‌بُرها */}
            <div className="px-5 pt-5 pb-4 border-b border-[var(--border-glass-subtle)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-16 rounded-[22px] bg-[var(--accent-sage-soft)] ring-1 ring-[var(--accent-sage)]/30 flex items-center justify-center shrink-0">
                    <img src={markSrc} alt="" className="w-10 h-10 object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-[var(--text-muted)]">همراه آرامش شما</p>
                    <p className="text-[17px] font-black text-[var(--text-primary)] leading-tight">آرامیتو</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => {
                      haptics.light();
                      onSelect({ kind: 'tab', tab: 'profile' });
                    }}
                    aria-label="پروفایل و تنظیمات"
                    title="پروفایل و تنظیمات"
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center active:scale-90 transition-transform ${
                      currentTab === 'profile'
                        ? 'bg-gradient-to-br from-[#52C9BB] to-[#2FA99B] text-white shadow-md'
                        : 'bg-[var(--accent-sage-soft)]/70 text-[var(--text-secondary)]'
                    }`}
                  >
                    <Settings className="w-[18px] h-[18px]" />
                  </button>
                  <button
                    onClick={() => {
                      haptics.light();
                      onToggleTheme();
                    }}
                    aria-label={`پوستهٔ ${themeLabel}`}
                    title={`پوسته: ${themeLabel}`}
                    className="w-10 h-10 rounded-2xl bg-[var(--accent-sage-soft)]/70 text-amber-500 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <ThemeIcon className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/12 text-amber-600 dark:text-amber-400 text-[10.5px] font-bold">
                  <Flame className="w-3 h-3 fill-current" />
                  {toPersianDigits(stats?.streakDays || 0)} روز پیوسته
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--accent-sage)]/15 text-[var(--accent-sage)] text-[10.5px] font-bold">
                  <Clock className="w-3 h-3" />
                  {toPersianDigits(stats?.totalMinutes || 0)} دقیقه
                </span>
              </div>
            </div>

            {/* فهرست */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
              {sections.map((sec) => (
                <div key={sec.title} className="mb-3">
                  <p className="px-3 pt-2 pb-1.5 text-[11px] font-bold text-[var(--text-muted)]">{sec.title}</p>
                  {sec.items.map((it) => {
                    const Icon = it.icon;
                    return (
                      <button
                        key={it.key}
                        onClick={() => {
                          haptics.light();
                          onSelect(it.target);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-right transition-all active:scale-[0.98] ${
                          it.active
                            ? 'bg-gradient-to-l from-[#52C9BB] to-[#2FA99B] text-white shadow-lg shadow-[#40BCAE]/25'
                            : 'text-[var(--text-primary)] hover:bg-[var(--accent-sage-soft)]/50'
                        }`}
                      >
                        <Icon className={`w-[21px] h-[21px] shrink-0 ${it.active ? 'text-white' : 'text-[var(--text-secondary)]'}`} />
                        <span className="text-[13.5px] font-bold">{it.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* پایین منو */}
            <div className="px-5 py-3.5 border-t border-[var(--border-glass-subtle)] flex items-center gap-2 text-[var(--text-muted)]">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[var(--accent-sage)]" />
              <p className="text-[10.5px] leading-5">همهٔ داده‌ها فقط روی همین گوشی می‌مانند.</p>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
