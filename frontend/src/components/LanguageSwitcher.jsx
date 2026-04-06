import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'cs', label: 'Čeština' },
  { code: 'en', label: 'English' },
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language?.split('-')[0] ?? 'cs';

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-300">{t('language')}:</span>
      <div className="inline-flex rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => i18n.changeLanguage(language.code)}
            disabled={currentLanguage === language.code}
            className={`px-3 py-1 text-xs font-semibold transition-colors ${
              currentLanguage === language.code
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {language.label}
          </button>
        ))}
      </div>
    </div>
  );
}
