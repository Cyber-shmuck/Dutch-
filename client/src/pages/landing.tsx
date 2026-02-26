import { useState } from 'react';
import { BookA, GraduationCap, Languages, Search, ArrowRight, Mail, ChevronLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

type AuthView = 'landing' | 'register' | 'login';

function AuthForm({ mode, onSwitch, onBack }: { mode: 'register' | 'login'; onSwitch: () => void; onBack: () => void }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const url = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'register'
        ? { email, password, nickname }
        : { email, password };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Something went wrong');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('auth.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-[-1]"></div>
      <div className="fixed top-0 -right-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 z-[-1]"></div>
      <div className="fixed -bottom-8 left-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 z-[-1]"></div>

      <header className="w-full px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          data-testid="button-auth-back"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('auth.back')}
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex flex-col overflow-hidden shadow-xl border border-white/20 mb-5">
              <div className="flex-1 bg-[#AE1C28]"></div>
              <div className="flex-1 bg-[#FFFFFF]"></div>
              <div className="flex-1 bg-[#21468B]"></div>
            </div>
            <h1 className="font-display font-black text-3xl tracking-tight mb-2">Dutch</h1>
            <p className="text-muted-foreground text-sm text-center">
              {mode === 'register' ? t('auth.createAccount') : t('auth.welcomeBack')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">{t('auth.nickname')}</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t('auth.nicknamePlaceholder')}
                  required
                  minLength={1}
                  className="w-full px-4 py-3 rounded-xl border border-border/60 bg-white dark:bg-white/[0.06] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-[15px]"
                  data-testid="input-nickname"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground/80">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-border/60 bg-white dark:bg-white/[0.06] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-[15px]"
                data-testid="input-email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground/80">{t('auth.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? t('auth.passwordMin') : t('auth.passwordPlaceholder')}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border/60 bg-white dark:bg-white/[0.06] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-[15px]"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-[15px] shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
              data-testid="button-submit-auth"
            >
              {mutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  {mode === 'register' ? t('auth.register') : t('auth.login')}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'register' ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
              <button
                onClick={onSwitch}
                className="text-primary font-medium hover:underline"
                data-testid="button-switch-auth"
              >
                {mode === 'register' ? t('auth.login') : t('auth.register')}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LandingPage() {
  const { t } = useI18n();
  const [view, setView] = useState<AuthView>('landing');

  if (view === 'register' || view === 'login') {
    return (
      <AuthForm
        mode={view}
        onSwitch={() => setView(view === 'register' ? 'login' : 'register')}
        onBack={() => setView('landing')}
      />
    );
  }

  const features = [
    {
      icon: BookA,
      title: t('landing.feature1.title'),
      desc: t('landing.feature1.desc'),
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      icon: GraduationCap,
      title: t('landing.feature2.title'),
      desc: t('landing.feature2.desc'),
      gradient: 'from-emerald-500 to-teal-400',
    },
    {
      icon: Languages,
      title: t('landing.feature3.title'),
      desc: t('landing.feature3.desc'),
      gradient: 'from-orange-500 to-amber-400',
    },
    {
      icon: Search,
      title: t('landing.feature4.title'),
      desc: t('landing.feature4.desc'),
      gradient: 'from-purple-500 to-pink-400',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-[-1]"></div>
      <div className="fixed top-0 -right-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 z-[-1]"></div>
      <div className="fixed -bottom-8 left-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 z-[-1]"></div>

      <header className="w-full px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex flex-col overflow-hidden shadow-lg border border-white/20">
            <div className="flex-1 bg-[#AE1C28]"></div>
            <div className="flex-1 bg-[#FFFFFF]"></div>
            <div className="flex-1 bg-[#21468B]"></div>
          </div>
          <h1 className="font-display font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70">
            Dutch
          </h1>
        </div>
        <button
          onClick={() => setView('login')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          data-testid="button-login-header"
        >
          {t('auth.login')}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            A1 — B2 CEFR
          </div>
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] mb-6">
            {t('landing.hero.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
            {t('landing.hero.subtitle')}
          </p>
          <button
            onClick={() => setView('register')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-2xl font-semibold text-base shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            data-testid="button-register-hero"
          >
            {t('landing.hero.cta')}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative p-5 rounded-2xl bg-white dark:bg-white/[0.08] border border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display font-bold text-base mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-muted-foreground">
        <p>{t('landing.footer')}</p>
      </footer>
    </div>
  );
}
