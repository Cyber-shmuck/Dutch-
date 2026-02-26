import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Heart, CreditCard, Coffee } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

// Use the provided test key
const stripePromise = loadStripe('pk_test_51SiephFnZJaV5JWovK1T02rdHndx6SEExT3hxmFltb3dekXepHtz8owLTaZwYdwGddIUt2sF1LASblNjodEuKBW400AXQChtQw');

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useI18n();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    
    // Simulate successful payment processing since we don't have a backend Intent
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-input p-4 rounded-xl bg-white dark:bg-black/50">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#9e2146' },
          },
        }} />
      </div>
      <button 
        type="submit" 
        disabled={!stripe}
        className="w-full py-3 px-4 glass-button bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2"
      >
        <CreditCard className="w-5 h-5" />
        {t('donate.card')}
      </button>
    </form>
  );
}

export function DonateModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { t } = useI18n();
  const [success, setSuccess] = React.useState(false);

  // Reset success state when opened
  React.useEffect(() => {
    if (isOpen) setSuccess(false);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md glass rounded-3xl p-6 sm:p-8 overflow-hidden z-10"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            {success ? (
              <div className="text-center py-8">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6 text-success"
                >
                  <Heart className="w-10 h-10 fill-current" />
                </motion.div>
                <h3 className="text-3xl font-display font-bold mb-2">Thank you!</h3>
                <p className="text-muted-foreground">Your support means the world to us.</p>
                <button 
                  onClick={onClose}
                  className="mt-8 px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                    <Coffee className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">{t('donate.title')}</h2>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {t('donate.desc')}
                  </p>
                </div>

                <div className="space-y-4">
                  <a 
                    href="https://paypal.me/example" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 glass-button bg-[#0070ba] text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    {t('donate.paypal')}
                  </a>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-muted-foreground text-xs uppercase tracking-wider">OR</span>
                    </div>
                  </div>

                  <Elements stripe={stripePromise}>
                    <CheckoutForm onSuccess={() => setSuccess(true)} />
                  </Elements>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
