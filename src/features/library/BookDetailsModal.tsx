import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Star, BookOpen, Headphones, Bookmark, BookmarkCheck, ArrowLeft } from 'lucide-react';
import { Book, BOOKS_DATA } from '../../data/books';
import { storage } from '../../services/storage';
import { toPersianDigits } from '../../utils/persian';
import { haptics } from '../../services/haptics';

interface BookDetailsModalProps {
  book: Book;
  onClose: () => void;
  onOpenReader: (book: Book) => void;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  book,
  onClose,
  onOpenReader
}) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ chapterIndex: number; progressPercent: number }>({ chapterIndex: 0, progressPercent: 0 });

  useEffect(() => {
    storage.getSavedBooks().then((saved) => setIsSaved(saved.includes(book.id)));
    storage.getBookProgress(book.id).then(setProgress);
  }, [book]);

  const handleToggleShelf = async () => {
    haptics.light();
    const state = await storage.toggleSavedBook(book.id);
    setIsSaved(state);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md h-[90vh] max-h-[720px] liquid-glass rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden"
      >
        {/* Top close */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-glass-subtle)]">
          <span className="text-xs font-bold text-[var(--accent-sage)]">مشخصات کتاب</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full liquid-glass-subtle text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable details content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-5">
          {/* Big book cover presentation */}
          <div className="flex gap-4 items-center">
            {/* 3D Stylized Book Cover */}
            <div
              className={`w-28 h-40 rounded-2xl bg-gradient-to-tr ${book.coverGradient} shadow-2xl flex flex-col justify-between p-3 text-white shrink-0 relative overflow-hidden border border-white/20`}
            >
              <div className="w-1.5 h-full absolute right-0 top-0 bg-white/20" />
              <div>
                <span className="text-[9px] font-bold opacity-80">{book.category}</span>
                <h4 className="text-xs font-bold leading-tight mt-1 line-clamp-3">{book.title}</h4>
              </div>
              <p className="text-[10px] opacity-80 truncate">{book.author}</p>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug">{book.title}</h3>
              {book.originalTitle && (
                <p className="text-[11px] font-mono text-[var(--text-muted)] truncate">{book.originalTitle}</p>
              )}
              <p className="text-xs text-[var(--text-secondary)]">نویسنده: <span className="font-bold text-[var(--text-primary)]">{book.author}</span></p>
              {book.translator && (
                <p className="text-xs text-[var(--text-secondary)]">مترجم: {book.translator}</p>
              )}
              <p className="text-xs text-[var(--text-secondary)]">{book.publisher} · {book.publishedYear}</p>

              {/* Rating */}
              <div className="flex items-center gap-1.5 pt-1">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-bold font-mono">{toPersianDigits(book.rating)}</span>
                </div>
                <span className="text-[11px] text-[var(--text-muted)]">
                  ({toPersianDigits(book.ratingCount)} نظر)
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar if started */}
          {progress.progressPercent > 0 && (
            <div className="p-3.5 rounded-2xl liquid-glass-subtle space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--text-primary)]">وضعیت مطالعه</span>
                <span className="text-[var(--accent-sage)] font-bold">{toPersianDigits(progress.progressPercent)}٪ خوانده شده</span>
              </div>
              <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-sage)] rounded-full transition-all"
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Book Summary */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-[var(--text-primary)]">معرفی کتاب:</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed text-justify">
              {book.summary}
            </p>
          </div>

          {/* Table of contents preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[var(--text-primary)]">فهرست فصل‌ها ({toPersianDigits(book.chapters.length)} فصل):</h4>
            <div className="space-y-1.5">
              {book.chapters.map((ch, idx) => (
                <div key={ch.id} className="p-2.5 rounded-xl liquid-glass-subtle text-xs flex items-center justify-between">
                  <span className="text-[var(--text-primary)] font-medium truncate">{ch.title}</span>
                  <span className="text-[10px] text-[var(--text-muted)] shrink-0 mr-2">فصل {toPersianDigits(idx + 1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-[var(--border-glass-subtle)] flex items-center gap-2.5">
          <button
            onClick={handleToggleShelf}
            className={`p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isSaved
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'liquid-glass-subtle text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="افزودن به قفسه من"
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSaved ? 'در قفسه' : 'قفسه'}</span>
          </button>

          <button
            onClick={() => {
              haptics.medium();
              onOpenReader(book);
            }}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#8FAE9B] to-[#7FD1C7] text-white text-xs font-bold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>{progress.progressPercent > 0 ? 'ادامه مطالعه' : 'شروع مطالعه'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
