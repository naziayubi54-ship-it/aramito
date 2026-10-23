import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Moon, Brain, ShieldAlert, Clock, Bell, ArrowLeft, Check } from 'lucide-react';
import { storage } from '../services/storage';
import { notifications } from '../services/notifications';
import { haptics } from '../services/haptics';
import { toPersianDigits } from '../utils/persian';
import timeManagementArt from '../assets/time-management.svg';
import peaceOfMindArt from '../assets/peace-of-mind.svg';
import aloneArt from '../assets/alone.svg';

const logoSrc = `${import.meta.env.BASE_URL}logo.png`;

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedGoal, setSelectedGoal] = useState<'sleep' | 'stress' | 'focus' | 'anxiety'>('stress');
  const [reminderTime, setReminderTime] = useState<string>('21:30');
  const [notifGranted, setNotifGranted] = useState<boolean>(false);

  if (!isOpen) return null;

  const goals = [
    { id: 'stress' as const, title: 'کاهش استرس و تنش روزمره', icon: Sparkles, desc: 'فعال‌سازی سیستم پاراسمپاتیک در چند دقیقه' },
    { id: 'sleep' as const, title: 'خواب عمیق و آسوده', icon: Moon, desc: 'پایان دادن به نشخوار فکری و بی‌خوابی شبانه' },
    { id: 'focus' as const, title: 'افزایش تمرکز و بهره‌وری ذهنی', icon: Brain, desc: 'آرام‌سازی پرش افکار پیش از کار عمیق' },
    { id: 'anxiety' as const, title: 'مهار اضطراب و دلشوره', icon: ShieldAlert, desc: 'روش‌های اثبات‌شده استنفورد برای آرامش فوری' }
  ];

  const handleNextStep = async () => {
    haptics.light();
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(4);
      return;
    }

    // Finish onboarding
    const settings = await storage.getSettings();
    settings.onboardingCompleted = true;
    settings.primaryGoal = selectedGoal;
    await storage.saveSettings(settings);

    const notifSettings = await storage.getNotifications();
    notifSettings.meditationReminderTime = reminderTime;
    await storage.saveNotifications(notifSettings);

    haptics.heavy();
    onComplete();
  };

  const handleRequestNotif = async () => {
    haptics.medium();
    const granted = await notifications.requestPermission();
    setNotifGranted(granted);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex h-[100dvh] w-screen flex-col overflow-hidden bg-[var(--bg-primary)]"
      role="dialog"
      aria-modal="true"
      aria-label="خوش‌آمدگویی به آرامیتو"
    >
      {/* پس‌زمینهٔ نرم و تمام‌صفحه */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-[var(--accent-sage)]/25 blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-64 w-64 rounded-full bg-[var(--accent-lavender)]/25 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-[var(--accent-mist)]/20 blur-3xl" />
      </div>

      {/* محتوای قابل اسکرول */}
      <div className="relative flex-1 overflow-y-auto overscroll-contain px-5 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] pb-6">
        <div className="mx-auto flex min-h-full w-full max-w-md flex-col">
          {/* برند و مرحله */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-white shadow-sm overflow-hidden ring-1 ring-black/[0.06] shrink-0">
                <img src={logoSrc} alt="لوگوی آرامیتو" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-black text-[var(--text-primary)] leading-tight">آرامیتو</p>
                <p className="text-[9px] text-[var(--text-muted)] mt-0.5">همراه آرامش روزانه</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-[var(--text-secondary)] whitespace-nowrap">
              مرحله {toPersianDigits(step)} از ۴
            </span>
          </div>

          {/* نشانگر پیشرفت */}
          <div className="mt-4 flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  s === step
                    ? 'bg-[var(--accent-sage)]'
                    : s < step
                    ? 'bg-[var(--accent-sage)]/45'
                    : 'bg-black/[0.08] dark:bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* مراحل */}
          <div className="flex flex-1 flex-col justify-center py-5">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: [0.22, 0.8, 0.28, 1] }}
                  className="space-y-4 text-center"
                >
                  <img
                    src={timeManagementArt}
                    alt="آرامش با مدیریت زمان"
                    className="w-52 h-48 max-h-[36vh] object-contain mx-auto drop-shadow-sm"
                  />
                  <h2 className="text-[23px] font-black text-[var(--text-primary)] leading-snug">یک مکث برای خودت</h2>
                  <p className="text-[13px] leading-7 text-[var(--text-secondary)] max-w-xs mx-auto">
                    در شلوغی روز، چند دقیقه نفس بکش و دوباره با خودت همراه شو.
                  </p>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: [0.22, 0.8, 0.28, 1] }}
                  className="space-y-4 text-center"
                >
                  <img
                    src={peaceOfMindArt}
                    alt="ذهن آرام"
                    className="w-52 h-48 max-h-[36vh] object-contain mx-auto drop-shadow-sm"
                  />
                  <h2 className="text-[23px] font-black text-[var(--text-primary)] leading-snug">آرامش، همین حالا</h2>
                  <p className="text-[13px] leading-7 text-[var(--text-secondary)] max-w-xs mx-auto">
                    با تنفس علمی، مدیتیشن و صداهای طبیعت، ریتم آرام خودت را پیدا کن.
                  </p>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: [0.22, 0.8, 0.28, 1] }}
                  className="space-y-4 text-center"
                >
                  <img
                    src={aloneArt}
                    alt="خلوت آگاهانه"
                    className="w-52 h-48 max-h-[36vh] object-contain mx-auto drop-shadow-sm"
                  />
                  <h2 className="text-[23px] font-black text-[var(--text-primary)] leading-snug">خلوتی که به تو می‌رسد</h2>
                  <p className="text-[13px] leading-7 text-[var(--text-secondary)] max-w-xs mx-auto">
                    داده‌هایت روی همین گوشی می‌مانند؛ آرامیتو همراهی ساده و خصوصی برای حال بهتر است.
                  </p>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: [0.22, 0.8, 0.28, 1] }}
                  className="space-y-3.5"
                >
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--accent-sage-soft)] text-[var(--accent-sage)] flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-7 h-7" />
                    </div>
                    <h2 className="text-[19px] font-black text-[var(--text-primary)] leading-snug">
                      آرامیتو را برای خودت تنظیم کن
                    </h2>
                    <p className="text-[11.5px] text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-xs mx-auto">
                      هدفت را انتخاب کن و اگر خواستی یک یادآور ملایم برای خلوت روزانه‌ات بگذار.
                    </p>
                  </div>

                  <div className="space-y-2 text-right">
                    {goals.map((g) => {
                      const Icon = g.icon;
                      const isSelected = selectedGoal === g.id;
                      return (
                        <button
                          key={g.id}
                          onClick={() => {
                            haptics.light();
                            setSelectedGoal(g.id);
                          }}
                          className={`w-full p-2.5 rounded-2xl flex items-center gap-2.5 transition-all ${
                            isSelected
                              ? 'bg-[var(--accent-sage)]/15 border-2 border-[var(--accent-sage)]'
                              : 'liquid-glass-subtle border-2 border-transparent'
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[var(--accent-sage)] text-white'
                                : 'bg-[var(--accent-sage-soft)]/70 text-[var(--accent-sage)]'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="flex-1 text-xs font-bold text-[var(--text-primary)]">{g.title}</span>
                          {isSelected && <Check className="w-4 h-4 text-[var(--accent-sage)] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-3 p-3 rounded-2xl liquid-glass-subtle">
                    <div className="text-right">
                      <p className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                        یادآور آرامش
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">هر روز در زمان انتخابی</p>
                    </div>
                    <label className="relative inline-flex items-center justify-center rounded-xl bg-white/70 dark:bg-white/10 border border-[var(--border-glass)] px-3 py-2 cursor-pointer active:scale-95 transition-transform">
                      <span className="num text-sm font-bold text-[var(--text-primary)]" dir="ltr">
                        {toPersianDigits(reminderTime)}
                      </span>
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        aria-label="زمان یادآور روزانه"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  </div>

                  <div className="p-3.5 rounded-2xl liquid-glass-subtle text-right">
                    <p className="text-xs text-[var(--text-primary)] font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[var(--accent-sage)]" />
                      <span>تضمین حریم خصوصی:</span>
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                      تمام داده‌ها و تنظیمات ۱۰۰٪ روی گوشی شما ذخیره شده و هیچ اطلاعاتی ارسال نمی‌شود.
                    </p>
                  </div>

                  <button
                    onClick={handleRequestNotif}
                    className={`w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      notifGranted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/70 dark:bg-white/10 hover:bg-white text-[var(--text-primary)] border border-[var(--border-glass)]'
                    }`}
                  >
                    {notifGranted ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>دسترسی نوتیفیکیشن تأیید شد</span>
                      </>
                    ) : (
                      <span>فعال‌سازی نوتیفیکیشن‌ها</span>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* دکمهٔ اقدام ثابت در پایین صفحه */}
      <div className="relative shrink-0 border-t border-[var(--border-glass-subtle)] bg-[var(--bg-primary)]/85 backdrop-blur-xl px-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] pt-3">
        <div className="mx-auto w-full max-w-md">
          <button
            onClick={handleNextStep}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-[#8FAE9B] to-[#7FD1C7] text-white font-bold text-sm shadow-lg shadow-[#8FAE9B]/25 hover:brightness-105 active:scale-[0.985] transition-all flex items-center justify-center gap-2"
          >
            <span>{step === 4 ? 'ورود به آرامیتو' : 'ادامه'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <p className="mt-2 text-center text-[9px] text-[var(--text-muted)]">
            بدون ثبت‌نام · کاملاً خصوصی روی همین گوشی
          </p>
        </div>
      </div>
    </div>
  );
};
