import { LocalNotifications } from '@capacitor/local-notifications';
import { getRandomQuote } from '../data/quotes';
import { NotificationSettings } from './storage';

export interface ToastMessage {
  id: string;
  title: string;
  body: string;
  type?: 'quote' | 'reminder' | 'system';
  targetTab?: 'home' | 'breathe' | 'sounds' | 'meditate' | 'library' | 'profile';
}

type ToastListener = (toast: ToastMessage) => void;

class NotificationService {
  private listeners: Set<ToastListener> = new Set();

  addListener(fn: ToastListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  showToast(title: string, body: string, targetTab?: ToastMessage['targetTab']) {
    const toast: ToastMessage = {
      id: Date.now().toString(),
      title,
      body,
      targetTab
    };
    this.listeners.forEach((fn) => fn(toast));
  }

  async requestPermission(): Promise<boolean> {
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const result = await Notification.requestPermission();
        return result === 'granted';
      }
      return false;
    }
  }

  async checkPermission(): Promise<boolean> {
    try {
      const status = await LocalNotifications.checkPermissions();
      return status.display === 'granted';
    } catch {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        return Notification.permission === 'granted';
      }
      return false;
    }
  }

  async sendTestNotification(type: 'quote' | 'breathe' | 'sleep' | 'meditation'): Promise<void> {
    const quote = getRandomQuote();
    let title = 'آرامیتو';
    let body = quote.text;
    let targetTab: ToastMessage['targetTab'] = 'home';

    if (type === 'quote') {
      title = 'جملهٔ آرامش‌بخش روز';
      body = `«${quote.text}» — ${quote.author}`;
      targetTab = 'home';
    } else if (type === 'breathe') {
      title = 'یک دقیقه آرامش';
      body = 'چند نفس عمیق بکشید و تنش‌های روزمره را رها کنید.';
      targetTab = 'breathe';
    } else if (type === 'sleep') {
      title = 'آمادگی برای خواب آرام';
      body = '۳۰ دقیقه تا زمان خواب مانده؛ نورهای تند را خاموش و به ذهنتان استراحت دهید.';
      targetTab = 'sounds';
    } else if (type === 'meditation') {
      title = 'وقت ذهن‌آگاهی شبانه';
      body = 'جلسه ۱۰ دقیقه‌ای ذهن‌آگاهی تنفس در انتظار شماست.';
      targetTab = 'meditate';
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 100000),
            title,
            body,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'beep.wav',
            extra: { targetTab }
          }
        ]
      });
    } catch {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, { body, icon: '/icon.png' });
        } catch {}
      }
    }

    // Also trigger in-app toast for instant visual confirmation in browser / webview
    this.showToast(title, body, targetTab);
  }

  async syncSchedules(settings: NotificationSettings): Promise<void> {
    try {
      // Clear pending
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }

      const notifsToSchedule = [];

      if (settings.dailyQuoteEnabled && settings.dailyQuoteTime) {
        const [h, m] = settings.dailyQuoteTime.split(':').map(Number);
        const quote = getRandomQuote();
        notifsToSchedule.push({
          id: 101,
          title: 'پیام صبحگاهی آرامیتو',
          body: `«${quote.text}»`,
          schedule: { on: { hour: h, minute: m }, repeats: true },
          extra: { targetTab: 'home' }
        });
      }

      if (settings.breathReminderEnabled && settings.breathReminderTime) {
        const [h, m] = settings.breathReminderTime.split(':').map(Number);
        notifsToSchedule.push({
          id: 102,
          title: 'لحظه تنفس آگاهانه',
          body: 'چند دقیقه توقف کنید و با چند دم عمیق انرژی تازه‌ای بگیرید.',
          schedule: { on: { hour: h, minute: m }, repeats: true },
          extra: { targetTab: 'breathe' }
        });
      }

      if (settings.sleepReminderEnabled && settings.sleepReminderTime) {
        const [h, m] = settings.sleepReminderTime.split(':').map(Number);
        notifsToSchedule.push({
          id: 103,
          title: 'زمان آماده شدن برای خواب',
          body: 'صفحه نمایش‌ها را کم‌نور کنید و با یک تکنیک تنفسی به پیشواز خواب بروید.',
          schedule: { on: { hour: h, minute: m }, repeats: true },
          extra: { targetTab: 'sounds' }
        });
      }

      if (notifsToSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: notifsToSchedule });
      }
    } catch (e) {
      console.log('[Aramito Notifications] Schedule sync info:', e);
    }
  }
}

export const notifications = new NotificationService();
