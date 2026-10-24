import { SOUND_CHANNELS, SoundChannel } from '../data/sounds';

interface ActiveChannelNodes {
  gainNode: GainNode;
  sources: (AudioNode | number)[]; // WebAudio nodes or interval timers for procedural sound
  audioElement?: HTMLAudioElement;
  stopFns?: (() => void)[]; // cleanup for crossfade loops
  isProcedural: boolean;
}

// فرمت‌هایی که اگر فایل صوتی واقعی کنار برنامه گذاشته شود، به همین ترتیب جست‌وجو می‌شوند
const AUDIO_EXTENSIONS = ['mp3', 'ogg', 'm4a', 'wav'];

type AudioEngineListener = () => void;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeChannels: Map<string, ActiveChannelNodes> = new Map();
  private channelVolumes: Map<string, number> = new Map();
  private listeners: Set<AudioEngineListener> = new Set();

  // Decoded loop files (public/audio/{id}.mp3). null = file not available -> procedural fallback
  private audioBuffers: Map<string, AudioBuffer | null> = new Map();
  private pendingStarts: Set<string> = new Set();

  // Sleep timer
  private sleepTimerId: number | null = null;
  private sleepTimerRemaining: number = 0; // seconds
  private sleepTimerInterval: number | null = null;

  // Ambient relax generative music
  private isAmbientMusicPlaying: boolean = false;
  private ambientMusicInterval: number | null = null;
  private ambientMusicNodes: AudioNode[] = [];

  constructor() {
    SOUND_CHANNELS.forEach((ch) => {
      this.channelVolumes.set(ch.id, ch.defaultVolume);
    });
  }

  public subscribe(fn: AudioEngineListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // --- Gentle cues (breathing & meditation) ---
  // صدای بسیار ملایم: موج سینوسی خالص، شروع نرم (بدون حملهٔ ناگهانی) و ولوم پایین،
  // تا هنگام شروع تمرین یا تغییر مرحلهٔ تنفس هیچ شوک صوتی ایجاد نشود.
  public playChime(type: 'soft' | 'bowl' | 'phase' = 'soft') {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const cfg = {
      soft: { freq: 240, peak: 0.035, attack: 0.35, length: 1.4 },
      bowl: { freq: 220, peak: 0.04, attack: 0.5, length: 2.4 },
      phase: { freq: 256, peak: 0.03, attack: 0.3, length: 1.1 }
    }[type];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(cfg.freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(cfg.peak, now + cfg.attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.length);

    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + cfg.length + 0.05);
  }

  /** تیک شمارش ثانیه‌ها؛ بسیار لطیف و تقریباً نامحسوس */
  public playCountTick() {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.1);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.015, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // --- Sound Channel Toggle & Volume ---
  public isChannelActive(id: string): boolean {
    return this.activeChannels.has(id);
  }

  public getChannelVolume(id: string): number {
    return this.channelVolumes.get(id) ?? 0.5;
  }

  public setChannelVolume(id: string, vol: number) {
    this.channelVolumes.set(id, vol);
    const channel = this.activeChannels.get(id);
    if (channel && this.ctx) {
      channel.gainNode.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  public async toggleChannel(id: string) {
    if (this.activeChannels.has(id)) {
      this.stopChannel(id);
    } else {
      await this.startChannel(id);
    }
    this.notify();
  }

  // Loads and decodes /audio/{id}.(mp3|ogg|m4a|wav) once. The recording is looped with an
  // equal-power crossfade (see createCrossfadeLoop), so even a recording whose start and end
  // do not match loops without any click, gap or jump.
  private async loadLoopBuffer(id: string): Promise<AudioBuffer | null> {
    if (this.audioBuffers.has(id)) return this.audioBuffers.get(id) ?? null;
    for (const ext of AUDIO_EXTENSIONS) {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}audio/${id}.${ext}`);
        if (!res.ok) continue;
        const data = await res.arrayBuffer();
        const buffer = await this.ctx!.decodeAudioData(data);
        this.audioBuffers.set(id, buffer);
        return buffer;
      } catch {
        // try next extension
      }
    }
    this.audioBuffers.set(id, null);
    return null;
  }

  // Seamless loop: every pass of the file overlaps the next one by `fade` seconds using
  // equal-power curves (sin/cos), so the level stays constant during the transition.
  // Two passes are always scheduled ahead, so it keeps playing even if timers are throttled.
  private createCrossfadeLoop(buffer: AudioBuffer, dest: AudioNode): () => void {
    const ctx = this.ctx!;
    const duration = buffer.duration;
    const fade = Math.min(3, duration * 0.2);
    const hop = Math.max(0.25, duration - fade);

    const points = 64;
    const fadeInCurve = new Float32Array(points);
    const fadeOutCurve = new Float32Array(points);
    for (let i = 0; i < points; i++) {
      const x = i / (points - 1);
      fadeInCurve[i] = Math.sin((x * Math.PI) / 2);
      fadeOutCurve[i] = Math.cos((x * Math.PI) / 2);
    }

    let stopped = false;
    let first = true;
    let nextStart = ctx.currentTime + 0.05;
    const live = new Set<{ src: AudioBufferSourceNode; gain: GainNode }>();

    const schedule = () => {
      if (stopped) return;
      const t = nextStart;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = first ? 1 : 0;
      if (!first) gain.gain.setValueCurveAtTime(fadeInCurve, t, fade);
      gain.gain.setValueCurveAtTime(fadeOutCurve, t + hop, fade);
      src.connect(gain);
      gain.connect(dest);
      src.start(t);
      src.stop(t + duration + 0.1);

      const entry = { src, gain };
      live.add(entry);
      src.onended = () => {
        live.delete(entry);
        try {
          gain.disconnect();
        } catch {}
      };

      first = false;
      nextStart = t + hop;
    };

    const fill = () => {
      while (!stopped && nextStart - ctx.currentTime < hop * 1.5) schedule();
    };
    fill();
    const timer = window.setInterval(fill, 1000);

    return () => {
      stopped = true;
      clearInterval(timer);
      live.forEach(({ src, gain }) => {
        try {
          src.stop();
        } catch {}
        try {
          src.disconnect();
          gain.disconnect();
        } catch {}
      });
      live.clear();
    };
  }

  public async startChannel(id: string) {
    if (this.activeChannels.has(id) || this.pendingStarts.has(id)) return;
    const ch = SOUND_CHANNELS.find((c) => c.id === id);
    if (!ch) return;

    const ctx = this.initContext();

    // First try the recorded loop file; fall back to procedural generation if it is missing
    this.pendingStarts.add(id);
    const buffer = await this.loadLoopBuffer(id);
    this.pendingStarts.delete(id);
    if (this.activeChannels.has(id)) return;

    const gainNode = ctx.createGain();
    const targetVol = this.channelVolumes.get(id) ?? ch.defaultVolume;
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.3);
    gainNode.connect(this.masterGain!);

    if (buffer) {
      const stopLoop = this.createCrossfadeLoop(buffer, gainNode);
      this.activeChannels.set(id, {
        gainNode,
        sources: [],
        stopFns: [stopLoop],
        isProcedural: false
      });
    } else {
      // Procedural Web Audio Generation
      const sources = this.createProceduralSound(ch.proceduralType, gainNode, ch);
      this.activeChannels.set(id, {
        gainNode,
        sources,
        isProcedural: true
      });
    }
    this.notify();
  }

  public stopChannel(id: string) {
    const channel = this.activeChannels.get(id);
    if (!channel) return;

    if (this.ctx) {
      channel.gainNode.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
    }

    setTimeout(() => {
      if (channel.audioElement) {
        channel.audioElement.pause();
        channel.audioElement.src = '';
      }
      channel.stopFns?.forEach((fn) => fn());
      channel.sources.forEach((s) => {
        if (typeof s === 'number') {
          clearInterval(s);
        } else if ('stop' in s && typeof (s as AudioScheduledSourceNode).stop === 'function') {
          try {
            (s as AudioScheduledSourceNode).stop();
            s.disconnect();
          } catch {}
        } else {
          try {
            s.disconnect();
          } catch {}
        }
      });
      channel.gainNode.disconnect();
      this.activeChannels.delete(id);
      this.notify();
    }, 320);
  }

  public stopAllChannels() {
    const ids = Array.from(this.activeChannels.keys());
    ids.forEach((id) => this.stopChannel(id));
    if (this.isAmbientMusicPlaying) {
      this.stopAmbientMusic();
    }
  }

  public getActiveCount(): number {
    return this.activeChannels.size + (this.isAmbientMusicPlaying ? 1 : 0);
  }

  public getActiveChannelList(): SoundChannel[] {
    return SOUND_CHANNELS.filter((ch) => this.activeChannels.has(ch.id));
  }

  // --- Procedural Audio Generators ---
  private createProceduralSound(type: SoundChannel['proceduralType'], targetGain: GainNode, ch: SoundChannel): (AudioNode | number)[] {
    const ctx = this.ctx!;
    const sources: (AudioNode | number)[] = [];

    if (type === 'white-noise' || type === 'pink-noise' || type === 'brown-noise') {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'white-noise') {
          output[i] = white * 0.15;
        } else if (type === 'pink-noise') {
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        } else {
          // Brown noise
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 0.6;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      noise.connect(targetGain);
      noise.start();
      sources.push(noise);
    } else if (type === 'rain') {
      // Pink noise + lowpass + gentle random drop impulses
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.25;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;

      noise.connect(filter);
      filter.connect(targetGain);
      noise.start();
      sources.push(noise, filter);

      // Random droplets
      const timer = window.setInterval(() => {
        if (!this.activeChannels.has('rain') || !this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          const freq = 1200 + Math.random() * 800;
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);

          g.gain.setValueAtTime(0.04, this.ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

          osc.connect(g);
          g.connect(targetGain);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.08);
        } catch {}
      }, 180);
      sources.push(timer);
    } else if (type === 'waves') {
      // Lowpass filtered noise modulated by a very slow LFO
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * white) / 1.02;
        last = data[i];
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;

      const swellGain = ctx.createGain();
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.1; // 10s wave cycle
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.35;
      lfo.connect(lfoGain);
      lfoGain.connect(swellGain.gain);

      noise.connect(filter);
      filter.connect(swellGain);
      swellGain.connect(targetGain);

      noise.start();
      lfo.start();
      sources.push(noise, filter, swellGain, lfo, lfoGain);
    } else if (type === 'fire') {
      // Crackle pops + warm brown rumble
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.04 * white) / 1.04;
        last = data[i];
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 350;

      noise.connect(filter);
      filter.connect(targetGain);
      noise.start();
      sources.push(noise, filter);

      // Random crackle pops
      const timer = window.setInterval(() => {
        if (!this.activeChannels.has('fire') || !this.ctx) return;
        try {
          const count = 1 + Math.floor(Math.random() * 3);
          for (let k = 0; k < count; k++) {
            const buf = this.ctx.createBuffer(1, 400, this.ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let j = 0; j < 400; j++) d[j] = (Math.random() * 2 - 1) * Math.exp(-j / 60);
            const pop = this.ctx.createBufferSource();
            pop.buffer = buf;
            const popGain = this.ctx.createGain();
            popGain.gain.value = 0.15;
            pop.connect(popGain);
            popGain.connect(targetGain);
            pop.start(this.ctx.currentTime + k * 0.04);
          }
        } catch {}
      }, 150);
      sources.push(timer);
    } else if (type === 'binaural') {
      // Binaural beats with stereo panning
      const baseFreq = ch.binauralFreq || 200;
      const beatFreq = ch.binauralBeat || 6;

      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      oscL.type = 'sine';
      oscR.type = 'sine';
      oscL.frequency.value = baseFreq;
      oscR.frequency.value = baseFreq + beatFreq;

      const merger = ctx.createChannelMerger(2);
      oscL.connect(merger, 0, 0); // left channel
      oscR.connect(merger, 0, 1); // right channel

      merger.connect(targetGain);
      oscL.start();
      oscR.start();
      sources.push(oscL, oscR, merger);
    } else {
      // Wind, birds, forest, river, etc fallback: smooth gentle noise + soft harmonics
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.03 * white) / 1.03;
        last = data[i];
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = type === 'wind' ? 'bandpass' : 'lowpass';
      filter.frequency.value = type === 'wind' ? 380 : 800;
      filter.Q.value = 1.2;

      noise.connect(filter);
      filter.connect(targetGain);
      noise.start();
      sources.push(noise, filter);

      if (type === 'birds' || type === 'forest') {
        const timer = window.setInterval(() => {
          if (!this.activeChannels.has(ch.id) || !this.ctx) return;
          try {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sine';
            const f1 = 2400 + Math.random() * 1200;
            const f2 = f1 + (Math.random() > 0.5 ? 400 : -400);
            osc.frequency.setValueAtTime(f1, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(f2, this.ctx.currentTime + 0.12);
            g.gain.setValueAtTime(0.04, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
            osc.connect(g);
            g.connect(targetGain);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.12);
          } catch {}
        }, 1200);
        sources.push(timer);
      }
    }

    return sources;
  }

  // --- Sleep Timer ---
  public setSleepTimer(minutes: number) {
    this.clearSleepTimer();
    if (minutes <= 0) return;

    this.sleepTimerRemaining = minutes * 60;
    this.notify();

    this.sleepTimerInterval = window.setInterval(() => {
      this.sleepTimerRemaining -= 1;
      if (this.sleepTimerRemaining <= 0) {
        this.clearSleepTimer();
        this.fadeOutAll(5); // fade out over 5s
      }
      this.notify();
    }, 1000);
  }

  public clearSleepTimer() {
    if (this.sleepTimerInterval) {
      clearInterval(this.sleepTimerInterval);
      this.sleepTimerInterval = null;
    }
    if (this.sleepTimerId) {
      clearTimeout(this.sleepTimerId);
      this.sleepTimerId = null;
    }
    this.sleepTimerRemaining = 0;
    this.notify();
  }

  public getSleepTimerRemaining(): number {
    return this.sleepTimerRemaining;
  }

  private fadeOutAll(durationSec: number = 4) {
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + durationSec);
      setTimeout(() => {
        this.stopAllChannels();
        if (this.masterGain && this.ctx) {
          this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        }
      }, durationSec * 1000 + 200);
    } else {
      this.stopAllChannels();
    }
  }

  // --- Generative Ambient Relax Music ---
  public isRelaxMusicActive(): boolean {
    return this.isAmbientMusicPlaying;
  }

  public toggleAmbientMusic(mode: 'pentatonic' | 'drone' = 'pentatonic') {
    if (this.isAmbientMusicPlaying) {
      this.stopAmbientMusic();
    } else {
      this.startAmbientMusic(mode);
    }
    this.notify();
  }

  public startAmbientMusic(mode: 'pentatonic' | 'drone' = 'pentatonic') {
    if (this.isAmbientMusicPlaying) return;
    const ctx = this.initContext();
    this.isAmbientMusicPlaying = true;

    // Calming warm drone (root + fifth: C3 130.81Hz and G3 196.0Hz)
    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 3);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.value = 130.81;
    osc2.frequency.value = 196.0;

    osc1.connect(droneGain);
    osc2.connect(droneGain);
    droneGain.connect(this.masterGain!);

    osc1.start();
    osc2.start();

    this.ambientMusicNodes = [osc1, osc2, droneGain];

    // Pentatonic bell drops every few seconds: C, D, E, G, A
    const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
    this.ambientMusicInterval = window.setInterval(() => {
      if (!this.isAmbientMusicPlaying || !this.ctx) return;
      try {
        const note = notes[Math.floor(Math.random() * notes.length)];
        const bell = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(note, this.ctx.currentTime);
        bGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        bGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.2);

        bell.connect(bGain);
        bGain.connect(this.masterGain!);

        bell.start();
        bell.stop(this.ctx.currentTime + 3.2);
      } catch {}
    }, 2800);

    this.notify();
  }

  public stopAmbientMusic() {
    this.isAmbientMusicPlaying = false;
    if (this.ambientMusicInterval) {
      clearInterval(this.ambientMusicInterval);
      this.ambientMusicInterval = null;
    }
    this.ambientMusicNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {}
    });
    this.ambientMusicNodes = [];
    this.notify();
  }

  public applyPreset(presetId: string) {
    import('../data/sounds').then(({ PRESET_MIXES }) => {
      const preset = PRESET_MIXES.find((p) => p.id === presetId);
      if (!preset) return;
      this.stopAllChannels();
      setTimeout(() => {
        preset.channels.forEach(({ soundId, volume }) => {
          this.setChannelVolume(soundId, volume);
          this.startChannel(soundId);
        });
      }, 350);
    });
  }
}

export const audioEngine = new AudioEngine();
