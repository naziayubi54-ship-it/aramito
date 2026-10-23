import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  List,
  Type,
  Sun,
  Moon,
  Coffee,
  Check
} from 'lucide-react';
import { Book, BookChapter } from '../../data/books';
import { storage } from '../../services/storage';
import { toPersianDigits } from '../../utils/persian';
import { haptics } from '../../services/haptics';

interface BookReaderModalProps {
  book: Book;
  onClose: () => void;
}

export const BookReaderModal: React.FC<BookReaderModalProps> = ({ book, onClose }) => {
  const [chapterIndex, setChapterIndex] = useState<number>(0);
  const [paperTheme, setPaperTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  const [fontSize, setFontSize] = useState<number>(15);
  const [lineHeight, setLineHeight] = useState<number>(1.8);
  const [showTOC, setShowTOC] = useState<boolean>(false);
  const [showAppearance, setShowAppearance] = useState<boolean>(false);
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  useEffect(() => {
    storage.getBookProgress(book.id).then((p) => {
      if (p && p.chapterIndex < book.chapters.length) {
        setChapterIndex(p.chapterIndex);
      }
    });
  }, [book]);

  const currentChapter: BookChapter = book.chapters[chapterIndex] || book.chapters[0];
  const progressPercent = Math.round(((chapterIndex + 1) / book.chapters.length) * 100);

  const handleNextChapter = () => {
    if (chapterIndex < book.chapters.length - 1) {
      haptics.light();
      const next = chapterIndex + 1;
      setChapterIndex(next);
      storage.saveBookProgress(book.id, next, Math.round(((next + 1) / book.chapters.length) * 100));
    }
  };

  const handlePrevChapter = () => {
    if (chapterIndex > 0) {
      haptics.light();
      const prev = chapterIndex - 1;
      setChapterIndex(prev);
      storage.saveBookProgress(book.id, prev, Math.round(((prev + 1) / book.chapters.length) * 100));
    }
  };

  const themeStyles = {
    light: 'bg-[#FCFAF7] text-[#2E2A33]',
    sepia: 'bg-[#F4ECE1] text-[#3B342C]',
    dark: 'bg-[#18191E] text-[#D8D4CF]'
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${themeStyles[paperTheme]} transition-colors duration-200 select-text`}>
      {/* Top Bar */}
      <header className="px-4 py-3 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-xs font-bold truncate max-w-[180px]">{book.title}</h3>
            <p className="text-[10px] opacity-70 truncate">{currentChapter.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Bookmark */}
          <button
            onClick={() => {
              haptics.light();
              setBookmarked(!bookmarked);
            }}
            className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${
              bookmarked ? 'text-amber-500' : 'opacity-70'
            }`}
            title="نشان کردن این صفحه"
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Table of contents */}
          <button
            onClick={() => {
              haptics.light();
              setShowTOC(!showTOC);
            }}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 opacity-70"
            title="فهرست فصل‌ها"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Appearance */}
          <button
            onClick={() => {
              haptics.light();
              setShowAppearance(!showAppearance);
            }}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 opacity-70"
            title="تنظیم فونت و رنگ کاغذ"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Chapter Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6 max-w-xl mx-auto w-full leading-loose">
        <h2 className="text-lg font-bold mb-4 pb-2 border-b border-black/10 dark:border-white/10">
          {currentChapter.title}
        </h2>
        <div
          style={{ fontSize: `${fontSize}px`, lineHeight }}
          className="space-y-4 whitespace-pre-line text-justify"
        >
          {currentChapter.content}
        </div>
      </main>

      {/* Bottom Navigation & Progress */}
      <footer className="px-5 py-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between shrink-0 text-xs">
        <button
          onClick={handlePrevChapter}
          disabled={chapterIndex === 0}
          className="px-3 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 flex items-center gap-1 font-bold"
        >
          <ChevronRight className="w-4 h-4" />
          <span>فصل قبل</span>
        </button>

        <span className="text-[11px] opacity-70 font-mono">
          فصل {toPersianDigits(chapterIndex + 1)} از {toPersianDigits(book.chapters.length)} ({toPersianDigits(progressPercent)}٪)
        </span>

        <button
          onClick={handleNextChapter}
          disabled={chapterIndex === book.chapters.length - 1}
          className="px-3 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 flex items-center gap-1 font-bold"
        >
          <span>فصل بعد</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </footer>

      {/* Table of Contents Drawer */}
      <AnimatePresence>
        {showTOC && (
          <div className="fixed inset-0 z-60 flex justify-end bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className={`w-80 h-full ${themeStyles[paperTheme]} shadow-2xl p-5 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                  <h3 className="text-sm font-bold">فهرست سرفصل‌ها</h3>
                  <button onClick={() => setShowTOC(false)} className="p-1 rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 mt-4">
                  {book.chapters.map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        haptics.light();
                        setChapterIndex(idx);
                        setShowTOC(false);
                      }}
                      className={`w-full text-right p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                        chapterIndex === idx
                          ? 'bg-black/10 dark:bg-white/10'
                          : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate">{ch.title}</span>
                      {chapterIndex === idx && <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] opacity-60 text-center">
                {book.title} · {book.author}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Appearance Settings Panel */}
      <AnimatePresence>
        {showAppearance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-14 left-4 right-4 max-w-sm mx-auto z-60 liquid-glass rounded-3xl p-5 shadow-2xl space-y-4 border border-white/50"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[var(--text-primary)]">تنظیمات مطالعه</h4>
              <button onClick={() => setShowAppearance(false)}>
                <X className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Paper Theme */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-[var(--text-secondary)] font-medium">رنگ پس‌زمینه کاغذ:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light' as const, label: 'سفید روز', bg: 'bg-[#FCFAF7] text-slate-800 border' },
                  { id: 'sepia' as const, label: 'کاغذی (سپیا)', bg: 'bg-[#F4ECE1] text-[#3B342C] border' },
                  { id: 'dark' as const, label: 'شب تیره', bg: 'bg-[#18191E] text-slate-200 border border-slate-700' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      haptics.light();
                      setPaperTheme(th.id);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${th.bg} ${
                      paperTheme === th.id ? 'ring-2 ring-[var(--accent-sage)]' : ''
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-[var(--text-secondary)]">
                <span>اندازه قلم</span>
                <span className="font-mono">{toPersianDigits(fontSize)}pt</span>
              </div>
              <input
                type="range"
                min="13"
                max="22"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-full accent-[var(--accent-sage)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
