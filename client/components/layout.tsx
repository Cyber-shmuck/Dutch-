import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { BookA, GraduationCap, Languages, Sun, Moon, Globe, Heart, Search, LogOut } from 'lucide-react';
import { useI18n, langLabels } from '@/lib/i18n';
import { DonateModal } from './donate-modal';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { lang, toggleLang, t } = useI18n();
  const [isDark, setIsDark] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  const navItems = [
    { href: '/words', icon: BookA, label: t('nav.words') },
    { href: '/rules', icon: GraduationCap, label: t('nav.rules') },
    { href: '/verbs', icon: Languages, label: t('nav.verbs') },
    { href: '/context', icon: Search, label: t('nav.context') },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative z-0">
      {/* Ambient Blobs */}
      <div className="fixed top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-[-1]"></div>
      <div className="fixed top-0 -right-4 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 z-[-1]"></div>
      <div className="fixed -bottom-8 left-20 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 z-[-1]"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r min-h-screen p-6 sticky top-0">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl dutch-flag Dutch-flag-shadow flex flex-col overflow-hidden shadow-lg shadow-primary/20 border border-white/20">
              <div className="flex-1 bg-[#AE1C28]"></div>
              <div className="flex-1 bg-[#FFFFFF]"></div>
              <div className="flex-1 bg-[#21468B]"></div>
            </div>
            <h1 className="font-display font-black text-3xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 drop-shadow-sm">
              Dutch
            </h1>
          </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (location === '/' && item.href === '/words');
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                  : "text-muted-foreground hover:bg-white/50 dark:hover:bg-black/30 hover:text-foreground"
              )}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/50 dark:bg-white/[0.06]">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {(user.nickname || user.email || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.nickname || user.email || 'User'}</p>
              </div>
              <button
                onClick={() => logout()}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                title={t('auth.logout')}
                data-testid="button-logout-sidebar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <button 
              onClick={toggleTheme}
              className="flex-1 py-3 px-4 glass rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title={t('theme.toggle')}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={toggleLang}
              className="flex-1 py-3 px-4 glass rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
              title={t('lang.toggle')}
            >
              <Globe className="w-4 h-4 mr-2" />
              {langLabels[lang]}
            </button>
            <button 
              onClick={() => setIsDonateOpen(true)}
              className="p-3 px-4 glass rounded-xl flex items-center justify-center text-rose-500 hover:scale-110 transition-transform active:scale-95 shadow-sm"
              title={t('donate.button')}
            >
              <Heart className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative min-h-screen pb-20 md:pb-0">
        {/* Mobile Header */}
        <header className={cn(
          "md:hidden sticky top-0 z-40 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between",
          isDark
            ? "glass-panel border-b"
            : "glass-panel shadow-sm"
        )}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg dutch-flag flex flex-col overflow-hidden shadow-md border border-white/10">
              <div className="flex-1 bg-[#AE1C28]"></div>
              <div className="flex-1 bg-[#FFFFFF]"></div>
              <div className="flex-1 bg-[#21468B]"></div>
            </div>
            <h1 className="font-display font-black text-xl tracking-tight">Dutch</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDonateOpen(true)}
              className="p-2 glass rounded-lg text-rose-500 hover:scale-110 transition-all active:scale-95"
              title={t('donate.button')}
              data-testid="button-donate-header"
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>
            <button onClick={toggleLang} className="p-2 glass rounded-lg text-xs font-bold transition-colors" data-testid="button-lang-header">
              {langLabels[lang]}
            </button>
            <button onClick={toggleTheme} className="p-2 glass rounded-lg transition-colors" data-testid="button-theme-header">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => logout()} className="p-2 glass rounded-lg text-muted-foreground hover:text-foreground transition-colors" title={t('auth.logout')} data-testid="button-logout-header">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          {!isDark && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]"></div>
          )}
        </header>

        <div className="flex-1 p-4 sm:p-6 md:p-10 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/20 z-40" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        <div className="flex justify-around items-center pt-3 px-2 pb-0">
          {navItems.map((item) => {
            const isActive = location === item.href || (location === '/' && item.href === '/words');
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex flex-col items-center p-2 rounded-xl min-w-[4.5rem] transition-all",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
                <div className={cn("p-1.5 rounded-lg mb-1", isActive && "bg-primary/10")}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <DonateModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />
    </div>
  );
}
