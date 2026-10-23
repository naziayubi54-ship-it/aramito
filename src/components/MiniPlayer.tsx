import React, { useEffect, useState } from 'react';
import { Volume2, Square, Clock, ChevronUp, Play, Pause, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioEngine } from '../services/audioEngine';
import { meditationPlayer, MeditationPlayerState } from '../services/meditationPlayer';
import { getMeditationTrack } from '../data/meditationTracks';
import { formatSeconds, toPersianDigits } from '../utils/persian';
import { haptics } from '../services/haptics';

interface MiniPlayerProps {
  onExpand: () => void;
  onOpenTrack: (trackId: string) => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand, onOpenTrack }) => {
  const [, setTick] = useState(0);
  const [player, setPlayer] = useState<MeditationPlayerState>(() => meditationPlayer.getState());

  useEffect(() => {
    const unsubAudio = audioEngine.subscribe(() => setTick((t) => t + 1));
    const unsubPlayer = meditationPlayer.subscribe(() => {
      setTick((t) => t + 1);
      setPlayer(meditationPlayer.getState());
    });
    return () => {
      unsubAudio();
      unsubPlayer();
    };
  }, []);

  const track = getMeditationTrack(player.trackId);

  const activeCount = audioEngine.getActiveCount();
  const activeChannels = audioEngine.getActiveChannelList();
  const isRelaxMusic = audioEngine.isRelaxMusicActive();
  const sleepTimer = audioEngine.getSleepTimerRemaining();

  if (!track && activeCount === 0 && !isRelaxMusic) {
    return null;
  }

  const isMeditation = !!track;

  const titleText = track
    ? track.title
    : isRelaxMusic
    ? 'موسیقی ملایم امبینت'
    : activeChannels.length === 1
    ? activeChannels[0].name
    : `${toPersianDigits(activeChannels.length)} صدای طبیعت در حال پخش`;

  const subtitle = track
    ? player.isMissing
      ? 'فایل صوتی هنوز اضافه نشده'
      : player.sleepRemaining > 0
      ? `تایمر خواب: ${formatSeconds(player.sleepRemaining)}`
      : player.isPlaying
      ? 'در حال پخش · لمس برای پلیر'
      : 'متوقف · لمس برای ادامه'
    : sleepTimer > 0
    ? `تایمر خواب: ${formatSeconds(sleepTimer)}`
    : 'لمس برای تنظیم حجم و تایمر';

  const progress = track && player.duration > 0 ? Math.min(1, player.currentTime / player.duration) : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+7.2rem)] left-4 right-4 z-[45] max-w-md mx-auto pointer-events-auto"
      >
        <div className="liquid-glass rounded-[22px] p-2.5 px-3 flex items-center justify-between shadow-lg relative overflow-hidden">
          {track && (
            <div
              className="absolute bottom-0 right-0 h-[2px] bg-[var(--accent-sage)] transition-[width] duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          )}

          <button
            onClick={() => {
              haptics.light();
              onExpand();
            }}
            className="flex items-center gap-2.5 flex-1 text-right min-w-0"
          >
            {track ? (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: `linear-gradient(150deg, ${track.accent.from}, ${track.accent.to})` }}
              >
                <Sparkles className="w-4 h-4" style={{ color: '#465075' }} />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-[var(--accent-sage-soft)] flex items-center justify-center shrink-0 text-[var(--accent-sage)]">
                <Volume2 className="w-4 h-4 animate-pulse" />
              </div>
            )}
            <div className="truncate">
              <p className="text-[11.5px] font-semibold text-[var(--text-primary)] truncate">{titleText}</p>
              <p
                className={`text-[9.5px] flex items-center gap-1 ${
                  track || sleepTimer > 0 ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
                }`}
              >
                {(track && player.sleepRemaining > 0) || sleepTimer > 0 ? (
                  <Clock className="w-2.5 h-2.5 text-[var(--accent-warm)]" />
                ) : null}
                <span className="truncate">{subtitle}</span>
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                haptics.light();
                if (track) {
                  void meditationPlayer.toggle();
                } else {
                  audioEngine.stopAllChannels();
                }
              }}
              title={track ? 'پخش / توقف' : 'توقف صداها'}
              className="w-8 h-8 rounded-full bg-white/60 dark:bg-white/10 flex items-center justify-center text-[var(--text-primary)] active:scale-90 transition-transform"
            >
              {track ? (
                player.isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current translate-x-[1px]" />
                )
              ) : (
                <Square className="w-3 h-3 fill-current" />
              )}
            </button>
            <button
              onClick={() => {
                haptics.light();
                if (track) {
                  onOpenTrack(track.id);
                } else {
                  onExpand();
                }
              }}
              className="w-8 h-8 rounded-full liquid-glass-subtle flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-transform"
              title={track ? 'باز کردن پلیر' : 'باز کردن صداها'}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
