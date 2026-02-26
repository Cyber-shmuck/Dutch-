import { useState } from 'react';
import { useRules, useCreateRule } from '@/hooks/use-rules';
import { useI18n } from '@/lib/i18n';
import { Plus, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-[#34A853]/15 text-[#34A853] border-[#34A853]/30',
  A2: 'bg-[#FBBC05]/15 text-[#b8860b] border-[#FBBC05]/30',
  B1: 'bg-[#4285F4]/15 text-[#4285F4] border-[#4285F4]/30',
  B2: 'bg-[#EA4335]/15 text-[#EA4335] border-[#EA4335]/30',
};

const LEVEL_ACCENT: Record<string, string> = {
  A1: 'border-l-[#34A853]',
  A2: 'border-l-[#FBBC05]',
  B1: 'border-l-[#4285F4]',
  B2: 'border-l-[#EA4335]',
};

export default function RulesPage() {
  const { data: rules = [], isLoading } = useRules();
  const { mutate: createRule, isPending: isCreating } = useCreateRule();
  const { t, lang } = useI18n();

  const getRuleTitle = (rule: any) => {
    if (lang === 'en' && rule.titleEn) return rule.titleEn;
    if (lang === 'uk' && rule.titleUk) return rule.titleUk;
    return rule.title;
  };

  const getRuleExplanation = (rule: any) => {
    if (lang === 'en' && rule.explanationEn) return rule.explanationEn;
    if (lang === 'uk' && rule.explanationUk) return rule.explanationUk;
    return rule.explanation;
  };

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', explanation: '', difficulty: 'A1' });
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  const filteredRules = levelFilter
    ? rules.filter(r => r.difficulty === levelFilter)
    : rules;

  const getDifficultyColor = (diff: string) => LEVEL_COLORS[diff] || 'bg-primary/10 text-primary border-primary/20';
  const getAccentColor = (diff: string) => LEVEL_ACCENT[diff] || 'border-l-primary';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.explanation) return;
    createRule(formData, {
      onSuccess: () => {
        setFormData({ title: '', explanation: '', difficulty: 'A1' });
        setIsAddModalOpen(false);
      }
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold">{t('nav.rules')}</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-10 h-10 sm:w-auto sm:px-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 glass-button shadow-primary/25 shadow-lg"
          data-testid="button-add-rule"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">{t('rules.add')}</span>
        </button>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setLevelFilter(null)}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all",
            !levelFilter ? "bg-foreground text-background border-foreground" : "bg-white dark:bg-white/[0.18] text-muted-foreground border-transparent hover:bg-black/5 dark:hover:bg-white/[0.25] shadow-sm"
          )}
          data-testid="button-filter-all"
        >
          All
        </button>
        {['A1', 'A2', 'B1', 'B2'].map(lvl => (
          <button
            key={lvl}
            onClick={() => setLevelFilter(levelFilter === lvl ? null : lvl)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all",
              levelFilter === lvl ? getDifficultyColor(lvl) : "bg-white dark:bg-white/[0.18] text-muted-foreground border-transparent hover:bg-black/5 dark:hover:bg-white/[0.25] shadow-sm"
            )}
            data-testid={`button-filter-${lvl}`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filteredRules.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/[0.18] rounded-3xl shadow-sm">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-muted-foreground text-lg">{t('rules.empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRules.map(rule => (
            <motion.div
              key={rule.id}
              layout
              className={cn(
                "bg-white dark:bg-white/[0.18] rounded-2xl overflow-hidden transition-all duration-300 border-l-4 shadow-sm",
                getAccentColor(rule.difficulty),
                expandedId === rule.id && "shadow-lg"
              )}
            >
              <button 
                onClick={() => setExpandedId(expandedId === rule.id ? null : rule.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                data-testid={`button-rule-${rule.id}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0", getDifficultyColor(rule.difficulty))}>
                    {rule.difficulty}
                  </div>
                  <h3 className="text-base font-display font-semibold truncate">{getRuleTitle(rule)}</h3>
                </div>
                <motion.div animate={{ rotate: expandedId === rule.id ? 180 : 0 }} className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 shrink-0 ml-2">
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {expandedId === rule.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-2 border-t border-white/10 dark:border-white/5 mt-1">
                      <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium">
                        {getRuleExplanation(rule)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 z-10 shadow-xl">
              <h2 className="text-2xl font-display font-bold mb-6">{t('rules.add')}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('rules.title')}</label>
                  <input autoFocus required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 glass-input rounded-xl" placeholder="e.g. Present Perfect" data-testid="input-rule-title" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('rules.difficulty')}</label>
                  <div className="flex gap-2">
                    {['A1', 'A2', 'B1', 'B2'].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setFormData({...formData, difficulty: lvl})}
                        className={cn(
                          "flex-1 py-2 rounded-xl font-bold text-sm transition-all border",
                          formData.difficulty === lvl ? getDifficultyColor(lvl) : "bg-white dark:bg-white/[0.18] text-muted-foreground border-transparent shadow-sm"
                        )}
                        data-testid={`button-difficulty-${lvl}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('rules.explanation')}</label>
                  <textarea required rows={5} value={formData.explanation} onChange={e => setFormData({...formData, explanation: e.target.value})} className="w-full p-3 glass-input rounded-xl resize-none" placeholder="Explain the rule here..." data-testid="input-rule-explanation" />
                </div>
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 px-4 bg-gray-100 dark:bg-white/[0.18] rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-white/[0.25] transition-colors" data-testid="button-cancel">
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
