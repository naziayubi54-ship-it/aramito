import { Preferences } from '@capacitor/preferences';

export interface MoodEntry {
  id: string;
  date: string; // ISO date
  jalaliDate: string;
  moodIndex: number; // 0: عالی, 1: خوب, 2: آرام, 3: خسته, 4: مضطرب
  note?: string;
  tags?: string[];
}

export interface UserStats {
  meditationMinutes: number;
  breathingMinutes: number;
  totalMinutes: number;
  breathingSessions: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalSessions: number;
  moods: MoodEntry[];
}

export interface NotificationSettings {
  dailyQuoteEnabled: boolean;
  dailyQuoteTime: string; // HH:mm
  sleepReminderEnabled: boolean;
  sleepReminderTime: string; // HH:mm
  wakeReminderEnabled: boolean;
  wakeReminderTime: string; // HH:mm
  meditationReminderEnabled: boolean;
  meditationReminderTime: string; // HH:mm
  meditationDays: number[]; // 0: Sat, 1: Sun ... 6: Fri
  breathReminderEnabled: boolean;
  breathReminderTime: string; // HH:mm
  moodCheckEnabled: boolean;
  moodCheckTime: string; // HH:mm
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  font: 'vazirmatn';
  hapticsEnabled: boolean;
  onboardingCompleted: boolean;
  primaryGoal: 'sleep' | 'stress' | 'focus' | 'anxiety';
}

const DEFAULT_STATS: UserStats = {
  meditationMinutes: 0,
  breathingMinutes: 0,
  totalMinutes: 0,
  breathingSessions: 0,
  streakDays: 0,
  lastActiveDate: '',
  totalSessions: 0,
  moods: []
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  font: 'vazirmatn',
  hapticsEnabled: true,
  onboardingCompleted: false,
  primaryGoal: 'stress'
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  dailyQuoteEnabled: true,
  dailyQuoteTime: '08:30',
  sleepReminderEnabled: true,
  sleepReminderTime: '22:30',
  wakeReminderEnabled: false,
  wakeReminderTime: '07:00',
  meditationReminderEnabled: true,
  meditationReminderTime: '20:00',
  meditationDays: [0, 1, 2, 3, 4, 5, 6],
  breathReminderEnabled: true,
  breathReminderTime: '14:30',
  moodCheckEnabled: true,
  moodCheckTime: '21:00'
};

class StorageService {
  private async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const res = await Preferences.get({ key });
      if (res.value !== null) {
        return JSON.parse(res.value) as T;
      }
    } catch {
      // Fallback to localStorage
      try {
        const item = localStorage.getItem(key);
        if (item !== null) return JSON.parse(item) as T;
      } catch {}
    }
    return defaultValue;
  }

  private async set<T>(key: string, value: T): Promise<void> {
    const stringVal = JSON.stringify(value);
    try {
      await Preferences.set({ key, value: stringVal });
    } catch {}
    try {
      localStorage.setItem(key, stringVal);
    } catch {}
  }

  async getSettings(): Promise<AppSettings> {
    return this.get<AppSettings>('aramito_settings', DEFAULT_SETTINGS);
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.set('aramito_settings', settings);
  }

  async getStats(): Promise<UserStats> {
    const stored = await this.get<Partial<UserStats>>('aramito_stats', DEFAULT_STATS);
    // Older builds shipped demo metrics. Remove that exact seed so a fresh
    // install never presents activity the user did not perform.
    const isDemoSeed = stored.meditationMinutes === 38
      && stored.breathingSessions === 9
      && stored.streakDays === 4
      && stored.totalSessions === 13;
    const stats: UserStats = isDemoSeed ? { ...DEFAULT_STATS } : {
      ...DEFAULT_STATS,
      ...stored,
      moods: Array.isArray(stored.moods) ? stored.moods : []
    };
    stats.totalMinutes = Number.isFinite(stats.totalMinutes)
      ? stats.totalMinutes
      : (stats.meditationMinutes || 0) + (stats.breathingMinutes || 0);
    return stats;
  }

  async saveStats(stats: UserStats): Promise<void> {
    await this.set('aramito_stats', stats);
  }

  async recordSession(type: 'meditation' | 'breathing', durationSeconds: number): Promise<UserStats> {
    const stats = await this.getStats();
    const today = new Date().toISOString().split('T')[0];

    if (type === 'meditation') {
      stats.meditationMinutes += Math.round(durationSeconds / 60);
    } else {
      stats.breathingMinutes += Math.round(durationSeconds / 60);
      stats.breathingSessions += 1;
    }
    stats.totalMinutes += Math.round(durationSeconds / 60);
    stats.totalSessions += 1;

    // Streak logic
    if (!stats.lastActiveDate) {
      stats.streakDays = 1;
      stats.lastActiveDate = today;
    } else if (stats.lastActiveDate !== today) {
      const last = new Date(stats.lastActiveDate);
      const now = new Date(today);
      const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        stats.streakDays += 1;
      } else if (diffDays > 1) {
        stats.streakDays = 1;
      }
      stats.lastActiveDate = today;
    }

    await this.saveStats(stats);
    return stats;
  }

  async addMood(moodIndex: number, note?: string): Promise<MoodEntry> {
    const stats = await this.getStats();
    const entry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      jalaliDate: new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date()),
      moodIndex,
      note
    };
    stats.moods = [entry, ...stats.moods.slice(0, 29)]; // keep 30 days
    await this.saveStats(stats);
    return entry;
  }

  async getNotifications(): Promise<NotificationSettings> {
    return this.get<NotificationSettings>('aramito_notifications', DEFAULT_NOTIFICATIONS);
  }

  async saveNotifications(notifs: NotificationSettings): Promise<void> {
    await this.set('aramito_notifications', notifs);
  }

  async getSavedBooks(): Promise<string[]> {
    return this.get<string[]>('aramito_saved_books', []);
  }

  async toggleSavedBook(bookId: string): Promise<boolean> {
    const list = await this.getSavedBooks();
    const exists = list.includes(bookId);
    const updated = exists ? list.filter((id) => id !== bookId) : [...list, bookId];
    await this.set('aramito_saved_books', updated);
    return !exists;
  }

  async getBookProgress(bookId: string): Promise<{ chapterIndex: number; progressPercent: number }> {
    const all = await this.get<Record<string, { chapterIndex: number; progressPercent: number }>>('aramito_book_progress', {});
    return all[bookId] || { chapterIndex: 0, progressPercent: 0 };
  }

  async saveBookProgress(bookId: string, chapterIndex: number, progressPercent: number): Promise<void> {
    const all = await this.get<Record<string, { chapterIndex: number; progressPercent: number }>>('aramito_book_progress', {});
    all[bookId] = { chapterIndex, progressPercent };
    await this.set('aramito_book_progress', all);
  }

  async exportAllData(): Promise<string> {
    const settings = await this.getSettings();
    const stats = await this.getStats();
    const notifications = await this.getNotifications();
    const savedBooks = await this.getSavedBooks();
    return JSON.stringify({ settings, stats, notifications, savedBooks, exportDate: new Date().toISOString() }, null, 2);
  }

  async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) await this.saveSettings(data.settings);
      if (data.stats) await this.saveStats(data.stats);
      if (data.notifications) await this.saveNotifications(data.notifications);
      if (data.savedBooks) await this.set('aramito_saved_books', data.savedBooks);
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new StorageService();
