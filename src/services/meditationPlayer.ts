import { MEDITATION_TRACKS, MeditationTrack, getMeditationAudioUrl, getMeditationTrack, getMeditationTrackIndex } from '../data/meditationTracks';
import { audioEngine } from './audioEngine';

export type RepeatMode = 'off' | 'one' | 'all';

export interface MeditationPlayerState {
  trackId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  /** فایل صوتی هنوز در پوشه قرار داده نشده است */
  isMissing: boolean;
  error: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  rate: number;
  repeat: RepeatMode;
  /** ثانیه‌های باقی‌مانده تایمر خواب؛ ۰ یعنی غیرفعال */
  sleepRemaining: number;
  /** مدت اولیه‌ای که کاربر برای تایمر انتخاب کرده (دقیقه) */
  sleepTotal: number;
  sleepFading: boolean;
}

type Listener = () => void;

const SLEEP_FADE_SECONDS = 8;

class MeditationPlayerService {
  private audio: HTMLAudioElement | null = null;
  private trackId: string | null = null;
  private listeners = new Set<Listener>();

  private isLoading = false;
  private isMissing = false;
  private error: string | null = null;

  private volume = 0.9;
  private rate = 1;
  private repeat: RepeatMode = 'off';

  private sleepDeadline: number | null = null;
  private sleepTotal = 0;
  private sleepTimer: number | null = null;
  private sleepFading = false;
  private fadeTimer: number | null = null;

  public subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  private ensureAudio(): HTMLAudioElement {
    if (this.audio) return this.audio;

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = this.volume;

    audio.addEventListener('loadedmetadata', () => {
      this.isLoading = false;
      this.isMissing = false;
      this.notify();
      this.syncMediaSession();
    });
    audio.addEventListener('canplay', () => {
      this.isLoading = false;
      this.notify();
    });
    audio.addEventListener('playing', () => {
      this.isLoading = false;
      this.notify();
      this.startTicker();
    });
    audio.addEventListener('pause', () => {
      this.notify();
      this.stopTicker();
    });
    audio.addEventListener('timeupdate', () => this.notify());
    audio.addEventListener('ended', () => this.handleEnded());
    audio.addEventListener('error', () => {
      if (!audio.src) return;
      this.isLoading = false;
      try {
        audio.pause();
      } catch {
        /* ignore */
      }
      this.isMissing = true;
      this.error = 'فایل صوتی این مدیتیشن هنوز اضافه نشده است.';
      this.notify();
      this.stopTicker();
    });

    this.audio = audio;
    return audio;
  }

  private handleEnded() {
    if (this.repeat === 'one' && this.audio) {
      this.audio.currentTime = 0;
      void this.audio.play().catch(() => {});
      return;
    }
    if (this.repeat === 'all') {
      this.playNext();
      return;
    }
    if (this.audio) this.audio.currentTime = 0;
    this.notify();
    this.stopTicker();
  }

  // --- Playback ---

  public async playTrack(id: string): Promise<void> {
    const track = getMeditationTrack(id);
    if (!track) return;

    const audio = this.ensureAudio();
    const isSameTrack = this.trackId === id && !!audio.src;

    if (!isSameTrack) {
      // جلوگیری از پخش هم‌زمان با میکسر طبیعت
      audioEngine.stopAllChannels();
      this.trackId = id;
      this.isMissing = false;
      this.error = null;
      this.isLoading = true;
      audio.src = getMeditationAudioUrl(track);
      this.notify();
      this.syncMediaSession();
    }

    audio.volume = this.volume;
    audio.playbackRate = this.rate;

    try {
      await audio.play();
      this.notify();
    } catch (e) {
      const err = e as DOMException;
      // AbortError یعنی کاربر خودش پخش را متوقف کرده است
      if (err?.name !== 'AbortError') {
        this.isLoading = false;
        this.error = 'پخش این فایل ممکن است در مرورگر مسدود شده باشد. یک بار دیگر بزنید.';
        this.notify();
      }
    }
  }

  public async toggle(): Promise<void> {
    if (!this.trackId) return;
    const audio = this.ensureAudio();
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        /* ignore */
      }
    } else {
      audio.pause();
    }
    this.notify();
  }

  public async play(): Promise<void> {
    if (!this.trackId) return;
    const audio = this.ensureAudio();
    try {
      await audio.play();
    } catch {
      /* ignore */
    }
    this.notify();
  }

  public pause() {
    this.audio?.pause();
    this.notify();
  }

  public async playNext(): Promise<void> {
    const index = getMeditationTrackIndex(this.trackId);
    if (index < 0) return;
    const next = MEDITATION_TRACKS[(index + 1) % MEDITATION_TRACKS.length];
    await this.playTrack(next.id);
  }

  public async playPrevious(): Promise<void> {
    const audio = this.audio;
    // اگر بیش از ۳ ثانیه گذشته باشد، به ابتدای همین ترک برگرد
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      this.notify();
      return;
    }
    const index = getMeditationTrackIndex(this.trackId);
    if (index < 0) return;
    const prev = MEDITATION_TRACKS[(index - 1 + MEDITATION_TRACKS.length) % MEDITATION_TRACKS.length];
    await this.playTrack(prev.id);
  }

  public seek(seconds: number) {
    const audio = this.audio;
    if (!audio) return;
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    if (!duration) return;
    audio.currentTime = Math.min(Math.max(seconds, 0), duration);
    this.notify();
  }

  public skip(deltaSeconds: number) {
    const audio = this.audio;
    if (!audio) return;
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    audio.currentTime = Math.min(Math.max(audio.currentTime + deltaSeconds, 0), duration || Infinity);
    this.notify();
  }

  public stop() {
    const audio = this.audio;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    this.clearSleepTimer();
    this.notify();
  }

  public setVolume(value: number) {
    this.volume = Math.min(Math.max(value, 0), 1);
    if (this.audio) this.audio.volume = this.volume;
    this.notify();
  }

  public setRate(value: number) {
    this.rate = value;
    if (this.audio) this.audio.playbackRate = value;
    this.notify();
  }

  public setRepeat(mode: RepeatMode) {
    this.repeat = mode;
    this.notify();
  }

  public cycleRepeat() {
    const order: RepeatMode[] = ['off', 'all', 'one'];
    this.repeat = order[(order.indexOf(this.repeat) + 1) % order.length];
    this.notify();
  }

  public reloadCurrent() {
    const track = getMeditationTrack(this.trackId);
    if (!track) return;
    const audio = this.ensureAudio();
    this.isMissing = false;
    this.error = null;
    this.isLoading = true;
    audio.src = getMeditationAudioUrl(track);
    audio.load();
    this.notify();
    void audio.play().catch(() => {});
  }

  // --- Sleep timer ---

  public setSleepTimer(minutes: number) {
    this.clearSleepTimer();
    if (minutes <= 0) return;
    this.sleepTotal = minutes;
    this.sleepDeadline = Date.now() + minutes * 60_000;
    this.startTicker();
    this.notify();
  }

  public clearSleepTimer() {
    if (this.sleepTimer) {
      clearInterval(this.sleepTimer);
      this.sleepTimer = null;
    }
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    if (this.sleepFading && this.audio) {
      this.audio.volume = this.volume;
    }
    this.sleepDeadline = null;
    this.sleepTotal = 0;
    this.sleepFading = false;
    this.notify();
  }

  public getSleepRemaining(): number {
    if (!this.sleepDeadline) return 0;
    return Math.max(0, Math.round((this.sleepDeadline - Date.now()) / 1000));
  }

  private startTicker() {
    if (this.sleepTimer) return;
    this.sleepTimer = window.setInterval(() => {
      if (this.sleepDeadline && this.getSleepRemaining() <= 0 && !this.sleepFading) {
        this.beginSleepFade();
        return;
      }
      this.notify();
    }, 1000);
  }

  private stopTicker() {
    if (!this.sleepDeadline && this.sleepTimer) {
      clearInterval(this.sleepTimer);
      this.sleepTimer = null;
    }
  }

  private beginSleepFade() {
    const audio = this.audio;
    if (!audio) return;
    this.sleepFading = true;
    this.notify();

    const startVolume = audio.volume;
    const steps = (SLEEP_FADE_SECONDS * 1000) / 250;
    let step = 0;

    this.fadeTimer = window.setInterval(() => {
      step += 1;
      const ratio = Math.max(0, 1 - step / steps);
      if (this.audio) this.audio.volume = startVolume * ratio;

      if (step >= steps) {
        if (this.fadeTimer) clearInterval(this.fadeTimer);
        this.fadeTimer = null;
        this.audio?.pause();
        if (this.audio) this.audio.volume = this.volume;
        this.sleepFading = false;
        this.sleepDeadline = null;
        this.sleepTotal = 0;
        this.notify();
      }
    }, 250);
  }

  // --- State ---

  public getState(): MeditationPlayerState {
    const audio = this.audio;
    const track = getMeditationTrack(this.trackId);
    const duration = audio && Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : track?.durationHint ?? 0;

    return {
      trackId: this.trackId,
      isPlaying: !!audio && !audio.paused && !audio.ended && !this.isMissing,
      isLoading: this.isLoading,
      isMissing: this.isMissing,
      error: this.error,
      currentTime: audio?.currentTime ?? 0,
      duration,
      volume: this.volume,
      rate: this.rate,
      repeat: this.repeat,
      sleepRemaining: this.getSleepRemaining(),
      sleepTotal: this.sleepTotal,
      sleepFading: this.sleepFading
    };
  }

  public getActiveTrack(): MeditationTrack | undefined {
    return getMeditationTrack(this.trackId);
  }

  // --- Lock screen / notification media controls ---

  private syncMediaSession() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const track = getMeditationTrack(this.trackId);
    if (!track) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: 'آرامیتو',
        album: 'موسیقی آرامش'
      });
      navigator.mediaSession.setActionHandler('play', () => void this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => void this.playPrevious());
      navigator.mediaSession.setActionHandler('nexttrack', () => void this.playNext());
      navigator.mediaSession.setActionHandler('seekbackward', () => this.skip(-15));
      navigator.mediaSession.setActionHandler('seekforward', () => this.skip(15));
    } catch {
      /* Media Session در همه WebViewها پشتیبانی نمی‌شود */
    }
  }
}

export const meditationPlayer = new MeditationPlayerService();
