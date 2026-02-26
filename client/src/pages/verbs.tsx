import React, { useState } from 'react';
import { useVerbs, useCreateVerb, useUpdateVerb } from '@/hooks/use-verbs';
import { Flashcard } from '@/components/flashcard';
import { useI18n } from '@/lib/i18n';
import { Plus, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function VerbsPage() {
  const { data: verbs = [], isLoading } = useVerbs();
  const { mutate: createVerb, isPending: isCreating } = useCreateVerb();
  const { mutate: updateVerb } = useUpdateVerb();
  const { t } = useI18n();

  const [mode, setMode] = useState<'study' | 'table'>('study');
  const [studyIndex, setStudyIndex] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    infinitive: '', pastSingular: '', pastParticiple: '', translation: '', example: ''
  });

  const unlearnedVerbs = verbs.filter(v => !v.isLearned);
  const studyVerb = unlearnedVerbs[studyIndex % (unlearnedVerbs.length || 1)];

  const toggleLearned = (id: number, currentStatus: boolean) => {
    updateVerb({ id, updates: { isLearned: !currentStatus } });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVerb(formData, {
      onSuccess: () => {
        setFormData({ infinitive: '', pastSingular: '', pastParticiple: '', translation: '', example: '' });
        setIsAddModalOpen(false);
      }
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setMode('study')}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all",
            mode === 'study' ? "bg-foreground text-background border-foreground" : "bg-white dark:bg-white/[0.18] text-muted-foreground border-transparent hover:bg-black/5 dark:hover:bg-white/[0.25] shadow-sm"
          )}
          data-testid="button-mode-study"
        >
          {t('verbs.study')}
        </button>
        <button
          onClick={() => setMode('table')}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all",
            mode === 'table' ? "bg-foreground text-background border-foreground" : "bg-white dark:bg-white/[0.18] text-muted-foreground border-transparent hover:bg-black/5 dark:hover:bg-white/[0.25] shadow-sm"
          )}
          data-testid="button-mode-table"
        >
          {t('verbs.table')}
        </button>
      </div>

      <div className="space-y-12">
        {mode === 'study' ? (
          <div className="max-w-2xl mx-auto w-full">
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : unlearnedVerbs.length > 0 ? (
              <motion.div
                key={studyVerb.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <Flashcard 
                  speakText={studyVerb.infinitive}
                  className=""
                  front={
                    <div className="w-full flex flex-col items-center">
                      <h2 className="text-4xl sm:text-5xl font-display font-bold mb-8 google-text-blue">{studyVerb.infinitive}</h2>
                      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center text-lg font-medium bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
                        <div className="flex-1 text-center"><span className="text-muted-foreground text-sm block mb-1">Past</span>{studyVerb.pastSingular}</div>
                        <div className="hidden sm:block w-px bg-border"></div>
                        <div className="flex-1 text-center"><span className="text-muted-foreground text-sm block mb-1">Participle</span>{studyVerb.pastParticiple}</div>
                      </div>
                    </div>
                  }
                  back={
                    <div className="space-y-6">
                      <h2 className="text-3xl font-display font-bold text-foreground">{studyVerb.translation}</h2>
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-lg italic font-medium">"{studyVerb.example}"</p>
                      </div>
                    </div>
                  }
                />
                <div className="mt-8 flex justify-center gap-4">
                  <button onClick={() => setStudyIndex(prev => prev + 1)} className="flex-1 sm:flex-none px-8 py-3 bg-white dark:bg-white/[0.18] rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/[0.25] transition-colors shadow-sm">
                    Next Verb
                  </button>
                  <button onClick={() => { toggleLearned(studyVerb.id, false); setStudyIndex(prev => prev + 1); }} className="flex-1 sm:flex-none px-8 py-3 bg-google-green text-white rounded-xl font-medium hover:opacity-90 transition-colors shadow-lg shadow-google-green/20">
                    Mark Learned
                  </button>
                </div>
              </motion.div>
            ) : (
               <div className="text-center p-8 bg-white dark:bg-white/[0.18] rounded-3xl w-full shadow-sm">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-2xl font-display font-bold mb-2">All Caught Up!</h2>
                <p className="text-muted-foreground">You've marked all verbs as learned.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold px-2">{t('verbs.table')}</h3>
            <div className="bg-white dark:bg-white/[0.18] rounded-3xl overflow-hidden w-full overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/20 dark:border-white/10 bg-black/5 dark:bg-white/5 text-muted-foreground text-xs uppercase tracking-widest">
                    <th className="p-4 font-bold">{t('verbs.infinitive')}</th>
                    <th className="p-4 font-bold">Past Forms</th>
                    <th className="p-4 font-bold">{t('words.translation')}</th>
                    <th className="p-4 font-bold w-24 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 dark:divide-white/5">
                  {verbs.map(verb => (
                    <tr key={verb.id} className={cn("transition-colors", verb.isLearned ? "bg-google-green/10 dark:bg-google-green/20" : "hover:bg-black/5 dark:hover:bg-white/5")}>
                      <td className="p-4 font-bold font-display text-lg google-text-blue">{verb.infinitive}</td>
                      <td className="p-4">
                        <div className="font-medium">{verb.pastSingular}</div>
                        <div className="text-sm text-muted-foreground">{verb.pastParticiple}</div>
                      </td>
                      <td className="p-4 font-medium">{verb.translation}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => toggleLearned(verb.id, verb.isLearned)}
                          className={cn("p-2 rounded-full transition-all hover:scale-110", verb.isLearned ? "google-text-green" : "text-muted-foreground")}
                          title={verb.isLearned ? t('verbs.markUnlearned') : t('verbs.markLearned')}
                        >
                          {verb.isLearned ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6 opacity-40" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>


      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 z-10 my-auto shadow-xl">
              <h2 className="text-2xl font-display font-bold mb-6">{t('verbs.add')}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5">{t('verbs.infinitive')}</label>
                    <input autoFocus required value={formData.infinitive} onChange={e => setFormData({...formData, infinitive: e.target.value})} className="w-full p-3 glass-input rounded-xl" placeholder="e.g. spreken" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t('verbs.pastSingular')}</label>
                    <input required value={formData.pastSingular} onChange={e => setFormData({...formData, pastSingular: e.target.value})} className="w-full p-3 glass-input rounded-xl" placeholder="e.g. sprak" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t('verbs.pastParticiple')}</label>
                    <input required value={formData.pastParticiple} onChange={e => setFormData({...formData, pastParticiple: e.target.value})} className="w-full p-3 glass-input rounded-xl" placeholder="e.g. gesproken" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5">{t('words.translation')}</label>
                    <input required value={formData.translation} onChange={e => setFormData({...formData, translation: e.target.value})} className="w-full p-3 glass-input rounded-xl" placeholder="e.g. to speak" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5">{t('verbs.example')}</label>
                    <input required value={formData.example} onChange={e => setFormData({...formData, example: e.target.value})} className="w-full p-3 glass-input rounded-xl" placeholder="e.g. Hij sprak Nederlands." />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 px-4 bg-gray-100 dark:bg-white/[0.18] rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-white/[0.25] transition-colors">
                    {t('common.cancel')}
                  </button>
                  <button type="submit" disabled={isCreating} className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium glass-button shadow-lg shadow-primary/30">
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
