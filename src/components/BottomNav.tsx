import React from 'react';
import { Home, Wind, BookOpen, Music2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../services/haptics';

export type TabType = 'home' | 'breathe' | 'sounds' | 'library' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  /** دکمهٔ گرد کنار نوار: باز کردن موسیقی آرامش */
  onOpenMusic: () => void;
  isScrolled?: boolean;
}

const PILL_TABS = [
  { id: 'home' as TabType, label: 'خانه', icon: Home },
  { id: 'breathe' as TabType, label: 'تنفس', icon: Wind },
  { id: 'library' as TabType, label: 'کتابخانه', icon: BookOpen },
  { id: 'profile' as TabType, label: 'پروفایل', icon: User }
];

const BottomNavBase: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMusic,
  isScrolled = false
}) => {
  const musicActive = currentTab === 'sounds';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pt-1 pb-[calc(env(safe-area-inset-bottom,0px)+0.7rem)] pointer-events-none">
      <motion.div
        animate={{ scale: isScrolled ? 0.97 : 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="max-w-md mx-auto flex items-center gap-2.5"
      >
        {/* نوار قرصی: تب فعال با آیکن + نام، بقیه فقط آیکن */}
        <nav className="liquid-glass rounded-full p-1.5 flex-1 flex items-center justify-between pointer-events-auto shadow-2xl">
          {PILL_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                layout
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                onClick={() => {
                  haptics.light();
                  onSelectTab(tab.id);
                }}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                className={`h-11 rounded-full flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'px-4 bg-white dark:bg-white/15 shadow-sm text-[var(--text-primary)]'
                    : 'w-11 text-[var(--text-secondary)]'
                }`}
              >
                <Icon className={`w-[20px] h-[20px] shrink-0 ${isActive ? 'text-[var(--accent-sage)]' : ''}`} />
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[12px] font-bold whitespace-nowrap overflow-hidden"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </nav>

        {/* دکمهٔ گرد کناری: موسیقی آرامش */}
        <motion.button
          onClick={() => {
            haptics.medium();
            onOpenMusic();
          }}
          whileTap={{ scale: 0.9 }}
          title="موسیقی آرامش"
          aria-label="موسیقی آرامش"
          className={`pointer-events-auto shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#52C9BB] to-[#2FA99B] text-white flex items-center justify-center shadow-xl border-2 ${
            musicActive ? 'border-white ring-2 ring-[#40BCAE]/60' : 'border-white/70 dark:border-white/20'
          }`}
        >
          <Music2 className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </div>
  );
};

// memo: با اسکرول یا تغییر وضعیت‌های بی‌ربط، نوار پایین دوباره رندر نمی‌شود
export const BottomNav = React.memo(BottomNavBase);
