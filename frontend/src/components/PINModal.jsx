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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">{t('bartenderAccess')}</h2>
        <p className="text-gray-600 text-center mb-6">{t('enterPinPrompt')}</p>
        
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
            className="w-full px-4 py-3 text-2xl text-center tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 mb-4 font-mono"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-red-500 text-white text-lg font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors"
            >
              {t('enter')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 text-lg font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
