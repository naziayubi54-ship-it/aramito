import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Copy, Check, Mic, Clock } from 'lucide-react';
import { MeditationItem } from '../../data/meditations';
import { toPersianDigits, formatSeconds } from '../../utils/persian';
import { haptics } from '../../services/haptics';

interface SpeakerScriptModalProps {
  meditation: MeditationItem;
  onClose: () => void;
}

export const SpeakerScriptModal: React.FC<SpeakerScriptModalProps> = ({
  meditation,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const fullScriptText = meditation.script
    .map((s) => `[${formatSeconds(s.start)}] ${s.text} (مکث گوینده: ${s.pauseAfter || 5} ثانیه)`)
    .join('\n\n');

  const handleCopy = () => {
    haptics.medium();
    navigator.clipboard.writeText(
      `عنوان مدیتیشن: ${meditation.title}\nدسته‌بندی: ${meditation.categoryLabel}\nمدت کل: ${formatSeconds(meditation.duration)}\n\n--- متن گوینده با زمان‌بندی ---\n\n${fullScriptText}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg h-[85vh] liquid-glass rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass-subtle)]">
          <div className="flex items-center gap-2 text-[var(--accent-sage)]">
            <Mic className="w-5 h-5" />
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">متن و زمان‌بندی برای گوینده</h3>
              <p className="text-[11px] text-[var(--text-secondary)]">{meditation.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full liquid-glass-subtle text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Script Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-3">
          <div className="p-3 rounded-2xl liquid-glass-subtle text-xs text-[var(--text-secondary)] space-y-1">
            <p className="font-bold text-[var(--text-primary)]">راهنمای گوینده:</p>
            <p>لحن آرام، تنفس شمرده، و رعایت کامل مکث‌های تعیین‌شده در پایان هر بند جهت همراهی ذهن مخاطب.</p>
          </div>

          {meditation.script.map((seg, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl liquid-glass-subtle space-y-1 text-right">
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--accent-sage)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>شروع: {formatSeconds(seg.start)}</span>
                </span>
                <span className="text-[var(--accent-warm)]">
                  مکث: {toPersianDigits(seg.pauseAfter || 5)} ثانیه
                </span>
              </div>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed pt-1 font-medium">
                {seg.text}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom copy action */}
        <div className="pt-3 border-t border-[var(--border-glass-subtle)] flex items-center justify-between gap-3">
          <span className="text-xs text-[var(--text-secondary)]">
            {toPersianDigits(meditation.script.length)} قطعه زمان‌دار
          </span>
          <button
            onClick={handleCopy}
            className="px-5 py-2.5 rounded-2xl bg-[var(--accent-sage)] text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>متن کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>کپی کامل اسکریپت</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
