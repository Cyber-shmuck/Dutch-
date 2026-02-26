import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useWords, useCreateWord, useUpdateWord, useDeleteWord } from '@/hooks/use-words';
import { Flashcard } from '@/components/flashcard';
import { useI18n } from '@/lib/i18n';
import { Check, X as XIcon, Plus, Loader2, List, Volume2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playTTS, cn } from '@/lib/utils';

const translateCache = new Map<string, { en: string; ru: string; uk: string }>();

export default function WordsPage() {
  const { data: words = [], isLoading } = useWords();
  const { mutate: createWord, isPending: isCreating } = useCreateWord();
  const { mutate: updateWord } = useUpdateWord();
  const { mutate: deleteWord } = useDeleteWord();
  const { t, lang } = useI18n();

  const [mode, setMode] = useState<'new' | 'my' | 'learned' | 'review'>('new');
  const [levelFilter, setLevelFilter] = useState<'A1' | 'A2' | 'B1' | 'B2'>('A1');
  const [learnedLevelFilter, setLearnedLevelFilter] = useState<'A1' | 'A2' | 'B1' | 'B2'>('A1');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({ dutch: '', translationRu: '', translationEn: '', translationUk: '' });
  const [isTranslating, setIsTranslating] = useState(false);
  const [repeatSubMode, setRepeatSubMode] = useState<'weak' | 'list'>('weak');
  const [showRepeatList, setShowRepeatList] = useState(false);
  const [manualEdit, setManualEdit] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTranslation = useCallback(async (word: string) => {
    const normalized = word.trim().toLowerCase();
    if (normalized.length < 2) return;

    if (translateCache.has(normalized)) {
      const cached = translateCache.get(normalized)!;
      if (!manualEdit) {
        setFormData(prev => ({
          ...prev,
          ...(cached.ru ? { translationRu: cached.ru } : {}),
          ...(cached.en ? { translationEn: cached.en } : {}),
          ...(cached.uk ? { translationUk: cached.uk } : {}),
        }));
      }
      return;
    }

    if (!manualEdit) setIsTranslating(true);

    try {
      const res = await fetch(`/api/translate?word=${encodeURIComponent(normalized)}`);
      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json() as { en: string; ru: string; uk: string };
      translateCache.set(normalized, data);
      if (!manualEdit) {
        setFormData(prev => ({
          ...prev,
          ...(data.ru ? { translationRu: data.ru } : {}),
          ...(data.en ? { translationEn: data.en } : {}),
          ...(data.uk ? { translationUk: data.uk } : {}),
        }));
      }
    } catch {
    } finally {
      setIsTranslating(false);
    }
  }, [manualEdit]);

  const handleDutchChange = (val: string) => {
    setFormData(prev => ({ ...prev, dutch: val }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTranslation(val);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const filteredWords = words.filter(w => {
    if (mode === 'new') {
      const isBaseword = !w.isUserAdded;
      return isBaseword && !w.isLearned && w.level === levelFilter;
    }
    if (mode === 'my') return w.isUserAdded && !w.isLearned && w.knownCount === 0;
    if (mode === 'learned') return w.isLearned && w.level === learnedLevelFilter;
    if (mode === 'review') {
      if (repeatSubMode === 'weak') {
        return !w.isLearned && w.wrongCount > 0;
      }
      return !w.isLearned && w.inRepeatList;
    }
    return true;
  }).sort((a, b) => (a.dutch || '').localeCompare(b.dutch || ''));
  
  const currentWord = filteredWords[currentIndex];

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleKnow = () => {
    if (!currentWord || isAnimating) return;
    setIsAnimating(true);

    if (mode === 'review') {
      const newRepeatCount = (currentWord.repeatKnownCount || 0) + 1;
      const graduated = newRepeatCount >= 5;
      updateWord({
        id: currentWord.id,
        updates: {
          repeatKnownCount: newRepeatCount,
          ...(graduated ? { isLearned: true, inRepeatList: false } : {}),
        }
      }, {
        onSuccess: () => {
          handleNext();
          setIsAnimating(false);
        },
        onError: () => setIsAnimating(false),
      });
    } else {
      updateWord({ 
        id: currentWord.id, 
        updates: { isLearned: true } 
      }, {
        onSuccess: () => {
          handleNext();
          setIsAnimating(false);
        },
        onError: () => setIsAnimating(false),
      });
    }
  };

  const handleDontKnow = () => {
    if (!currentWord || isAnimating) return;

    if (mode === 'new' || mode === 'my') {
      setIsAnimating(true);
      updateWord({
        id: currentWord.id,
        updates: {
          wrongCount: (currentWord.wrongCount || 0) + 1,
        }
      }, {
        onSuccess: () => {
          handleNext();
          setIsAnimating(false);
        },
        onError: () => {
          handleNext();
          setIsAnimating(false);
        },
      });
    } else if (mode === 'review') {
      setIsAnimating(true);
      updateWord({
        id: currentWord.id,
        updates: {
          wrongCount: (currentWord.wrongCount || 0) + 1,
          repeatKnownCount: 0,
        }
      }, {
        onSuccess: () => {
          handleNext();
          setIsAnimating(false);
        },
        onError: () => {
          handleNext();
          setIsAnimating(false);
        },
      });
    } else {
      handleNext();
    }
  };

  const handleUndoLearned = (wordId: number) => {
    updateWord({
      id: wordId,
      updates: {
        isLearned: false,
        knownCount: 0,
        repeatKnownCount: 0,
      }
    });
  };

  const handleSubmitRepeatWord = (e: React.FormEvent) => {
    e.preventDefault();
    const currentTranslation = lang === 'ru' ? formData.translationRu : lang === 'uk' ? formData.translationUk : formData.translationEn;
    if (!formData.dutch || !currentTranslation) return;
    const submitData = {
      dutch: formData.dutch,
      translationRu: formData.translationRu || '',
      translationEn: formData.translationEn || '',
      translationUk: formData.translationUk || '',
      translation: currentTranslation,
      isUserAdded: true,
      level: 'Custom',
      inRepeatList: true,
    };
    createWord(submitData, {
      onSuccess: () => {
        setFormData({ dutch: '', translationRu: '', translationEn: '', translationUk: '' });
        setManualEdit(false);
        setIsAddModalOpen(false);
      }
    });
  };

  const renderLearnedList = () => {
    return (
      <div className="w-full space-y-8">
        <div className="flex justify-center gap-3 mb-6">
          {(['A1', 'A2', 'B1', 'B2'] as const).map((lvl, idx) => {
            const levelClasses = ['level-a1', 'level-a2', 'level-b1', 'level-b2'];
            const isActive = learnedLevelFilter === lvl;
            return (
              <motion.button
                key={lvl}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setLearnedLevelFilter(lvl); }}
                className={cn(
                  "level-button",
                  levelClasses[idx],
                  isActive ? "scale-110 shadow-[0_0_16px_rgba(255,255,255,0.25)]" : "hover:scale-105"
                )}
              >
                {lvl}
              </motion.button>
            );
          })}
        </div>

        {filteredWords.length === 0 ? (
          <div className="text-center p-12 glass rounded-3xl w-full">
            <div className="text-6xl mb-4" data-testid="text-learned-empty-icon">📚</div>
            <h2 className="text-2xl font-display font-bold mb-2" data-testid="text-learned-empty">No learned words in {learnedLevelFilter} yet</h2>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWords.map((word) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-2xl flex items-center justify-between group hover:shadow-lg transition-all"
                data-testid={`card-learned-word-${word.id}`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-display font-black text-foreground">{word.dutch}</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                      {word.level}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-medium">
                    {lang === 'ru' ? (word.translationRu || word.translationEn || word.translationUk) : lang === 'uk' ? (word.translationUk || word.translationRu || word.translationEn) : (word.translationEn || word.translationRu || word.translationUk)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => playTTS(word.dutch)}
                    className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    data-testid={`button-speak-${word.id}`}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleUndoLearned(word.id)}
                    className="px-4 py-2 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all text-sm font-bold"
                    data-testid={`button-undo-${word.id}`}
                  >
                    Undo
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderRepeatContent = () => {
    return (
      <div className="w-full">
        <div className="flex justify-center mb-8">
          <div className="segmented-control !w-auto !gap-1 !p-1.5">
            {[
              { id: 'weak' as const, label: t('words.repeatWeak') },
              { id: 'list' as const, label: t('words.repeatList') },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => { setRepeatSubMode(sub.id); setCurrentIndex(0); setShowRepeatList(false); }}
                className={cn(
                  "segment-button text-[11px] sm:text-xs !px-4 !py-2",
                  repeatSubMode === sub.id && "active"
                )}
                data-testid={`button-repeat-${sub.id}`}
              >
                <span className="tracking-tight text-center leading-none">{sub.label}</span>
              </button>
            ))}
          </div>
          
          {repeatSubMode === 'list' && (
            <div className="flex gap-2 ml-3">
              <button
                onClick={() => setShowRepeatList(!showRepeatList)}
                className={cn(
                  "px-4 py-2 rounded-xl flex items-center justify-center shadow-lg font-black hover:scale-105 transition-all active:scale-95 text-sm",
                  showRepeatList ? "bg-primary text-primary-foreground" : "bg-foreground text-background"
                )}
                data-testid="button-toggle-repeat-list"
              >
                <List className="w-4 h-4 stroke-[3px]" />
              </button>
              <button
                onClick={() => { setFormData({ dutch: '', translationRu: '', translationEn: '', translationUk: '' }); setManualEdit(false); setIsAddModalOpen(true); }}
                className="px-4 py-2 rounded-xl bg-foreground text-background flex items-center justify-center gap-2 shadow-lg font-black hover:scale-105 transition-all active:scale-95 text-sm"
                data-testid="button-add-repeat-word"
              >
                <Plus className="w-4 h-4 stroke-[4px]" />
              </button>
            </div>
          )}
        </div>

        {showRepeatList && repeatSubMode === 'list' ? (
          <motion.div
            key="repeat-list-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {filteredWords.length === 0 ? (
              <div className="text-center p-8 glass rounded-3xl w-full">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-2xl font-display font-bold mb-2">{t('words.repeatListEmpty')}</h2>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredWords.map((word) => (
                  <motion.div
                    key={word.id}
                    layout
                    className="glass rounded-2xl p-4 flex items-center justify-between"
                    data-testid={`repeat-list-item-${word.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{word.dutch}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground font-medium">
                          {word.level}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {lang === 'ru' ? (word.translationRu || word.translationEn || word.translationUk) : lang === 'uk' ? (word.translationUk || word.translationRu || word.translationEn) : (word.translationEn || word.translationRu || word.translationUk)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button
                        onClick={() => playTTS(word.dutch)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                        data-testid={`button-speak-repeat-${word.id}`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteWord(word.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                        data-testid={`button-delete-repeat-${word.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : filteredWords.length === 0 ? (
          <motion.div
            key="repeat-empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8 glass rounded-3xl w-full"
          >
            <div className="text-6xl mb-4">{repeatSubMode === 'weak' ? '💪' : '📝'}</div>
            <h2 className="text-2xl font-display font-bold mb-2" data-testid="text-repeat-empty">
              {repeatSubMode === 'weak' ? t('words.repeatWeakEmpty') : t('words.repeatListEmpty')}
            </h2>
          </motion.div>
        ) : !currentWord ? (
          <motion.div
            key="repeat-done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8 glass rounded-3xl w-full"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-display font-bold mb-2">{t('words.completed')}</h2>
            <button onClick={() => setCurrentIndex(0)} className="mt-6 px-8 py-3 bg-google-blue text-white rounded-xl font-medium shadow-lg shadow-google-blue/20 hover:opacity-90 transition-all" data-testid="button-repeat-restart">
              Start Over
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={currentWord.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-300",
                      step <= (currentWord.repeatKnownCount || 0)
                        ? "bg-emerald-500 scale-110 shadow-sm shadow-emerald-500/40"
                        : "bg-black/10 dark:bg-white/10"
                    )}
                    data-testid={`dot-progress-${step}`}
                  />
                ))}
                <span className="ml-2 text-xs font-bold text-muted-foreground">
                  {currentWord.repeatKnownCount || 0}/5
                </span>
              </div>
            </div>
            <Flashcard
              speakText={currentWord.dutch}
              className="google-card-shadow scale-105 sm:scale-110"
              onAction={(action) => {
                if (action === 'know') handleKnow();
                else handleDontKnow();
              }}
              front={
                <div className="flex flex-col items-center gap-4">
                  {currentWord.level && (
                    <span className="px-3 py-1 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold uppercase tracking-widest">
                      Level {currentWord.level}
                    </span>
                  )}
                  <h2 className="text-5xl sm:text-6xl font-display font-black google-text-blue drop-shadow-sm">{currentWord.dutch}</h2>
                </div>
              }
              back={
                <div className="space-y-6">
                  <h2 className="text-4xl sm:text-5xl font-display font-black text-foreground">
                    {lang === 'ru' ? (currentWord.translationRu || currentWord.translationEn || currentWord.translationUk) : lang === 'uk' ? (currentWord.translationUk || currentWord.translationRu || currentWord.translationEn) : (currentWord.translationEn || currentWord.translationRu || currentWord.translationUk)}
                  </h2>
                </div>
              }
            />
          </motion.div>
        )}
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentTranslation = lang === 'ru' ? formData.translationRu : lang === 'uk' ? formData.translationUk : formData.translationEn;
    if (!formData.dutch || !currentTranslation) return;
    const submitData = {
      dutch: formData.dutch,
      translationRu: formData.translationRu || '',
      translationEn: formData.translationEn || '',
      translationUk: formData.translationUk || '',
      translation: currentTranslation,
      isUserAdded: true,
      level: 'Custom',
    };
    createWord(submitData, {
      onSuccess: () => {
        setFormData({ dutch: '', translationRu: '', translationEn: '', translationUk: '' });
        setManualEdit(false);
        setIsAddModalOpen(false);
      }
    });
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 mb-8">
        <div className="segmented-control">
          {[
            { id: 'new', activeColor: '' },
            { id: 'review', activeColor: '' },
            { id: 'my', activeColor: '' },
            { id: 'learned', activeColor: '' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id as any); setCurrentIndex(0); }}
              className={cn(
                "segment-button text-[11px] sm:text-xs",
                lang === 'ru' && "segment-button-compact",
                mode === m.id && "active"
              )}
              data-testid={`button-mode-${m.id}`}
            >
              <span className="tracking-tight text-center leading-none">
                {t(`words.${m.id}`)}
              </span>
            </button>
          ))}
        </div>
        
        {mode === 'my' && (
          <button
            onClick={() => { setFormData({ dutch: '', translationRu: '', translationEn: '', translationUk: '' }); setManualEdit(false); setIsAddModalOpen(true); }}
            className="px-6 py-2 rounded-xl bg-foreground text-background flex items-center justify-center gap-2 shadow-lg font-black hover:scale-105 transition-all active:scale-95"
            data-testid="button-add-word"
          >
            <Plus className="w-4 h-4 stroke-[4px]" />
            <span className="text-sm">{t('words.add')}</span>
          </button>
        )}
      </div>

      {mode === 'new' && (
        <div className="flex justify-center gap-3 mb-10">
          {(['A1', 'A2', 'B1', 'B2'] as const).map((lvl, idx) => {
            const levelClasses = ['level-a1', 'level-a2', 'level-b1', 'level-b2'];
            const isActive = levelFilter === lvl;
            return (
              <motion.button
                key={lvl}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setLevelFilter(lvl); setCurrentIndex(0); }}
                className={cn(
                  "level-button",
                  levelClasses[idx],
                  isActive ? "scale-110 shadow-[0_0_16px_rgba(255,255,255,0.25)]" : "hover:scale-105"
                )}
                data-testid={`button-level-${lvl}`}
              >
                {lvl}
              </motion.button>
            );
          })}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {mode === 'learned' ? (
            <motion.div
              key="learned-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <h2 className="text-3xl font-display font-black mb-8 text-center">{t('words.learned')}</h2>
              {renderLearnedList()}
            </motion.div>
          ) : mode === 'review' ? (
            <motion.div
              key="review-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-center"
            >
              {renderRepeatContent()}
            </motion.div>
          ) : !currentWord ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center p-8 glass rounded-3xl w-full"
            >
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-2xl font-display font-bold mb-2">{t('words.completed')}</h2>
              <p className="text-muted-foreground">
                {filteredWords.length === 0 ? t('words.empty') : "Great job studying!"}
              </p>
              {filteredWords.length > 0 && (
                <button onClick={() => setCurrentIndex(0)} className="mt-6 px-8 py-3 bg-google-blue text-white rounded-xl font-medium shadow-lg shadow-google-blue/20 hover:opacity-90 transition-all" data-testid="button-start-over">
                  Start Over
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={currentWord.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Flashcard 
                speakText={currentWord.dutch}
                className="google-card-shadow scale-105 sm:scale-110"
                onAction={(action) => {
                  if (action === 'know') handleKnow();
                  else handleDontKnow();
                }}
                front={
                  <div className="flex flex-col items-center gap-4">
                    {currentWord.level && (
                      <span className="px-3 py-1 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold uppercase tracking-widest">
                        Level {currentWord.level}
                      </span>
                    )}
                    <h2 className="text-5xl sm:text-6xl font-display font-black google-text-blue drop-shadow-sm">{currentWord.dutch}</h2>
                  </div>
                }
                back={
                  <div className="space-y-6">
                    <h2 className="text-4xl sm:text-5xl font-display font-black text-foreground">
                      {lang === 'ru' ? (currentWord.translationRu || currentWord.translationEn || currentWord.translationUk) : lang === 'uk' ? (currentWord.translationUk || currentWord.translationRu || currentWord.translationEn) : (currentWord.translationEn || currentWord.translationRu || currentWord.translationUk)}
                    </h2>
                  </div>
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md glass rounded-3xl p-6 sm:p-8 z-10">
              <h2 className="text-2xl font-display font-bold mb-6">{t('words.add')}</h2>
              <form onSubmit={mode === 'review' && repeatSubMode === 'list' ? handleSubmitRepeatWord : handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('words.dutch')}</label>
                  <input 
                    autoFocus 
                    required 
                    value={formData.dutch} 
                    onChange={e => handleDutchChange(e.target.value)} 
                    className="w-full p-3 glass-input rounded-xl" 
                    placeholder="e.g. fiets" 
                    data-testid="input-word-dutch"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {t('words.translation')} ({lang === 'ru' ? 'RU' : lang === 'uk' ? 'UA' : 'EN'})
                  </label>
                  <div className="relative">
                    <input 
                      value={lang === 'ru' ? formData.translationRu : lang === 'uk' ? formData.translationUk : formData.translationEn} 
                      onChange={e => {
                        setManualEdit(true);
                        const val = e.target.value;
                        if (lang === 'ru') setFormData(prev => ({...prev, translationRu: val}));
                        else if (lang === 'uk') setFormData(prev => ({...prev, translationUk: val}));
                        else setFormData(prev => ({...prev, translationEn: val}));
                      }} 
                      className="w-full p-3 pr-10 glass-input rounded-xl" 
                      placeholder={lang === 'ru' ? 'напр. велосипед' : lang === 'uk' ? 'напр. велосипед' : 'e.g. bicycle'} 
                      data-testid="input-word-translation"
                    />
                    {isTranslating && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 px-4 glass rounded-xl font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors" data-testid="button-cancel">
                    {t('common.cancel')}
                  </button>
                  <button type="submit" disabled={isCreating} className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium glass-button shadow-lg shadow-primary/30" data-testid="button-save">
                    {isCreating ? t('common.creating') : t('common.save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
