import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function BartenderSidebar({ isOpen, onClose, onLogout }) {
  const { t } = useTranslation();

  const navItems = [
    { to: '/workflow', label: t('kanbanTitle') },
    { to: '/menu-management', label: t('menuManagement') },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-brand-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-brand-ghost z-40 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } border-l-2 border-brand-slate/20`}
      >
        <div className="relative flex h-full flex-col p-6 space-y-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-brand-black p-2 hover:bg-brand-slate/10 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="border-b-2 border-brand-slate pb-4 pr-12">
            <h3 className="text-lg font-bold text-brand-black">{t('bartenderTitle')}</h3>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `block w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-blue text-brand-ghost'
                      : 'text-brand-black hover:bg-brand-slate hover:text-brand-ghost'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t-2 border-brand-slate pt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-black mb-2">
                {t('language')}:
              </label>
              <LanguageSwitcher showLabel={false} />
            </div>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full bg-brand-red text-brand-ghost font-bold py-3 px-4 rounded-lg hover:brightness-110 transition-all"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
