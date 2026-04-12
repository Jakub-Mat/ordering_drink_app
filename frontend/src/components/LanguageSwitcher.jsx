import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'cs', label: 'Čeština' },
  { code: 'en', label: 'English' },
];

export default function LanguageSwitcher({ showLabel = true }) {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language?.split('-')[0] ?? 'cs';

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-sm text-brand-slate">{t('language')}:</span>
      )}
      <div className="inline-flex rounded-full border border-brand-slate/40 bg-brand-ghost shadow-sm overflow-hidden">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => i18n.changeLanguage(language.code)}
            disabled={currentLanguage === language.code}
            className={`px-3 py-1 text-xs font-semibold transition-colors ${
              currentLanguage === language.code
                ? 'bg-brand-blue text-brand-ghost'
                : 'bg-brand-ghost text-brand-black hover:bg-brand-slate/10'
            }`}
          >
            {language.label}
          </button>
        ))}
      </div>
    </div>
  );
}
