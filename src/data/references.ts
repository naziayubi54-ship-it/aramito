export interface ScientificReference {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi?: string;
  summaryFa: string;
}

export const SCIENTIFIC_REFERENCES: Record<string, ScientificReference> = {
  balban2023: {
    id: 'balban2023',
    title: 'Brief structured respiration practices enhance mood and reduce physiological arousal',
    authors: 'Balban, M. Y., Neri, E., Kogon, M. M., Weed, L., Nouriani, B., Jo, B., Holl, G., Zeitzer, J. M., Spiegel, D., & Huberman, A. D.',
    journal: 'Cell Reports Medicine, 4(1), 100895',
    year: 2023,
    doi: '10.1016/j.xcrm.2022.100895',
    summaryFa: 'مقایسه ۵ دقیقه تنفس فیزیولوژیک روزانه با مدیتیشن ذهن‌آگاهی؛ نشان داد «آه فیزیولوژیک» سریع‌ترین کاهش برانگیختگی خودمختار، کاهش ضربان قلب و بهبود خلق را ایجاد می‌کند.'
  },
  lehrer2020: {
    id: 'lehrer2020',
    title: 'Heart rate variability biofeedback: How and why does it work?',
    authors: 'Lehrer, P., Kaur, K., Sharma, A., Shah, K., Huseby, R., Bhavsar, J., & Zhang, Y.',
    journal: 'Frontiers in Public Health, 8, 241',
    year: 2020,
    doi: '10.3389/fpubh.2020.00241',
    summaryFa: 'تنفس در فرکانس رزونانس (حدود ۵.۵ الی ۶ تنفس در دقیقه) بیشترین همبستگی میان ریتم قلبی و تنفس (RSA) و بیشترین تحریک عصب واگ را پدید می‌آورد.'
  },
  porges2011: {
    id: 'porges2011',
    title: 'The Polyvagal Theory: Neurophysiological Foundations of Emotions, Attachment, Communication, and Self-regulation',
    authors: 'Porges, S. W.',
    journal: 'W. W. Norton & Company',
    year: 2011,
    summaryFa: 'نظریه پلی‌واگال نشان می‌دهد چگونه عصب واگ شکمی (Ventral Vagus) سیستم آرامش و ارتباط اجتماعی را فعال کرده و بر پاسخ جنگ یا گریز غلبه می‌کند.'
  },
  kabatzinn1990: {
    id: 'kabatzinn1990',
    title: 'Full Catastrophe Living: Using the Wisdom of Your Body and Mind to Face Stress, Pain, and Illness',
    authors: 'Kabat-Zinn, J.',
    journal: 'Delacorte Press',
    year: 1990,
    summaryFa: 'بنیان‌گذاری پروتکل کاهش استرس مبتنی بر ذهن‌آگاهی (MBSR) و اثربخشی بالینی آن بر کاهش کورتیزول و درد مزمن.'
  },
  walker2017: {
    id: 'walker2017',
    title: 'Why We Sleep: Unlocking the Power of Sleep and Dreams',
    authors: 'Walker, M.',
    journal: 'Scribner',
    year: 2017,
    summaryFa: 'نقش امواج آهسته مغزی، سیستم گلیمفاتیک و تثبیت حافظه در طول خواب، به همراه شواهد تأثیر تکنیک‌های ریلکسیشن بر تأخیر شروع خواب.'
  },
  zeidan2010: {
    id: 'zeidan2010',
    title: 'Mindfulness meditation improves cognition: Evidence of brief mental training',
    authors: 'Zeidan, F., Johnson, S. K., Diamond, B. J., David, Z., & Goolkasian, P.',
    journal: 'Consciousness and Cognition, 19(2), 597-605',
    year: 2010,
    summaryFa: 'حتی جلسات کوتاه ۴ روزه (۲۰ دقیقه در روز) ذهن‌آگاهی توانست توجه مداوم و حافظه کاری فعال را به میزان قابل توجهی ارتقا بخشد.'
  },
  jerath2006: {
    id: 'jerath2006',
    title: 'Physiology of long pranayamic breathing: Neural respiratory elements may provide a mechanism that explains how it affects autonomic nervous system',
    authors: 'Jerath, R., Edry, J. W., Barnes, V. A., & Jerath, V.',
    journal: 'Medical Hypotheses, 67(3), 566-571',
    year: 2006,
    summaryFa: 'کشش آهسته بافت ریه گیرنده‌های مکانیکی را فعال کرده که از طریق عصب واگ بازخورد مهاری به مرکز قلبی‌عروقی ساقه مغز ارسال می‌کنند.'
  }
};

export const MEDICAL_DISCLAIMER_FA = '«آرامیتو» یک ابزار خودمراقبتی و بهزیستی است و به‌هیچ‌عنوان جایگزین درمان پزشکی، روان‌پزشکی یا روان‌درمانی نیست. در صورت ابتلا به اختلالات حاد قلبی، ریوی یا روان‌شناختی، با پزشک متخصص خود مشورت فرمایید.';
