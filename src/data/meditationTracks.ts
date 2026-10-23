export interface MeditationTrack {
  id: string;
  /** عنوان فارسی که در فهرست «موسیقی آرامش» دیده می‌شود */
  title: string;
  /** عنوان لاتین کوتاه؛ در پلیر تمام‌صفحه با حروف فاصله‌دار نمایش داده می‌شود */
  latinTitle: string;
  subtitle: string;
  description: string;
  /** نام فایل داخل public/audio/meditations */
  file: string;
  /** مدت تقریبی به ثانیه؛ تا وقتی خود فایل لود نشده در فهرست نمایش داده می‌شود */
  durationHint: number;
  icon: string;
  /** پالت گرادیان پلیر */
  accent: { from: string; to: string; glow: string };
}

/**
 * فهرست مدیتیشن‌های صوتی.
 *
 * برای اضافه‌کردن یک فایل جدید:
 *   ۱) فایل mp3 را با همان نام `file` داخل public/audio/meditations بگذارید.
 *   ۲) یک آیتم تازه به همین آرایه اضافه کنید.
 *   ۳) هر جای اپ (فهرست موسیقی آرامش، پلیر، مینی‌پلیر) به‌طور خودکار آن را نشان می‌دهد.
 */
export const MEDITATION_TRACKS: MeditationTrack[] = [
  {
    id: 'emotion-regulation',
    title: 'مدیتیشن تنظیم هیجان',
    latinTitle: 'EMOTION REGULATION',
    subtitle: 'بازگشت به تعادل در چند دقیقه',
    description: 'همراهی آرام برای شناسایی، پذیرش و رهاسازی هیجان‌های شدید.',
    file: 'emotion-regulation.mp3',
    durationHint: 8 * 60,
    icon: 'Sparkles',
    accent: { from: '#D6E0F5', to: '#E9DCF3', glow: '#A9BFE8' }
  },
  {
    id: 'gratitude',
    title: 'مدیتیشن شکرگزاری',
    latinTitle: 'GRATITUDE',
    subtitle: 'دیدن چیزهایی که همین حالا داریم',
    description: 'تمرین سپاسگزاری آگاهانه برای نرم‌تر کردن ذهن و قلب.',
    file: 'gratitude.mp3',
    durationHint: 7 * 60,
    icon: 'Heart',
    accent: { from: '#F7E6D3', to: '#F3E9F5', glow: '#EAC6A6' }
  },
  {
    id: 'anxiety-release',
    title: 'مدیتیشن رفع تنش و اضطراب',
    latinTitle: 'ANXIETY RELEASE',
    subtitle: 'آرام‌سازی بدن و ذهن',
    description: 'تنفس هدایت‌شده و شل‌سازی تدریجی برای فرونشاندن دلشوره.',
    file: 'anxiety-release.mp3',
    durationHint: 10 * 60,
    icon: 'Waves',
    accent: { from: '#D3E9E4', to: '#DEE8F4', glow: '#9FD3C7' }
  },
  {
    id: 'focus',
    title: 'مدیتیشن تمرکز',
    latinTitle: 'DEEP FOCUS',
    subtitle: 'آماده‌سازی ذهن برای کار عمیق',
    description: 'کوتاه و روشن؛ پیش از مطالعه، کار یا شروع یک پروژه.',
    file: 'focus.mp3',
    durationHint: 6 * 60,
    icon: 'Compass',
    accent: { from: '#DBDFF4', to: '#E6E1F5', glow: '#AEB6E2' }
  },
  {
    id: 'deep-sleep',
    title: 'مدیتیشن خواب آرام',
    latinTitle: 'DEEP SLEEP',
    subtitle: 'رها کردن روز و ورود به خواب',
    description: 'همراه شبانه برای خاموش‌کردن افکار تکرارشونده.',
    file: 'deep-sleep.mp3',
    durationHint: 12 * 60,
    icon: 'Moon',
    accent: { from: '#D2D5EF', to: '#E3D9EE', glow: '#A3A6D8' }
  },
  {
    id: 'morning',
    title: 'مدیتیشن شروع روز',
    latinTitle: 'GOOD MORNING',
    subtitle: 'بیدار شدن آرام و آگاهانه',
    description: 'چند دقیقه حضور در صبح، پیش از شتاب گرفتن روز.',
    file: 'morning.mp3',
    durationHint: 5 * 60,
    icon: 'Sun',
    accent: { from: '#F8E5D5', to: '#F4EFD9', glow: '#F0C9A5' }
  },
  {
    id: 'self-compassion',
    title: 'مدیتیشن شفقت به خود',
    latinTitle: 'SELF COMPASSION',
    subtitle: 'مهربانی با خودِ خسته',
    description: 'تمرین مهربانی (Metta) برای تسکین انتقاد درونی.',
    file: 'self-compassion.mp3',
    durationHint: 9 * 60,
    icon: 'Flower2',
    accent: { from: '#F4DDE7', to: '#E9DEF3', glow: '#E2B2C8' }
  },
  {
    id: 'body-scan',
    title: 'مدیتیشن اسکن بدن',
    latinTitle: 'BODY SCAN',
    subtitle: 'رهاسازی تنش‌های پنهان بدن',
    description: 'حرکت آگاهانه توجه از سر تا پا و بازگرداندن آرامش به بدن.',
    file: 'body-scan.mp3',
    durationHint: 11 * 60,
    icon: 'Scan',
    accent: { from: '#D8EADC', to: '#DEEBF2', glow: '#A9D0C1' }
  }
];

export function getMeditationTrack(id: string | null | undefined): MeditationTrack | undefined {
  if (!id) return undefined;
  return MEDITATION_TRACKS.find((t) => t.id === id);
}

export function getMeditationTrackIndex(id: string | null | undefined): number {
  if (!id) return -1;
  return MEDITATION_TRACKS.findIndex((t) => t.id === id);
}

/** مسیر نسبی فایل صوتی؛ سازگار با Vite base و بسته‌بندی اندروید */
export function getMeditationAudioUrl(track: MeditationTrack): string {
  return `${import.meta.env.BASE_URL}audio/meditations/${track.file}`;
}

/** مسیر نمایشی برای راهنمایی کاربر */
export function getMeditationAudioPath(track: MeditationTrack): string {
  return `public/audio/meditations/${track.file}`;
}
