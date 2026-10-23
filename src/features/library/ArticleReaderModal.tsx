import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Clock, BookOpen, Bookmark, Check, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';
import { ScientificArticle } from '../../data/articles';
import { SCIENTIFIC_REFERENCES } from '../../data/references';
import { toPersianDigits } from '../../utils/persian';
import { haptics } from '../../services/haptics';

interface ArticleReaderModalProps {
  article: ScientificArticle;
  onClose: () => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({ article, onClose }) => {
  const [fontSize, setFontSize] = useState<number>(14);
  const [saved, setSaved] = useState<boolean>(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg h-[90vh] max-h-[750px] liquid-glass rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative select-text"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass-subtle)] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-sage-soft)] text-[var(--accent-sage)]">
              {article.category}
            </span>
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" />
              <span>{toPersianDigits(article.readTimeMinutes)} دقیقه مطالعه</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Font size zoom */}
            <button
              onClick={() => {
                haptics.light();
                setFontSize((s) => Math.max(12, s - 1));
              }}
              className="p-1.5 rounded-full liquid-glass-subtle text-[var(--text-secondary)]"
              title="کوچک‌تر کردن متن"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                haptics.light();
                setFontSize((s) => Math.min(20, s + 1));
              }}
              className="p-1.5 rounded-full liquid-glass-subtle text-[var(--text-secondary)]"
              title="بزرگ‌تر کردن متن"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Bookmark */}
            <button
              onClick={() => {
                haptics.light();
                setSaved(!saved);
              }}
              className={`p-1.5 rounded-full liquid-glass-subtle ${saved ? 'text-amber-500' : 'text-[var(--text-muted)]'}`}
              title="نشان کردن مقاله"
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full liquid-glass-subtle text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-snug">
              {article.title}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{article.subtitle}</p>
          </div>

          {/* Key Takeaways Box */}
          <div className="p-4 rounded-2xl bg-[var(--accent-sage-soft)]/50 border border-[var(--accent-sage)]/30 space-y-2">
            <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
              <span>نکات کلیدی این مقاله:</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-[var(--text-primary)]">
              {article.keyPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[var(--accent-sage)] font-bold">·</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Structured Paragraphs */}
          <div style={{ fontSize: `${fontSize}px` }} className="space-y-3.5 text-[var(--text-primary)] leading-relaxed text-justify">
            {article.content.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* Academic References Section */}
          <div className="pt-4 border-t border-[var(--border-glass-subtle)] space-y-2">
            <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
              <span>منابع علمی داوری‌شده (Peer-Reviewed):</span>
            </h4>
            <div className="space-y-2">
              {article.referenceIds.map((refId) => {
                const ref = SCIENTIFIC_REFERENCES[refId];
                if (!ref) return null;
                return (
                  <div key={ref.id} className="p-3 rounded-2xl liquid-glass-subtle text-[11px] space-y-1">
                    <p className="font-semibold text-[var(--text-primary)]">{ref.title}</p>
                    <p className="text-[var(--text-secondary)]">{ref.authors} ({ref.year})</p>
                    <p className="font-mono text-[var(--accent-sage)]">{ref.journal}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--border-glass-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)] shrink-0">
          <span>انتشار: {article.date}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--accent-sage)] text-white font-bold"
          >
            اتمام مطالعه
          </button>
        </div>
      </motion.div>
    </div>
  );
};
