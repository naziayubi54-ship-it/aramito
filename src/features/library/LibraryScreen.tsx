import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Headphones,
  Search,
  Star,
  Bookmark,
  ChevronLeft,
  Sparkles,
  Play,
  FileText,
  Clock
} from 'lucide-react';
import { BOOKS_DATA, Book } from '../../data/books';
import { SCIENTIFIC_ARTICLES, ScientificArticle } from '../../data/articles';
import { PODCAST_EPISODES, PodcastEpisode } from '../../data/podcasts';
import { storage } from '../../services/storage';
import { BookDetailsModal } from './BookDetailsModal';
import { BookReaderModal } from './BookReaderModal';
import { ArticleReaderModal } from './ArticleReaderModal';
import { toPersianDigits } from '../../utils/persian';
import { haptics } from '../../services/haptics';

export const LibraryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'books' | 'shelf' | 'articles' | 'podcasts'>('books');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ScientificArticle | null>(null);
  const [savedBookIds, setSavedBookIds] = useState<string[]>([]);
  const [activePodcast, setActivePodcast] = useState<PodcastEpisode | null>(null);

  useEffect(() => {
    storage.getSavedBooks().then(setSavedBookIds);
  }, [activeTab]);

  const handleOpenBook = (book: Book) => {
    haptics.light();
    setSelectedBook(book);
  };

  const handleStartReading = (book: Book) => {
    setSelectedBook(null);
    setReadingBook(book);
  };

  const filteredBooks = BOOKS_DATA.filter((b) =>
    b.title.includes(searchQuery) || b.author.includes(searchQuery) || b.category.includes(searchQuery)
  );

  const filteredArticles = SCIENTIFIC_ARTICLES.filter((a) =>
    a.title.includes(searchQuery) || a.subtitle.includes(searchQuery) || a.category.includes(searchQuery)
  );

  return (
    <div className="space-y-4 pb-safe px-4 max-w-md mx-auto">
      {/* Search & Header */}
      <div className="liquid-glass rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--accent-sage)]" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">کتابخانه و دانش آرامش</h2>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="جستجو در کتاب‌ها، مقالات و پادکست‌ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs p-3 pr-9 rounded-2xl liquid-glass-subtle text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-glass)] outline-none focus:border-[var(--accent-sage)]"
          />
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute right-3 top-3.5" />
        </div>

        {/* Tab switchers: Books / My Shelf / Articles / Podcasts */}
        <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'books' as const, label: 'کتاب‌ها' },
            { id: 'shelf' as const, label: 'قفسهٔ من' },
            { id: 'articles' as const, label: 'مقالات علمی' },
            { id: 'podcasts' as const, label: 'پادکست‌ها' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                haptics.light();
                setActiveTab(tab.id);
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-white/15 text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Books */}
      {activeTab === 'books' && (
        <div className="space-y-5">
          {/* Top Sliding Featured Banner */}
          <div
            onClick={() => handleOpenBook(BOOKS_DATA[0])}
            className="cursor-pointer liquid-glass rounded-3xl p-5 shadow-lg relative overflow-hidden bg-gradient-to-l from-emerald-900/30 to-transparent border border-emerald-500/20"
          >
            <span className="text-[10px] font-bold text-[var(--accent-sage)] tracking-wider">
              کتاب برگزیده این هفته
            </span>
            <div className="flex gap-4 items-center mt-2">
              <div
                className={`w-20 h-28 rounded-xl bg-gradient-to-tr ${BOOKS_DATA[0].coverGradient} shadow-xl flex flex-col justify-between p-2 text-white shrink-0`}
              >
                <span className="text-[8px] opacity-80">{BOOKS_DATA[0].category}</span>
                <p className="text-[10px] font-bold leading-tight line-clamp-2">{BOOKS_DATA[0].title}</p>
                <span className="text-[8px] opacity-70 truncate">{BOOKS_DATA[0].author}</span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[var(--text-primary)] line-clamp-1">{BOOKS_DATA[0].title}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{BOOKS_DATA[0].author}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5 line-clamp-2">
                  {BOOKS_DATA[0].summary}
                </p>
                <div className="flex items-center gap-1 mt-2 text-[11px] font-bold text-[var(--accent-sage)]">
                  <span>مطالعه خلاصه و فصول</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Section: پرطرفدارترین‌ها (Most Popular) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-[var(--text-primary)]">کتاب‌های پرطرفدار آرامش و ذهن‌آگاهی</h3>
              <span className="text-[11px] text-[var(--accent-sage)] font-semibold">{toPersianDigits(filteredBooks.length)} عنوان</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {filteredBooks.map((book) => (
                <motion.div
                  key={book.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleOpenBook(book)}
                  className="cursor-pointer space-y-2"
                >
                  <div
                    className={`aspect-[3/4.2] rounded-2xl bg-gradient-to-tr ${book.coverGradient} shadow-md p-3 text-white flex flex-col justify-between relative overflow-hidden border border-white/20`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] opacity-80">{book.category}</span>
                      {book.isAudioBook && <Headphones className="w-3 h-3 text-white/90" />}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold leading-snug line-clamp-2">{book.title}</h4>
                      <p className="text-[9px] opacity-80 truncate mt-0.5">{book.author}</p>
                    </div>
                  </div>

                  <div className="px-0.5">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{book.title}</p>
                    <div className="flex items-center gap-1 text-amber-500 text-[10px] mt-0.5 font-mono">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{toPersianDigits(book.rating)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: My Shelf */}
      {activeTab === 'shelf' && (
        <div className="space-y-4">
          <div className="liquid-glass rounded-3xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">قفسهٔ شخصی من</h3>
              <span className="text-xs text-[var(--accent-sage)] font-bold">{toPersianDigits(savedBookIds.length)} کتاب ذخیره</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              کتاب‌هایی که نشان کرده‌اید یا در حال مطالعه آن‌ها هستید:
            </p>
          </div>

          <div className="space-y-3">
            {BOOKS_DATA.filter((b) => savedBookIds.includes(b.id)).map((book) => (
              <div
                key={book.id}
                onClick={() => handleOpenBook(book)}
                className="liquid-glass rounded-3xl p-4 cursor-pointer flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-16 rounded-xl bg-gradient-to-tr ${book.coverGradient} shadow-md flex items-center justify-center text-white shrink-0`}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">{book.title}</h4>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{book.author}</p>
                    <span className="text-[10px] text-[var(--accent-sage)] font-mono mt-1 block">
                      {toPersianDigits(book.pageCount)} صفحه · {book.publisher}
                    </span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-[var(--accent-sage-soft)] text-[var(--accent-sage)] flex items-center justify-center shrink-0">
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </div>
            ))}

            {savedBookIds.length === 0 && (
              <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                هنوز کتابی به قفسه اضافه نکرده‌اید.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Scientific Articles */}
      {activeTab === 'articles' && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-secondary)] px-1">
            مقالات علمی کوتاه، دقیق و داوری‌شده درباره علوم اعصاب، تنفس و خواب:
          </p>

          <div className="space-y-3">
            {filteredArticles.map((art) => (
              <motion.div
                key={art.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  haptics.light();
                  setSelectedArticle(art);
                }}
                className="liquid-glass rounded-3xl p-4 cursor-pointer hover:bg-white/70 dark:hover:bg-white/10 transition-all shadow-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-sage-soft)] text-[var(--accent-sage)]">
                    {art.category}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{toPersianDigits(art.readTimeMinutes)} دقیقه</span>
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug">
                  {art.title}
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {art.subtitle}
                </p>

                <div className="pt-2 border-t border-[var(--border-glass-subtle)] flex items-center justify-between text-[11px] text-[var(--accent-sage)] font-bold">
                  <span>مطالعه متن کامل و شواهد</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Podcasts */}
      {activeTab === 'podcasts' && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-secondary)] px-1">
            اپیزودهای صوتی رادیو آرامیتو پیرامون علم آرامش و خواب:
          </p>

          <div className="space-y-3">
            {PODCAST_EPISODES.map((ep) => (
              <motion.div
                key={ep.id}
                className="liquid-glass rounded-3xl p-4 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: ep.accentColor }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
                    >
                      <Headphones className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[var(--accent-sage)]">{ep.series}</span>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mt-0.5">{ep.title}</h4>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {ep.description}
                </p>

                {/* Chapters */}
                <div className="p-3 rounded-2xl liquid-glass-subtle space-y-1">
                  <p className="text-[10px] font-bold text-[var(--text-primary)]">بخش‌های این اپیزود:</p>
                  {ep.chapters.map((ch, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-[var(--text-secondary)]">
                      <span>{ch.title}</span>
                      <span className="font-mono text-[var(--text-muted)]">{toPersianDigits(Math.floor(ch.time / 60))}:۰۰</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[var(--border-glass-subtle)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)] font-mono">{ep.durationLabel}</span>
                  <button
                    onClick={() => {
                      haptics.medium();
                      setActivePodcast(ep);
                    }}
                    className="px-4 py-2 rounded-2xl bg-[var(--accent-sage)] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <span>شنیدن اپیزود</span>
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onOpenReader={handleStartReading}
        />
      )}

      {/* Full Book Reader Modal */}
      {readingBook && (
        <BookReaderModal
          book={readingBook}
          onClose={() => setReadingBook(null)}
        />
      )}

      {/* Scientific Article Modal */}
      {selectedArticle && (
        <ArticleReaderModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
};
