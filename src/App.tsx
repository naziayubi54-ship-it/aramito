import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen as NativeSplash } from '@capacitor/splash-screen';
import { motion, AnimatePresence } from 'motion/react';
import { AuroraBackground } from './components/AuroraBackground';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { SideMenu, MenuTarget } from './components/SideMenu';
import { ReminderPopup } from './components/ReminderPopup';
import { MiniPlayer } from './components/MiniPlayer';
import { ToastContainer } from './components/Toast';
import { OnboardingModal } from './components/OnboardingModal';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './features/home/HomeScreen';
import { BreatheScreen } from './features/breathe/BreatheScreen';
import { BreathingSessionModal } from './features/breathe/BreathingSessionModal';
import { SoundsScreen } from './features/sounds/SoundsScreen';
import { MeditationPlayerScreen } from './features/sounds/MeditationPlayerScreen';
import { LibraryScreen } from './features/library/LibraryScreen';
import { ProfileScreen } from './features/profile/ProfileScreen';
import { NotificationSettingsModal } from './features/notifications/NotificationSettingsModal';
import { BREATHING_TECHNIQUES, BreathingTechnique } from './data/breathing';
import { meditationPlayer } from './services/meditationPlayer';
import { storage, AppSettings } from './services/storage';


export default function App() {
  const [currentTab, setCurrentTabRaw] = useState<TabType>('home');
  const [, startTransition] = useTransition();
  // تعویض تب با اولویت پایین: لمس نوار پایین فوراً پاسخ می‌دهد و صفحهٔ سنگین بعدش رندر می‌شود
  const setCurrentTab = useCallback((tab: TabType) => {
    startTransition(() => setCurrentTabRaw(tab));
  }, []);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const [isDarkEffective, setIsDarkEffective] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Modals & Navigation helpers
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(false);
  // اسپلش داخل برنامه: تا بارگذاری تنظیمات و حداقل زمان نمایش
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);
  const [minSplashDone, setMinSplashDone] = useState<boolean>(false);
  const [splashGone, setSplashGone] = useState<boolean>(false);
  const splashLeaving = settingsLoaded && minSplashDone;
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [reminderOpen, setReminderOpen] = useState<boolean>(false);
  const [soundsSection, setSoundsSection] = useState<{ tab: 'meditations' | 'mixer'; n: number }>({ tab: 'meditations', n: 0 });
  const [quickSessionTech, setQuickSessionTech] = useState<BreathingTechnique | null>(null);
  const [directTechId, setDirectTechId] = useState<string | null>(null);
  // پلیر تمام‌صفحه موسیقی آرامش
  const [playerTrackId, setPlayerTrackId] = useState<string | null>(null);

  const openMeditationPlayer = (trackId: string) => {
    setPlayerTrackId(trackId);
    setCurrentTab('sounds');
  };

  // Initialize settings & theme
  useEffect(() => {
    storage.getSettings().then((s) => {
      setThemeMode(s.theme);
      if (!s.onboardingCompleted) {
        setOnboardingOpen(true);
      }
      setSettingsLoaded(true);
    });
  }, []);

  // اسپلش بومی را بعد از آماده شدن اسپلش داخل برنامه برمی‌داریم تا پرش دیده نشود
  useEffect(() => {
    NativeSplash.hide({ fadeOutDuration: 200 }).catch(() => {});
    const t = setTimeout(() => setMinSplashDone(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!splashLeaving) return;
    const t = setTimeout(() => setSplashGone(true), 500);
    return () => clearTimeout(t);
  }, [splashLeaving]);

  // Compute effective dark mode
  useEffect(() => {
    const evaluateDark = () => {
      if (themeMode === 'dark') return true;
      if (themeMode === 'light') return false;
      // Auto mode: dark after 18:30 (sunset) or before 06:00
      const hour = new Date().getHours();
      const min = new Date().getMinutes();
      const totalMin = hour * 60 + min;
      return totalMin >= 18 * 60 + 30 || totalMin < 6 * 60;
    };

    const isDark = evaluateDark();
    setIsDarkEffective(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Keep the WebView below the Android status bar. CSS safe-area padding
  // handles cutouts and gesture navigation inside the web content.
  useEffect(() => {
    const syncSystemBars = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: isDarkEffective ? Style.Light : Style.Dark });
        await StatusBar.setBackgroundColor({ color: isDarkEffective ? '#0F1222' : '#F6F3EE' });
      } catch {
        // Browser preview does not expose native system-bar APIs.
      }
    };
    syncSystemBars();
  }, [isDarkEffective]);

  // Track window scroll for bottom bar compaction
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Android Hardware Back Button
  useEffect(() => {
    let listenerHandle: { remove: () => void } | null = null;
    try {
      CapApp.addListener('backButton', () => {
        if (reminderOpen) {
          setReminderOpen(false);
        } else if (menuOpen) {
          setMenuOpen(false);
        } else if (playerTrackId) {
          setPlayerTrackId(null);
        } else if (quickSessionTech) {
          setQuickSessionTech(null);
        } else if (notificationsOpen) {
          setNotificationsOpen(false);
        } else if (currentTab !== 'home') {
          setCurrentTab('home');
        } else {
          // At home, optionally let system handle back / minimize
        }
      }).then((handle) => {
        listenerHandle = handle;
      });
    } catch {}

    return () => {
      if (listenerHandle) listenerHandle.remove();
    };
  }, [reminderOpen, menuOpen, playerTrackId, quickSessionTech, notificationsOpen, currentTab]);

  const openSoundsSection = (tab: 'meditations' | 'mixer') => {
    setSoundsSection((p) => ({ tab, n: p.n + 1 }));
    setCurrentTab('sounds');
    window.scrollTo(0, 0);
  };

  const handleMenuSelect = (target: MenuTarget) => {
    setMenuOpen(false);
    switch (target.kind) {
      case 'tab':
        setDirectTechId(null);
        setCurrentTab(target.tab);
        window.scrollTo(0, 0);
        break;
      case 'music':
        openSoundsSection('meditations');
        break;
      case 'mixer':
        openSoundsSection('mixer');
        break;
      case 'quick':
        handleOpenQuickSession();
        break;
      case 'notifications':
        setNotificationsOpen(true);
        break;
    }
  };

  const handleToggleTheme = async () => {
    const modes: ('light' | 'dark' | 'auto')[] = ['auto', 'light', 'dark'];
    const next = modes[(modes.indexOf(themeMode) + 1) % modes.length];
    setThemeMode(next);
    const settings = await storage.getSettings();
    settings.theme = next;
    await storage.saveSettings(settings);
  };

  const handleOpenQuickSession = () => {
    // 1-minute Physiological Sigh for rapid autonomic reset
    const sigh = BREATHING_TECHNIQUES.find((t) => t.id === 'physiological-sigh') || BREATHING_TECHNIQUES[0];
    setQuickSessionTech(sigh);
  };

  const handleOpenBreathingFromHome = (id: string) => {
    setDirectTechId(id);
    setCurrentTab('breathe');
  };

  // خوش‌آمدگویی: صفحهٔ کاملاً مستقل و تمام‌صفحه (بدون هدر، پلیر و نوار پایین)
  if (onboardingOpen) {
    return (
      <>
        <OnboardingModal isOpen={onboardingOpen} onComplete={() => setOnboardingOpen(false)} />
        {!splashGone && <SplashScreen leaving={splashLeaving} />}
      </>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-between selection:bg-[var(--accent-sage)] selection:text-white">
      {/* Dynamic Aurora Ambient Glow Orbs */}
      <AuroraBackground />

      {/* In-app Toast Banner for Notification feedback */}
      <ToastContainer onNavigateTab={(tab) => setCurrentTab(tab)} />

      {/* Sticky Header with greeting, date & quick actions */}
      <Header
        onOpenMenu={() => setMenuOpen(true)}
        onOpenNotifications={() => setReminderOpen((v) => !v)}
        onOpenQuickSession={handleOpenQuickSession}
      >
        {/* یادآور کشویی: چسبیده به هدر، فقط یک جملهٔ روز */}
        <AnimatePresence>
          {reminderOpen && (
            <ReminderPopup
              onClose={() => setReminderOpen(false)}
              onStartQuick={() => {
                setReminderOpen(false);
                handleOpenQuickSession();
              }}
              onOpenSettings={() => {
                setReminderOpen(false);
                setCurrentTab('profile');
                window.scrollTo(0, 0);
              }}
            />
          )}
        </AnimatePresence>
      </Header>

      {/* Main Tab Screens */}
      <main className="flex-1 w-full pt-1 pb-[calc(env(safe-area-inset-bottom,0px)+9rem)]">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="w-full"
        >
          {currentTab === 'home' && (
            <HomeScreen
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenBreathingTechnique={handleOpenBreathingFromHome}
              onOpenQuickSession={handleOpenQuickSession}
            />
          )}

          {currentTab === 'breathe' && (
            <BreatheScreen initialTechniqueId={directTechId} />
          )}

          {currentTab === 'sounds' && (
            <SoundsScreen onOpenTrack={openMeditationPlayer} openSection={soundsSection} />
          )}

          {currentTab === 'library' && (
            <LibraryScreen />
          )}

          {currentTab === 'profile' && (
            <ProfileScreen
              onOpenNotifications={() => setNotificationsOpen(true)}
              onThemeChange={(newTheme) => {
                setThemeMode(newTheme);
                storage.getSettings().then((s) => {
                  s.theme = newTheme;
                  storage.saveSettings(s);
                });
              }}
              currentTheme={themeMode}
            />
          )}
        </motion.div>
      </main>

      {/* Floating MiniPlayer above TabBar */}
      <MiniPlayer
        onExpand={() => {
          if (meditationPlayer.getState().trackId) {
            setPlayerTrackId(meditationPlayer.getState().trackId);
          } else {
            setCurrentTab('sounds');
          }
        }}
        onOpenTrack={openMeditationPlayer}
      />

      {/* Floating Liquid Glass Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setDirectTechId(null);
          setCurrentTab(tab);
          window.scrollTo(0, 0);
        }}
        onOpenMusic={() => {
          setDirectTechId(null);
          openSoundsSection('meditations');
        }}
        isScrolled={isScrolled}
      />

      {/* منوی کناری */}
      <SideMenu
        open={menuOpen}
        currentTab={currentTab}
        theme={themeMode}
        onClose={() => setMenuOpen(false)}
        onSelect={handleMenuSelect}
        onToggleTheme={handleToggleTheme}
      />

      {/* Quick Session / Breathing Player Modal */}
      {quickSessionTech && (
        <BreathingSessionModal
          technique={quickSessionTech}
          onClose={() => setQuickSessionTech(null)}
        />
      )}

      {/* Notifications Management Modal */}
      {notificationsOpen && (
        <NotificationSettingsModal
          onClose={() => setNotificationsOpen(false)}
        />
      )}

      {/* پلیر تمام‌صفحه موسیقی آرامش */}
      {playerTrackId && (
        <MeditationPlayerScreen
          trackId={playerTrackId}
          onClose={() => setPlayerTrackId(null)}
          onOpenTrack={(id) => setPlayerTrackId(id)}
        />
      )}

      {/* اسپلش اولیه با لوگوی برنامه */}
      {!splashGone && <SplashScreen leaving={splashLeaving} />}
    </div>
  );
}
