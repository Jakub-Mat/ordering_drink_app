import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

/**
 * Navigation Sidebar Component - Hamburger menu for mobile/desktop navigation
 */
export default function Navigation({ 
  isOpen, 
  onClose, 
  customerName, 
  currentPage, 
  onNavigate, 
  onLogout 
}) {
  const { t } = useTranslation();

  const navItems = [
    { id: 'menu', label: t('drinkMenu') },
    { id: 'orders', label: t('yourOrders') }
  ];

  return (
    <>
      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-brand-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-brand-ghost shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0 lg:static lg:w-72 lg:border-l-2 lg:border-brand-slate/20`}
      >
        <div className="relative flex flex-col h-full p-6 space-y-6">
          {/* Close Button - Mobile */}
          <button
            onClick={onClose}
            className="lg:hidden absolute right-4 top-4 text-brand-black p-2 hover:bg-brand-slate/10 rounded-lg transition-colors"
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

          {/* User Info */}
          <div className="border-b-2 border-brand-slate pb-4 pr-12 lg:pr-0">
            <h3 className="text-lg font-bold text-brand-black">{customerName}</h3>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
                  currentPage === item.id
                    ? 'bg-brand-blue text-brand-ghost'
                    : 'text-brand-black hover:bg-brand-slate hover:text-brand-ghost'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Language and Logout */}
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
