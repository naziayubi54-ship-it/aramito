import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Sparkles, X } from 'lucide-react';
import { notifications, ToastMessage } from '../services/notifications';
import { haptics } from '../services/haptics';

interface ToastContainerProps {
  onNavigateTab?: (tab: 'home' | 'breathe' | 'sounds' | 'library' | 'profile') => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ onNavigateTab }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return notifications.addListener((toast) => {
      setToasts((prev) => [toast, ...prev.slice(0, 2)]);
      haptics.light();
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    });
  }, []);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAction = (toast: ToastMessage) => {
    if (toast.targetTab && onNavigateTab) {
      const mapping: Record<string, 'home' | 'breathe' | 'sounds' | 'library' | 'profile'> = {
        home: 'home',
        breathe: 'breathe',
        sounds: 'sounds',
        meditate: 'home',
        library: 'library',
        profile: 'profile'
      };
      onNavigateTab(mapping[toast.targetTab] || 'home');
    }
    handleDismiss(toast.id);
  };

  return (
    <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto pointer-events-none flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="pointer-events-auto liquid-glass rounded-2xl p-3 shadow-xl border border-white/60 dark:border-white/20 flex items-start gap-3 cursor-pointer"
            onClick={() => handleAction(toast)}
          >
            <div className="w-8 h-8 rounded-full bg-[var(--accent-sage-soft)] flex items-center justify-center shrink-0 text-[var(--accent-sage)] mt-0.5">
              {toast.title.includes('جمله') ? <Sparkles className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0 text-right">
              <h4 className="text-xs font-bold text-[var(--text-primary)]">{toast.title}</h4>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed line-clamp-2">{toast.body}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss(toast.id);
              }}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
