import { useState, useCallback, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Search, Loader2, X as XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { playTTS } from '@/lib/utils';

interface ContextResult {
  id: number;
  dutch: string;
  english: string;
  level: string | null;
}

const queryCache = new Map<string, ContextResult[]>();

export default function ContextPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContextResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    if (queryCache.has(trimmed)) {
      setResults(queryCache.get(trimmed)!);
      setHasSearched(true);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/context?q=${encodeURIComponent(trimmed)}`);
      const data: ContextResult[] = await res.json();
      queryCache.set(trimmed, data);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 350);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const highlightWord = (text: string, q: string) => {
    if (!q.trim()) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <span key={i} className="text-[#4285F4] font-bold">{part}</span>
        : part
    );
  };

  const levelColor = (lvl: string | null) => {
    switch (lvl) {
      case 'A1': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
      case 'A2': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
      case 'B1': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
      case 'B2': return 'bg-red-500/15 text-red-600 dark:text-red-400';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full">
      <div className="sticky top-0 z-10 pb-4 pt-1">
        <div
          className={cn(
            "relative flex items-center rounded-2xl transition-all duration-300",
            "bg-white dark:bg-white/[0.18]",
            "shadow-sm dark:shadow-none",
            "border border-black/[0.04] dark:border-white/[0.15]",
          )}
        >
          <div className="absolute left-4 text-black/30 dark:text-white/30 pointer-events-none">
            {isSearching
              ? <Loader2 className="w-[18px] h-[18px] animate-spin" />
              : <Search className="w-[18px] h-[18px]" />}
          </div>
          <input
            ref={inputRef}
            data-testid="input-context-search"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            className={cn(
              "w-full bg-transparent py-3 pl-11 pr-10 text-[16px] font-normal rounded-2xl",
              "text-foreground placeholder:text-black/30 dark:placeholder:text-white/30",
              "outline-none border-none focus:ring-0",
            )}
            placeholder={t('context.placeholder')}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                data-testid="button-clear-search"
                type="button"
                onClick={handleClear}
                className="absolute right-3 p-1 rounded-full bg-black/10 dark:bg-white/15 active:scale-90 transition-transform"
              >
                <XIcon className="w-3.5 h-3.5 text-black/50 dark:text-white/50" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-10">
        <AnimatePresence mode="popLayout">
          {isSearching && results.length === 0 ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-3"
            >
              <Loader2 className="w-7 h-7 animate-spin text-black/15 dark:text-white/15" />
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <p className="text-xs font-medium text-black/30 dark:text-white/30 uppercase tracking-widest px-1 mb-3">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((res, i) => (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.02 }}
                  onClick={() => playTTS(res.dutch)}
                  className={cn(
                    "bg-white dark:bg-white/[0.14] rounded-2xl p-4 cursor-pointer",
                    "border border-black/[0.04] dark:border-white/[0.12]",
                    "active:scale-[0.98] transition-all duration-150",
                    "hover:bg-black/[0.02] dark:hover:bg-white/[0.2]",
                  )}
                  data-testid={`card-context-result-${res.id}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="text-[15px] leading-relaxed font-medium text-foreground">
                      {highlightWord(res.dutch, query)}
                    </p>
                    {res.level && (
                      <span className={cn(
                        "shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                        levelColor(res.level)
                      )}>
                        {res.level}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-black/40 dark:text-white/40 leading-relaxed">
                    {res.english}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          ) : hasSearched && !isSearching ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-black/[0.03] dark:bg-white/[0.1] flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-black/15 dark:text-white/25" />
              </div>
              <p className="text-sm font-medium text-black/40 dark:text-white/40 max-w-[240px]">
                {t('context.empty')}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-black/[0.03] dark:bg-white/[0.1] flex items-center justify-center mb-5">
                <Search className="w-9 h-9 text-black/10 dark:text-white/20" />
              </div>
              <p className="text-sm font-medium text-black/25 dark:text-white/20 max-w-[220px] leading-relaxed">
                Search for a Dutch word to see it used in context
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
