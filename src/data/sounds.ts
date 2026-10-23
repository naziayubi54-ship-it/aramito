export type SoundCategory = 'nature' | 'water' | 'noise' | 'focus';

export interface SoundChannel {
  id: string;
  name: string;
  category: SoundCategory;
  icon: string; // lucide icon identifier
  defaultVolume: number;
  proceduralType: 'rain' | 'thunder' | 'forest' | 'birds' | 'fire' | 'waves' | 'river' | 'wind' | 'crickets' | 'cafe' | 'white-noise' | 'pink-noise' | 'brown-noise' | 'binaural';
  binauralFreq?: number; // base freq
  binauralBeat?: number; // difference (e.g. 6Hz for Theta)
  requiresHeadphones?: boolean;
}

export interface SoundPreset {
  id: string;
  name: string;
  description: string;
  channels: { soundId: string; volume: number }[];
}

export const SOUND_CHANNELS: SoundChannel[] = [
  { id: 'rain', name: 'باران ملایم', category: 'water', icon: 'CloudRain', defaultVolume: 0.6, proceduralType: 'rain' },
  { id: 'thunder', name: 'رعد دوردست', category: 'nature', icon: 'CloudLightning', defaultVolume: 0.35, proceduralType: 'thunder' },
  { id: 'waves', name: 'موج دریا', category: 'water', icon: 'Waves', defaultVolume: 0.5, proceduralType: 'waves' },
  { id: 'river', name: 'رودخانه کوهستانی', category: 'water', icon: 'Droplets', defaultVolume: 0.45, proceduralType: 'river' },
  { id: 'wind', name: 'نسیم و باد', category: 'nature', icon: 'Wind', defaultVolume: 0.4, proceduralType: 'wind' },
  { id: 'fire', name: 'هیزم آتش و شومینه', category: 'nature', icon: 'Flame', defaultVolume: 0.55, proceduralType: 'fire' },
  { id: 'forest', name: 'جنگل انبوه', category: 'nature', icon: 'Trees', defaultVolume: 0.5, proceduralType: 'forest' },
  { id: 'birds', name: 'آواز پرندگان', category: 'nature', icon: 'Bird', defaultVolume: 0.3, proceduralType: 'birds' },
  { id: 'crickets', name: 'جیرجیرک شب', category: 'nature', icon: 'Moon', defaultVolume: 0.35, proceduralType: 'crickets' },
  { id: 'cafe', name: 'زمزمه کافه', category: 'focus', icon: 'Coffee', defaultVolume: 0.25, proceduralType: 'cafe' },
  { id: 'white_noise', name: 'نویز سفید', category: 'noise', icon: 'Activity', defaultVolume: 0.3, proceduralType: 'white-noise' },
  { id: 'pink_noise', name: 'نویز صورتی (متوازن)', category: 'noise', icon: 'Sliders', defaultVolume: 0.4, proceduralType: 'pink-noise' },
  { id: 'brown_noise', name: 'نویز قهوه‌ای (عمیق)', category: 'noise', icon: 'Compass', defaultVolume: 0.5, proceduralType: 'brown-noise' },
  {
    id: 'binaural_theta',
    name: 'امواج باینورال تتا (۶ هرتز)',
    category: 'focus',
    icon: 'Headphones',
    defaultVolume: 0.4,
    proceduralType: 'binaural',
    binauralFreq: 196,
    binauralBeat: 6,
    requiresHeadphones: true
  },
  {
    id: 'binaural_alpha',
    name: 'امواج باینورال آلفا (۱۰ هرتز)',
    category: 'focus',
    icon: 'Radio',
    defaultVolume: 0.4,
    proceduralType: 'binaural',
    binauralFreq: 220,
    binauralBeat: 10,
    requiresHeadphones: true
  }
];

export const PRESET_MIXES: SoundPreset[] = [
  {
    id: 'rainy_fireplace',
    name: 'شب بارانی کنار شومینه',
    description: 'ترکیب حس آرامش‌بخش سوختن چوب و باران پشت پنجره',
    channels: [
      { soundId: 'rain', volume: 0.65 },
      { soundId: 'fire', volume: 0.55 },
      { soundId: 'thunder', volume: 0.25 }
    ]
  },
  {
    id: 'morning_forest',
    name: 'جنگل صبحگاهی',
    description: 'شروع پرانرژی و سرزنده با نغمه پرندگان و رودخانه جاری',
    channels: [
      { soundId: 'birds', volume: 0.45 },
      { soundId: 'forest', volume: 0.5 },
      { soundId: 'river', volume: 0.35 }
    ]
  },
  {
    id: 'deep_focus',
    name: 'تمرکز عمیق و کار',
    description: 'کاهش حواس‌پرتی‌های محیطی با تلفیق نویز صورتی و امواج آلفا',
    channels: [
      { soundId: 'pink_noise', volume: 0.5 },
      { soundId: 'binaural_alpha', volume: 0.35 },
      { soundId: 'cafe', volume: 0.15 }
    ]
  },
  {
    id: 'ocean_sunset',
    name: 'ساحل هنگام غروب',
    description: 'امواج ریتمیک دریا و نسیم ملایم ساحلی',
    channels: [
      { soundId: 'waves', volume: 0.7 },
      { soundId: 'wind', volume: 0.3 }
    ]
  },
  {
    id: 'deep_sleep',
    name: 'خواب عمیق شبانه',
    description: 'نویز قهوه‌ای سنگین همراه با جیرجیرک و نسیم شب',
    channels: [
      { soundId: 'brown_noise', volume: 0.55 },
      { soundId: 'crickets', volume: 0.3 },
      { soundId: 'wind', volume: 0.25 }
    ]
  }
];
