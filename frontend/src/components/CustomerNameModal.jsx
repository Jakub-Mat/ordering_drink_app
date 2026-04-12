import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Modal for customer name entry
 */
export default function CustomerNameModal({ onSubmit }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('pleaseEnterName'));
      return;
    }
    onSubmit(name.trim());
  };

  return (
    <div className="fixed inset-0 bg-brand-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-brand-ghost rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-brand-black">{t('startOrdering')}</h2>
        <p className="text-brand-slate text-center mb-6">{t('enterNamePrompt')}</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t('yourNamePlaceholder')}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            className="w-full px-4 py-3 text-lg border-2 border-brand-slate rounded-lg focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 mb-4"
            autoFocus
          />
          {error && <p className="text-brand-red text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-brand-slate text-brand-ghost text-lg font-bold py-3 px-6 rounded-lg hover:bg-brand-blue transition-colors"
          >
            {t('startOrdering')}
          </button>
        </form>
      </div>
    </div>
  );
}
