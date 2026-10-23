export type BreathPhaseType = 'inhale' | 'inhale2' | 'hold' | 'exhale' | 'hold-empty';

export interface BreathPhase {
  name: string;
  duration: number; // in seconds
  type: BreathPhaseType;
  cue: string;
}

export interface BreathingTechnique {
  id: string;
  name: string;
  persianSubtitle: string;
  category: 'calm' | 'focus' | 'sleep' | 'emergency';
  summary: string;
  mechanism: string;
  evidenceLevel: 'قوی' | 'متوسط' | 'اولیه';
  referenceId: string;
  safetyWarning: string;
  defaultCycles: number;
  phases: BreathPhase[];
  animationStyle: 'box' | 'circle' | 'sine' | 'sigh' | 'diaphragm' | 'alternate' | 'flow';
  bpm?: number;
}

export const BREATHING_TECHNIQUES: BreathingTechnique[] = [
  {
    id: 'box-breathing',
    name: 'تنفس مربعی (جعبه‌ای)',
    persianSubtitle: 'توازن ۴-۴-۴-۴ برای تنظیم فشار روانی',
    category: 'focus',
    summary: 'چهار فاز برابر دم، حبس، بازدم و حبس خالی. مورد استفاده در آموزش‌های مدیریت استرس و تمرکز بالا.',
    mechanism: 'ریتم متقارن باعث تعادل میان سیستم عصبی سمپاتیک و پاراسمپاتیک شده و فعالیت لوب پیش‌پیشانی را تثبیت می‌کند.',
    evidenceLevel: 'قوی',
    referenceId: 'jerath2006',
    safetyWarning: 'در صورت احساس سرگیجه یا تنگی نفس در فازهای حبس، فوراً به ریتم طبیعی نفس برگردید.',
    defaultCycles: 6,
    phases: [
      { name: 'دم عمیق', duration: 4, type: 'inhale', cue: 'از بینی به آرامی دم بکشید' },
      { name: 'نگه‌داشتن', duration: 4, type: 'hold', cue: 'هوا را در ریه‌ها نگه دارید' },
      { name: 'بازدم آرام', duration: 4, type: 'exhale', cue: 'آرام و پیوسته تخلیه کنید' },
      { name: 'مکث در خالی', duration: 4, type: 'hold-empty', cue: 'در حالت سکون بمانید' },
    ],
    animationStyle: 'box'
  },
  {
    id: '4-7-8',
    name: 'تنفس ۴-۷-۸',
    persianSubtitle: 'آرام‌بخش طبیعی سیستم عصبی و تسریع خواب',
    category: 'sleep',
    summary: 'دم کوتاه، حبس طولانی و بازدم دوبرابر. مناسب قبل از خواب یا کاهش اضطراب ناگهانی.',
    mechanism: 'حبس طولانی تبادل اکسیژن و دی‌اکسیدکربن را بهینه‌تر کرده و بازدم طولانی با فعال‌سازی گیرنده‌های فشاری قفسه سینه عصب واگ را بیدار می‌کند.',
    evidenceLevel: 'متوسط',
    referenceId: 'jerath2006',
    safetyWarning: 'برای مبتلایان به آسم یا مشکلات قلبی، حبس ۷ ثانیه‌ای می‌تواند به ۳ یا ۴ ثانیه کاهش یابد.',
    defaultCycles: 5,
    phases: [
      { name: 'دم ملایم', duration: 4, type: 'inhale', cue: 'دم بدون فشار از راه بینی' },
      { name: 'حبس آرامش', duration: 7, type: 'hold', cue: 'حفظ آرامش قفسه سینه' },
      { name: 'بازدم کامل', duration: 8, type: 'exhale', cue: 'تخلیه پیوسته و بدون شتاب' },
    ],
    animationStyle: 'circle'
  },
  {
    id: 'physiological-sigh',
    name: 'آه فیزیولوژیک (Physiological Sigh)',
    persianSubtitle: 'سریع‌ترین متوقف‌کننده پاسخ استرس حاد',
    category: 'emergency',
    summary: 'دو دم پیاپی (یک دم عمیق + یک دم کوتاه تکمیلی) به همراه یک بازدم طولانی و رهاکننده.',
    mechanism: 'دم دوم حبابچه‌های فروافتاده ریه (آلوئول‌ها) را باز می‌کند و بازدم طولانی دی‌اکسیدکربن را خارج و ضربان قلب را بی‌درنگ آرام می‌سازد (تحقیق استنفورد).',
    evidenceLevel: 'قوی',
    referenceId: 'balban2023',
    safetyWarning: 'اگر احساس سبکی سر کردید، دم دوم را ملایم‌تر اجرا کنید.',
    defaultCycles: 5,
    phases: [
      { name: 'دم اول', duration: 2.5, type: 'inhale', cue: 'دم عمیق از بینی' },
      { name: 'دم دوم (تکمیلی)', duration: 1.5, type: 'inhale2', cue: 'یک جرعه هوای دیگر بدون بازدم' },
      { name: 'بازدم کامل و طولانی', duration: 6, type: 'exhale', cue: 'بازدم رهاکننده و آهسته از دهان' },
    ],
    animationStyle: 'sigh'
  },
  {
    id: 'coherent-breathing',
    name: 'تنفس همدوس (رزونانس)',
    persianSubtitle: '۵.۵ تنفس در دقیقه برای اوج تنوع ضربان قلب (HRV)',
    category: 'calm',
    summary: 'تنفس با فرکانس رزونانس فیزیولوژیک (~۰.۱ هرتز). دم و بازدم نرم و بدون مکث ۵.۵ ثانیه‌ای.',
    mechanism: 'ایجاد حداکثر همگامی میان آریتمی سینوسی تنفسی (RSA)، فشار خون و فعالیت قشر پیش‌پیشانی برای تاب‌آوری بلندمدت.',
    evidenceLevel: 'قوی',
    referenceId: 'lehrer2020',
    safetyWarning: 'نفس‌ها باید کاملاً سیال و بدون قفل کردن گلو باشد.',
    defaultCycles: 10,
    bpm: 5.5,
    phases: [
      { name: 'دم نرم', duration: 5.5, type: 'inhale', cue: 'جریان آرام هوا به درون ریه‌ها' },
      { name: 'بازدم نرم', duration: 5.5, type: 'exhale', cue: 'جریان ملایم و پیوسته به بیرون' },
    ],
    animationStyle: 'sine'
  },
  {
    id: 'diaphragmatic',
    name: 'تنفس شکمی (دیافراگمی)',
    persianSubtitle: 'بازگشت به الگوی طبیعی تنفس نوزادی',
    category: 'calm',
    summary: 'هدایت حرکت تنفس به ناحیه ناف به جای سینه، مناسب برای رهایی از تنش‌های شانه و گردن.',
    mechanism: 'حرکت رو به پایین دیافراگم اندام‌های احشایی را ماساژ داده و گیرنده‌های مکانیکی کف لگن و شکم را برای ترشح استیل‌کولین تحریک می‌کند.',
    evidenceLevel: 'قوی',
    referenceId: 'porges2011',
    safetyWarning: 'دست خود را روی شکم بگذارید، نباید شانه‌ها به سمت بالا حرکت کنند.',
    defaultCycles: 8,
    phases: [
      { name: 'دم و برآمدن شکم', duration: 4, type: 'inhale', cue: 'شکم مانند بالن ملایم باد می‌شود' },
      { name: 'مکث کوتاه', duration: 2, type: 'hold', cue: 'آرامش در اوج انبساط' },
      { name: 'بازدم و فرونشست', duration: 6, type: 'exhale', cue: 'ناف به سمت ستون فقرات بازمی‌گردد' },
    ],
    animationStyle: 'diaphragm'
  },
  {
    id: 'nadi-shodhana',
    name: 'تنفس متناوب بینی (نادی شودانا)',
    persianSubtitle: 'تعادل دو نیمکره مغز و آرامش عمیق ذهنی',
    category: 'focus',
    summary: 'تنفس متناوب از سوراخ چپ و راست بینی برای هماهنگی ریتم الترانزیت بینی و سیستم عصبی.',
    mechanism: 'تغییر جریان هوا در مخاط بینی به طور رفلکسی بر فعالیت همیسفرهای مغز و تعادل سمپاتیک-پاراسمپاتیک اثر می‌گذارد.',
    evidenceLevel: 'متوسط',
    referenceId: 'jerath2006',
    safetyWarning: 'در صورت گرفتگی شدید بینی از اجبار خودداری کنید.',
    defaultCycles: 6,
    phases: [
      { name: 'دم از سمت چپ', duration: 4, type: 'inhale', cue: 'سمت راست را بگیرید و از چپ دم بکشید' },
      { name: 'حبس و تعویض', duration: 4, type: 'hold', cue: 'هر دو سمت را بگیرید' },
      { name: 'بازدم از سمت راست', duration: 4, type: 'exhale', cue: 'سمت راست را رها کرده و بازدم دهید' },
      { name: 'دم از سمت راست', duration: 4, type: 'inhale', cue: 'مجدداً از راست دم بکشید' },
      { name: 'حبس و تعویض', duration: 4, type: 'hold', cue: 'هر دو سمت را نگه دارید' },
      { name: 'بازدم از سمت چپ', duration: 4, type: 'exhale', cue: 'سمت چپ را رها کرده و بازدم دهید' },
    ],
    animationStyle: 'alternate'
  },
  {
    id: 'long-exhale-sleep',
    name: 'بازدم طولانی ۴-۶ (پیش از خواب)',
    persianSubtitle: 'فرمان خاموشی به سیستم بیداری مغز',
    category: 'sleep',
    summary: 'دم ۴ ثانیه‌ای و بازدم ۶ ثانیه‌ای بدون حبس. تنفس کشویی و سبک برای ورود به فاز خواب عمیق.',
    mechanism: 'هر بار که بازدم طولانی‌تر از دم می‌شود، شاخه واگ ضربان قلب را کندتر کرده و فشار سیستولیک افت ملایمی می‌کند.',
    evidenceLevel: 'قوی',
    referenceId: 'walker2017',
    safetyWarning: 'بدون هیچ فشاری بر عضلات سینه انجام دهید؛ بگذارید بازدم خودبه‌خود جاری شود.',
    defaultCycles: 8,
    phases: [
      { name: 'دم نرم', duration: 4, type: 'inhale', cue: 'دم سبک و بی‌صدا' },
      { name: 'بازدم طولانی', duration: 6, type: 'exhale', cue: 'آهسته هوا را به بیرون جاری کنید' },
    ],
    animationStyle: 'flow'
  },
  {
    id: 'focus-4-4',
    name: 'تنفس تمرکز ۴-۴',
    persianSubtitle: 'ریتم هوشیار و روشن برای آغاز کار و مطالعه',
    category: 'focus',
    summary: 'دم ۴ ثانیه و بازدم ۴ ثانیه، ریتم مستقیم و فعال‌کننده جریان خون مغزی بدون ایجاد رخوت.',
    mechanism: 'تثبیت سطح دی‌اکسید کربن در محدوده نرمال فیزیولوژیک جهت حداکثر رسانش اکسیژن به سلول‌های مغز (اثر بور).',
    evidenceLevel: 'قوی',
    referenceId: 'zeidan2010',
    safetyWarning: 'تنفس یکنواخت و پیوسته بماند.',
    defaultCycles: 10,
    phases: [
      { name: 'دم هوشیار', duration: 4, type: 'inhale', cue: 'دم متمرکز و راست‌قامت' },
      { name: 'بازدم رها', duration: 4, type: 'exhale', cue: 'تخلیه با حفظ هوشیاری' },
    ],
    animationStyle: 'box'
  }
];
