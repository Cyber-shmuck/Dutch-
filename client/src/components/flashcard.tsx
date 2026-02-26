import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RefreshCw, Check, X as XIcon } from 'lucide-react';
import { playTTS, cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

interface FlashcardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  speakText?: string;
  className?: string;
  onFlip?: (flipped: boolean) => void;
  onAction?: (action: 'know' | 'dont-know') => void;
}

export function Flashcard({ front, back, speakText, className, onFlip, onAction }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useI18n();

  const handleFlip = () => {
    const newState = !isFlipped;
    setIsFlipped(newState);
    onFlip?.(newState);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (speakText) playTTS(speakText);
  };

  const handleAction = (e: React.MouseEvent, action: 'know' | 'dont-know') => {
    e.preventDefault();
    e.stopPropagation();
    if (isAnimating) return;
    
    setIsAnimating(true);
    onAction?.(action);
    
    // Reset animation lock after a short delay
    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  };

  return (
    <div className={cn("relative w-full h-[400px] perspective-1000", className)}>
      <motion.div
        className="w-full h-full relative preserve-3d cursor-pointer"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ 
          duration: 0.6, 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          mass: 1
        }}
        onClick={handleFlip}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 backface-hidden w-full h-full"
          style={{ visibility: isFlipped ? 'hidden' : 'visible' }}
        >
          <div className="w-full h-full bg-white dark:bg-white/[0.2] rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-lg border border-gray-100 dark:border-white/[0.18]">
            {speakText && (
              <button 
                onClick={handleSpeak}
                className="absolute top-6 right-6 p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors z-10"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            )}
            
            <div className="flashcard-content">
              {front}
            </div>

            {onAction && (
              <div className="card-actions absolute left-6 right-6 bottom-6 flex justify-between pointer-events-none">
                <button
                  onClick={(e) => handleAction(e, 'dont-know')}
                  className="card-btn red pointer-events-auto"
                  data-testid="button-dont-know"
                >
                  <XIcon className="w-6 h-6 stroke-[3px]" />
                </button>
                <div className="flex items-center text-muted-foreground gap-1.5 opacity-50 pointer-events-none">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{t('common.flip')}</span>
                </div>
                <button
                  onClick={(e) => handleAction(e, 'know')}
                  className="card-btn green pointer-events-auto"
                  data-testid="button-know"
                >
                  <Check className="w-6 h-6 stroke-[3px]" />
                </button>
              </div>
            )}
            
            {!onAction && (
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center text-muted-foreground gap-2 opacity-50 pointer-events-none">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">{t('common.flip')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full"
          style={{ visibility: isFlipped ? 'visible' : 'hidden' }}
        >
          <div className="w-full h-full bg-white dark:bg-white/[0.2] rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-lg border border-gray-100 dark:border-white/[0.18]">
            {speakText && (
              <button 
                onClick={handleSpeak}
                className="absolute top-6 right-6 p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors z-10"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            )}

            <div className="flashcard-content">
              {back}
            </div>

            {onAction && (
              <div className="card-actions absolute left-6 right-6 bottom-6 flex justify-between pointer-events-none">
                <button
                  onClick={(e) => handleAction(e, 'dont-know')}
                  className="card-btn red pointer-events-auto"
                  data-testid="button-dont-know-back"
                >
                  <XIcon className="w-6 h-6 stroke-[3px]" />
                </button>
                <div className="flex items-center text-muted-foreground gap-1.5 opacity-50 pointer-events-none">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{t('common.flip')}</span>
                </div>
                <button
                  onClick={(e) => handleAction(e, 'know')}
                  className="card-btn green pointer-events-auto"
                  data-testid="button-know-back"
                >
                  <Check className="w-6 h-6 stroke-[3px]" />
                </button>
              </div>
            )}

            {!onAction && (
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center text-muted-foreground gap-2 opacity-50 pointer-events-none">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">{t('common.flip')}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
