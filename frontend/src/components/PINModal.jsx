import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Modal for PIN code entry (Bartender authentication)
 */
export default function PINModal({ onSubmit, onCancel }) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError(t('pleaseEnterPin'));
      return;
    }
    onSubmit(pin);
  };

  return (
    <div className="fixed inset-0 bg-brand-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-brand-ghost rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-brand-black">{t('bartenderAccess')}</h2>
        <p className="text-brand-slate text-center mb-6">{t('enterPinPrompt')}</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder={t('pinCodePlaceholder')}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError('');
            }}
            maxLength="6"
            className="w-full px-4 py-3 text-2xl text-center tracking-widest border-2 border-brand-slate rounded-lg focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 mb-4 font-mono"
            autoFocus
          />
          {error && <p className="text-brand-red text-sm mb-4 text-center">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-brand-red text-brand-ghost text-lg font-bold py-3 px-6 rounded-lg hover:brightness-110 transition-all"
            >
              {t('enter')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-brand-slate text-brand-ghost text-lg font-bold py-3 px-6 rounded-lg hover:bg-brand-blue transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
