export interface PodcastEpisode {
  id: string;
  title: string;
  series: string;
  durationSeconds: number;
  durationLabel: string;
  speaker: string;
  description: string;
  accentColor: string;
  category: 'تنفس' | 'عصب‌شناسی' | 'خواب' | 'فلسفه آرامش';
  chapters: { title: string; time: number }[];
}

export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    id: 'pod-vagus-code',
    title: 'قسمت ۱: رمزگشایی از عصب واگ و سیستم آرامش بدن',
    series: 'رادیو آرامیتو',
    durationSeconds: 940,
    durationLabel: '۱۵ دقیقه',
    speaker: 'تیم پژوهشی آرامیتو',
    description: 'چگونه یک عصب جمجمه‌ای در ساقه مغز می‌تواند مثل یک کلید جادویی، اضطراب را در کمتر از دو دقیقه خاموش کند؟ گفتگو پیرامون تئوری پلی‌واگال و کاربردهای روزمره آن.',
    accentColor: '#8FAE9B',
    category: 'عصب‌شناسی',
    chapters: [
      { title: 'مقدمه و حس استرس در بدن', time: 0 },
      { title: 'کشف عصب واگ در آناتومی', time: 180 },
      { title: 'استیل‌کولین و ترمز تپش قلب', time: 420 },
      { title: 'تمرین عملی بازدم عمیق', time: 720 }
    ]
  },
  {
    id: 'pod-sleep-architecture',
    title: 'قسمت ۲: مهندسی خواب عمیق و ریکاوری مغز',
    series: 'رادیو آرامیتو',
    durationSeconds: 1120,
    durationLabel: '۱۸ دقیقه',
    speaker: 'تیم پژوهشی آرامیتو',
    description: 'در طول خواب عمیق، مایع مغزی-نخاعی مانند ماشین لباسشویی سموم بتا-آمیلوئید مغز را می‌شوید. در این اپیزود یاد می‌گیریم چگونه بدون قرص خواب، کیفیت خواب NREM را بالا ببریم.',
    accentColor: '#9DB4C8',
    category: 'خواب',
    chapters: [
      { title: 'سیستم گلیمفاتیک و نظافت شبانه مغز', time: 0 },
      { title: 'تأثیر نور آبی گوشی بر ملاتونین', time: 300 },
      { title: 'فرمول دمای اتاق و تاریکی مطلق', time: 660 },
      { title: 'تکنیک رهاسازی افکار قبل از خواب', time: 920 }
    ]
  },
  {
    id: 'pod-breath-superpower',
    title: 'قسمت ۳: تنفس هوشمند، ابرقدرت فراموش‌شده انسان',
    series: 'رادیو آرامیتو',
    durationSeconds: 880,
    durationLabel: '۱۴ دقیقه',
    speaker: 'تیم پژوهشی آرامیتو',
    description: 'بررسی آزمایشگاهی دکتر بالبان در استنفورد: چرا فقط ۵ دقیقه آه فیزیولوژیک در روز می‌تواند تأثیری شگرف بر خلق‌وخو، کاهش کورتیزول و ضربان قلب بگذارد؟',
    accentColor: '#B8A9D9',
    category: 'تنفس',
    chapters: [
      { title: 'تنفس خودکار در برابر تنفس آگاهانه', time: 0 },
      { title: 'آزمایش استنفورد و یافته‌های ۲۰۲۳', time: 240 },
      { title: 'نقش آلوئول‌های ریوی در تبادل گاز', time: 510 },
      { title: 'پروتکل روزانه آه فیزیولوژیک', time: 720 }
    ]
  },
  {
    id: 'pod-stoic-calm',
    title: 'قسمت ۴: هنر تسلط بر ذهن در دنیای پرهیاهو',
    series: 'رادیو آرامیتو',
    durationSeconds: 1040,
    durationLabel: '۱۷ دقیقه',
    speaker: 'تیم پژوهشی آرامیتو',
    description: 'پیوند میان روان‌شناسی شناختی-رفتاری نوین و آموزه‌های رواقی‌گری: چگونه میان رویدادهای بیرونی و پاسخ‌های درونی خود یک فضای آرامش بخش ایجاد کنیم.',
    accentColor: '#E28859',
    category: 'فلسفه آرامش',
    chapters: [
      { title: 'دوگانه کنترل: چه چیز در دست ماست؟', time: 0 },
      { title: 'فاصله میان محرک و پاسخ', time: 320 },
      { title: 'مهار نشخوار ذهنی درباره آینده', time: 680 },
      { title: 'جمع‌بندی و تمرین تمرکز', time: 900 }
    ]
  }
];
