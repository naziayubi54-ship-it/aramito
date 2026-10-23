import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Clock,
  Wind,
  Flame,
  Award,
  Settings,
  Download,
  Upload,
  ShieldCheck,
  BookOpen,
  Vibrate,
  Palette,
  CheckCircle,
  HelpCircle,
  FileText,
  Sparkles,
  Leaf,
  CloudSun,
  Moon,
  CloudRain,
  Bell,
  ChevronLeft
} from 'lucide-react';
import { storage, UserStats, AppSettings, MoodEntry } from '../../services/storage';
import { SCIENTIFIC_REFERENCES, MEDICAL_DISCLAIMER_FA } from '../../data/references';
import { toPersianDigits } from '../../utils/persian';
import { haptics } from '../../services/haptics';

const MOOD_META = [
  { label: 'عالی', icon: Sparkles, color: '#F59E0B' },
  { label: 'خوب', icon: Leaf, color: '#10B981' },
  { label: 'آرام', icon: CloudSun, color: '#0EA5E9' },
  { label: 'خسته', icon: Moon, color: '#818CF8' },
  { label: 'مضطرب', icon: CloudRain, color: '#94A3B8' }
];

interface ProfileScreenProps {
  onOpenNotifications: () => void;
  onThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
  currentTheme: 'light' | 'dark' | 'auto';
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenNotifications,
  onThemeChange,
  currentTheme
}) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showReferences, setShowReferences] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string>('');

  useEffect(() => {
    storage.getStats().then(setStats);
    storage.getSettings().then(setSettings);
  }, []);

  const handleToggleHaptics = async () => {
    if (!settings) return;
    const updated = { ...settings, hapticsEnabled: !settings.hapticsEnabled };
    setSettings(updated);
    haptics.setEnabled(updated.hapticsEnabled);
    await storage.saveSettings(updated);
    if (updated.hapticsEnabled) haptics.light();
  };

  const handleExportData = async () => {
    haptics.medium();
    const json = await storage.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aramito-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await storage.importData(content);
      if (success) {
        setImportStatus('اطلاعات با موفقیت بازیابی شد.');
        const updatedStats = await storage.getStats();
        setStats(updatedStats);
      } else {
        setImportStatus('خطا در خواندن فایل پشتیبان.');
      }
      setTimeout(() => setImportStatus(''), 4000);
    };
    reader.readAsText(file);
  };

  // SVG Weekly Mood chart data (5 mood levels: 0 best to 4 worst)
  const moods = stats?.moods?.slice(0, 7).reverse() || [];
  const chartHeight = 80;
  const chartWidth = 260;
  const moodYMap: Record<number, number> = { 0: 15, 1: 30, 2: 45, 3: 60, 4: 75 };

  const badges = [
    { id: 'first_breath', name: 'اولین نفس', desc: 'نخستین جلسه تنفس علمی', unlocked: (stats?.breathingSessions || 0) >= 1 },
    { id: 'streak_3', name: 'استمرار ۳ روزه', desc: '۳ روز پیوسته خودمراقبتی', unlocked: (stats?.streakDays || 0) >= 3 },
    { id: 'zen_10', name: 'آرامش عمیق', desc: 'بیش از ۳۰ دقیقه مراقبه', unlocked: (stats?.meditationMinutes || 0) >= 30 },
    { id: 'science_lover', name: 'دوستدار علم', desc: 'مطالعه مستندات عصب‌شناسی', unlocked: false },
  ];

  return (
    <div className="space-y-4 pb-safe px-4 max-w-md mx-auto">
      {/* User Header */}
      <div className="liquid-glass rounded-3xl p-5 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8FAE9B] to-[#7FD1C7] text-white flex items-center justify-center font-bold text-lg shadow-md">
            آ
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">کاربر آرامیتو</h3>
            <p className="text-xs text-[var(--text-secondary)]">مسیر آگاهی و آرامش درونی</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl liquid-glass-subtle text-[var(--accent-sage)] text-xs font-bold num">
          <Flame className="w-4 h-4 fill-current text-amber-500 animate-pulse" />
          <span>{toPersianDigits(stats?.streakDays || 0)} روز پیاپی</span>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="liquid-glass rounded-3xl p-3.5 text-center shadow-md">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-1.5">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">کل زمان</span>
          <p className="text-base font-bold text-[var(--text-primary)] mt-0.5 num">
            {toPersianDigits(stats?.totalMinutes || 0)} <span className="text-[10px] font-normal">دقیقه</span>
          </p>
        </div>

        <div className="liquid-glass rounded-3xl p-3.5 text-center shadow-md">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-sage-soft)] text-[var(--accent-sage)] flex items-center justify-center mx-auto mb-1.5">
            <Wind className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">جلسات تنفس</span>
          <p className="text-base font-bold text-[var(--text-primary)] mt-0.5 num">
            {toPersianDigits(stats?.breathingSessions || 0)} <span className="text-[10px] font-normal">جلسه</span>
          </p>
        </div>

        <div className="liquid-glass rounded-3xl p-3.5 text-center shadow-md">
          <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-1.5">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">کل جلسات</span>
          <p className="text-base font-bold text-[var(--text-primary)] mt-0.5 num">
            {toPersianDigits(stats?.totalSessions || 0)}
          </p>
        </div>
      </div>

      {/* Weekly Mood SVG Chart */}
      <div className="liquid-glass rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[var(--text-primary)]">روند خلق‌وخوی اخیر</h4>
          <span className="text-[10px] text-[var(--text-muted)]">آخرین ثبت‌ها</span>
        </div>

        {moods.length > 0 ? (
          <>
            <div className="pt-2 flex justify-center">
              <svg width={chartWidth} height={chartHeight} className="overflow-visible">
                {/* Guidelines */}
                <line x1="0" y1="15" x2={chartWidth} y2="15" stroke="currentColor" className="text-black/5 dark:text-white/5" strokeDasharray="3 3" />
                <line x1="0" y1="45" x2={chartWidth} y2="45" stroke="currentColor" className="text-black/5 dark:text-white/5" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2={chartWidth} y2="75" stroke="currentColor" className="text-black/5 dark:text-white/5" strokeDasharray="3 3" />

                {/* Connected line */}
                {moods.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="var(--accent-sage)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={moods
                      .map((m, i) => {
                        const x = (chartWidth / (moods.length - 1 || 1)) * i;
                        const y = moodYMap[m.moodIndex] || 45;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                )}

                {/* Data points */}
                {moods.map((m, i) => {
                  const x = moods.length > 1 ? (chartWidth / (moods.length - 1)) * i : chartWidth / 2;
                  const y = moodYMap[m.moodIndex] || 45;
                  return (
                    <g key={m.id}>
                      <circle cx={x} cy={y} r="5" fill="var(--accent-sage)" />
                      <circle cx={x} cy={y} r="1.8" fill="#ffffff" opacity="0.9" />
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 pt-1">
              {MOOD_META.map(({ label, icon: Icon, color }) => (
                <span key={label} className="flex items-center gap-1 text-[9px] text-[var(--text-muted)]">
                  <Icon className="w-3 h-3" style={{ color }} />
                  {label}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-[var(--text-muted)] text-center py-4">
            هنوز حال روزمره‌ای ثبت نکرده‌اید.
          </p>
        )}
      </div>

      {/* Badges / Achievements */}
      <div className="liquid-glass rounded-3xl p-5 shadow-lg space-y-3">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">دستاوردها و نشان‌ها</h4>
        <div className="grid grid-cols-2 gap-2.5">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3 rounded-2xl flex items-center gap-2.5 transition-all ${
                b.unlocked
                  ? 'liquid-glass-subtle border border-[var(--accent-sage)]/30'
                  : 'opacity-40 grayscale border border-dashed border-black/10 dark:border-white/10'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-sage-soft)] text-[var(--accent-sage)] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">{b.name}</p>
                <p className="text-[10px] text-[var(--text-secondary)] truncate">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings list */}
      <div className="liquid-glass rounded-3xl p-5 shadow-lg space-y-4">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">تنظیمات کاربری</h4>

        {/* یادآورها و اعلان‌ها */}
        <button
          onClick={() => {
            haptics.light();
            onOpenNotifications();
          }}
          className="w-full flex items-center justify-between gap-3 p-3 rounded-2xl liquid-glass-subtle active:scale-[0.98] transition-transform text-right"
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-[var(--accent-sage-soft)] text-[var(--accent-sage)] flex items-center justify-center shrink-0">
              <Bell className="w-[18px] h-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold text-[var(--text-primary)]">یادآورها و اعلان‌ها</span>
              <span className="block text-[10px] text-[var(--text-secondary)] mt-0.5">زمان‌بندی حکمت روز، تنفس، خواب و مدیتیشن</span>
            </span>
          </span>
          <ChevronLeft className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
        </button>

        {/* Theme */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Palette className="w-4 h-4 text-[var(--accent-sage)]" />
            <span className="font-bold text-[var(--text-primary)]">پوسته ظاهری</span>
          </div>

          <div className="flex gap-1">
            {[
              { id: 'light' as const, label: 'روشن' },
              { id: 'dark' as const, label: 'تیره' },
              { id: 'auto' as const, label: 'خودکار' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  haptics.light();
                  onThemeChange(t.id);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  currentTheme === t.id
                    ? 'bg-[var(--accent-sage)] text-white shadow-xs'
                    : 'liquid-glass-subtle text-[var(--text-secondary)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Haptics */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-glass-subtle)]">
          <div className="flex items-center gap-2 text-xs">
            <Vibrate className="w-4 h-4 text-[var(--accent-sage)]" />
            <span className="font-bold text-[var(--text-primary)]">لرزش و بازخورد لمسی (Haptic)</span>
          </div>
          <input
            type="checkbox"
            checked={settings?.hapticsEnabled ?? true}
            onChange={handleToggleHaptics}
            className="w-4 h-4 accent-[var(--accent-sage)] rounded cursor-pointer"
          />
        </div>

        {/* Backup and restore */}
        <div className="pt-2 border-t border-[var(--border-glass-subtle)] space-y-2">
          <span className="text-xs font-bold text-[var(--text-primary)] block">پشتیبان‌گیری آفلاین داده‌ها:</span>
          <div className="flex gap-2">
            <button
              onClick={handleExportData}
              className="flex-1 py-2 px-3 rounded-xl liquid-glass-subtle text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-white/60 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>خروجی JSON</span>
            </button>
            <label className="flex-1 py-2 px-3 rounded-xl liquid-glass-subtle text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-white/60 cursor-pointer active:scale-95">
              <Upload className="w-3.5 h-3.5" />
              <span>بازیابی فایل</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
          {importStatus && (
            <p className="text-[11px] text-[var(--accent-sage)] font-bold text-center">{importStatus}</p>
          )}
        </div>

        {/* Scientific references trigger */}
        <div className="pt-2 border-t border-[var(--border-glass-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <BookOpen className="w-4 h-4 text-[var(--accent-sage)]" />
            <span className="font-bold text-[var(--text-primary)]">منابع علمی و مقالات داوری‌شده</span>
          </div>
          <button
            onClick={() => {
              haptics.light();
              setShowReferences(true);
            }}
            className="text-xs font-bold text-[var(--accent-sage)] hover:underline"
          >
            مشاهده
          </button>
        </div>
      </div>

      {/* Medical Disclaimer Banner */}
      <div className="p-4 rounded-3xl liquid-glass-subtle border border-amber-500/20 text-xs text-[var(--text-secondary)] space-y-1.5 leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>سلب مسئولیت پزشکی آرامیتو:</span>
        </div>
        <p className="text-[11px]">{MEDICAL_DISCLAIMER_FA}</p>
      </div>

      {/* References Modal */}
      {showReferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg h-[80vh] liquid-glass rounded-3xl p-5 shadow-2xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass-subtle)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">پایگاه مراجع و مقالات علمی آرامیتو</h3>
              <button onClick={() => setShowReferences(false)} className="text-xs font-bold text-[var(--text-muted)]">بستن</button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-3">
              {Object.values(SCIENTIFIC_REFERENCES).map((ref) => (
                <div key={ref.id} className="p-3.5 rounded-2xl liquid-glass-subtle space-y-1 text-right">
                  <h5 className="text-xs font-bold text-[var(--text-primary)]">{ref.title}</h5>
                  <p className="text-[11px] text-[var(--text-secondary)]">{ref.authors} ({ref.year})</p>
                  <p className="text-[10px] font-mono text-[var(--accent-sage)]">{ref.journal}</p>
                  <p className="text-[11px] text-[var(--text-primary)] pt-1">{ref.summaryFa}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowReferences(false)}
              className="w-full py-2.5 rounded-xl bg-[var(--accent-sage)] text-white text-xs font-bold"
            >
              متوجه شدم
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
