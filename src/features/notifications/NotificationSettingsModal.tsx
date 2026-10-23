import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Bell, Clock, Sparkles, Moon, Wind, Heart, Send } from 'lucide-react';
import { storage, NotificationSettings } from '../../services/storage';
import { notifications } from '../../services/notifications';
import { toPersianDigits } from '../../utils/persian';
import { haptics } from '../../services/haptics';

interface NotificationSettingsModalProps {
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    storage.getNotifications().then(setSettings);
  }, []);

  const handleUpdate = async (updated: NotificationSettings) => {
    setSettings(updated);
    await storage.saveNotifications(updated);
    await notifications.syncSchedules(updated);
  };

  const handleTest = async (type: 'quote' | 'breathe' | 'sleep' | 'meditation') => {
    haptics.medium();
    await notifications.sendTestNotification(type);
  };

  if (!settings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md h-[90vh] max-h-[720px] liquid-glass rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass-subtle)] shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[var(--accent-sage)]" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">تنظیمات یادآورها و اعلان‌ها</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full liquid-glass-subtle text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings List */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
          {/* Quick test bar */}
          <div className="p-3.5 rounded-2xl liquid-glass-subtle space-y-2">
            <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
              <span>ارسال فوری نوتیفیکیشن تستی:</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleTest('quote')}
                className="py-1.5 px-2 rounded-xl bg-white/70 dark:bg-white/10 text-[11px] font-bold text-[var(--text-primary)] hover:bg-white shadow-xs"
              >
                جملهٔ روز
              </button>
              <button
                onClick={() => handleTest('breathe')}
                className="py-1.5 px-2 rounded-xl bg-white/70 dark:bg-white/10 text-[11px] font-bold text-[var(--text-primary)] hover:bg-white shadow-xs"
              >
                تنفس آرامش
              </button>
              <button
                onClick={() => handleTest('sleep')}
                className="py-1.5 px-2 rounded-xl bg-white/70 dark:bg-white/10 text-[11px] font-bold text-[var(--text-primary)] hover:bg-white shadow-xs"
              >
                یادآور خواب
              </button>
            </div>
          </div>

          {/* 1. Daily Quote Reminder */}
          <div className="p-3.5 rounded-2xl liquid-glass-subtle space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-[var(--text-primary)]">جملهٔ آرامش‌بخش روزانه</span>
              </div>
              <input
                type="checkbox"
                checked={settings.dailyQuoteEnabled}
                onChange={(e) => handleUpdate({ ...settings, dailyQuoteEnabled: e.target.checked })}
                className="w-4 h-4 accent-[var(--accent-sage)] rounded cursor-pointer"
              />
            </div>
            {settings.dailyQuoteEnabled && (
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[var(--text-secondary)]">ساعت ارسال:</span>
                <input
                  type="time"
                  value={settings.dailyQuoteTime}
                  onChange={(e) => handleUpdate({ ...settings, dailyQuoteTime: e.target.value })}
                  className="bg-white/80 dark:bg-black/30 border border-[var(--border-glass)] rounded-xl px-2 py-1 font-bold text-xs"
                />
              </div>
            )}
          </div>

          {/* 2. Sleep Reminder */}
          <div className="p-3.5 rounded-2xl liquid-glass-subtle space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-[var(--text-primary)]">یادآور زمان خواب (۳۰ دقیقه قبل)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.sleepReminderEnabled}
                onChange={(e) => handleUpdate({ ...settings, sleepReminderEnabled: e.target.checked })}
                className="w-4 h-4 accent-[var(--accent-sage)] rounded cursor-pointer"
              />
            </div>
            {settings.sleepReminderEnabled && (
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[var(--text-secondary)]">ساعت خواب معمول شما:</span>
                <input
                  type="time"
                  value={settings.sleepReminderTime}
                  onChange={(e) => handleUpdate({ ...settings, sleepReminderTime: e.target.value })}
                  className="bg-white/80 dark:bg-black/30 border border-[var(--border-glass)] rounded-xl px-2 py-1 font-bold text-xs"
                />
              </div>
            )}
          </div>

          {/* 3. Breath Reminder */}
          <div className="p-3.5 rounded-2xl liquid-glass-subtle space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-[var(--accent-sage)]" />
                <span className="text-xs font-bold text-[var(--text-primary)]">تنفس آگاهانه میان روز</span>
              </div>
              <input
                type="checkbox"
                checked={settings.breathReminderEnabled}
                onChange={(e) => handleUpdate({ ...settings, breathReminderEnabled: e.target.checked })}
                className="w-4 h-4 accent-[var(--accent-sage)] rounded cursor-pointer"
              />
            </div>
            {settings.breathReminderEnabled && (
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[var(--text-secondary)]">ساعت یادآوری:</span>
                <input
                  type="time"
                  value={settings.breathReminderTime}
                  onChange={(e) => handleUpdate({ ...settings, breathReminderTime: e.target.value })}
                  className="bg-white/80 dark:bg-black/30 border border-[var(--border-glass)] rounded-xl px-2 py-1 font-bold text-xs"
                />
              </div>
            )}
          </div>

          {/* 4. Mood Check Reminder */}
          <div className="p-3.5 rounded-2xl liquid-glass-subtle space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-[var(--text-primary)]">ثبت حال و احساس شبانه</span>
              </div>
              <input
                type="checkbox"
                checked={settings.moodCheckEnabled}
                onChange={(e) => handleUpdate({ ...settings, moodCheckEnabled: e.target.checked })}
                className="w-4 h-4 accent-[var(--accent-sage)] rounded cursor-pointer"
              />
            </div>
            {settings.moodCheckEnabled && (
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[var(--text-secondary)]">ساعت بررسی:</span>
                <input
                  type="time"
                  value={settings.moodCheckTime}
                  onChange={(e) => handleUpdate({ ...settings, moodCheckTime: e.target.value })}
                  className="bg-white/80 dark:bg-black/30 border border-[var(--border-glass)] rounded-xl px-2 py-1 font-bold text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--border-glass-subtle)] shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-[var(--accent-sage)] text-white text-xs font-bold shadow-md"
          >
            ذخیره و تایید
          </button>
        </div>
      </motion.div>
    </div>
  );
};
