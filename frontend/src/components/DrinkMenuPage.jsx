import MenuComponent from './MenuComponent';
import SectionHeader from './SectionHeader';

/**
 * Drink Menu Page - Displays menu and handles order submission
 */
export default function DrinkMenuPage({
  drinks,
  selectedDrinks,
  onToggleDrink,
  onSubmitOrder,
  submitting,
  message,
  loading,
  t
}) {
  return (
    <div className="flex-1">
      {/* Page Header */}
      <SectionHeader title={t('drinkMenu')} />

      {/* Message Alert */}
      {message && (
        <div className="mb-6 p-4 rounded-lg bg-brand-blue/10 text-brand-slate border-2 border-brand-blue">
          {message}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-brand-slate text-lg">{t('loadingMenu')}</p>
        </div>
      ) : drinks.length === 0 ? (
        <p className="text-center text-brand-slate py-8">{t('noDrinksAvailable')}</p>
      ) : (
        <div className="space-y-6">
          {/* Menu */}
          <MenuComponent
            drinks={drinks}
            selectedDrinks={selectedDrinks}
            onToggleDrink={onToggleDrink}
          />

          {/* Submit Button */}
          <div>
            <button
              onClick={onSubmitOrder}
              disabled={submitting || selectedDrinks.length === 0}
              className={`w-full font-bold py-4 px-6 rounded-lg text-lg transition-all ${
                selectedDrinks.length === 0
                  ? 'bg-brand-slate/50 text-brand-ghost cursor-not-allowed'
                  : 'bg-brand-blue text-brand-ghost hover:brightness-110 active:brightness-95'
              }`}
            >
              {submitting
                ? t('orderSubmitting')
                : t('orderButton', { count: selectedDrinks.length })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
