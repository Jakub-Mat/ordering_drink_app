import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionHeader from './SectionHeader';

export default function BartenderMenuManagementPage({
  message,
  drinks,
  newDrinkName,
  newDrinkDescription,
  newDrinkCategory,
  editingDrinkId,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
  onSaveDrink,
  onResetDrinkForm,
  onEditDrink,
  onDeleteDrink,
  categories,
}) {
  const { t } = useTranslation();
  const [priorityCategory, setPriorityCategory] = useState('all');

  const sortedDrinks = useMemo(() => {
    if (priorityCategory === 'all') {
      return drinks;
    }

    const selectedCategory = Number(priorityCategory);
    const prioritized = drinks.filter((drink) => (drink.category || 3) === selectedCategory);
    const remaining = drinks.filter((drink) => (drink.category || 3) !== selectedCategory);
    return [...prioritized, ...remaining];
  }, [drinks, priorityCategory]);

  const getCategoryLabel = (categoryId) => {
    const category = categories.find((c) => c.id === (categoryId || 3));
    return category ? t(category.key) : t('categoryNonAlcoholic');
  };

  return (
    <div className="flex-1">
      <SectionHeader title={t('menuManagement')}/>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-brand-blue/10 text-brand-slate border-2 border-brand-blue">
          {message}
        </div>
      )}

      <div className="bg-brand-ghost rounded-lg p-6 mb-8 border-2 border-brand-slate/20">
        <label className="block text-lg md:text-xl font-semibold mb-3 text-brand-black">{t('selectCategory')}:</label>
        <select
          value={newDrinkCategory}
          onChange={(e) => onCategoryChange(parseInt(e.target.value, 10))}
          className="w-full px-4 py-3 border border-brand-slate/40 rounded-lg bg-brand-ghost text-brand-black text-base md:text-lg mb-5 focus:outline-none focus:border-brand-blue"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {t(category.key)}
            </option>
          ))}
        </select>

        <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-brand-black">{t('addDrink')}</h3>
        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder={t('drinkNamePlaceholder')}
            value={newDrinkName}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full px-4 py-3 border border-brand-slate/40 rounded-lg bg-brand-ghost text-brand-black text-base md:text-lg focus:outline-none focus:border-brand-blue"
          />
          <input
            type="text"
            placeholder={t('drinkDescriptionPlaceholder')}
            value={newDrinkDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full px-4 py-3 border border-brand-slate/40 rounded-lg bg-brand-ghost text-brand-black text-base md:text-lg focus:outline-none focus:border-brand-blue"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onSaveDrink}
            className="bg-brand-slate text-brand-ghost text-lg md:text-xl font-semibold px-6 py-3 rounded-lg hover:bg-brand-blue transition-colors"
          >
            {editingDrinkId ? t('saveChanges') : t('addDrink')}
          </button>
          {editingDrinkId && (
            <button
              onClick={onResetDrinkForm}
              className="bg-brand-black/70 text-brand-ghost text-lg font-semibold px-6 py-3 rounded-lg hover:bg-brand-black transition-colors"
            >
              {t('cancel')}
            </button>
          )}
        </div>
      </div>

      <div>
        <SectionHeader title={t('drinksInMenu')}/>
        <div className="mb-4 md:mb-5">
          <label className="block text-base md:text-lg font-semibold text-brand-black mb-2">
            {t('prioritizeCategory')}:
          </label>
          <select
            value={priorityCategory}
            onChange={(e) => setPriorityCategory(e.target.value)}
            className="w-full md:w-auto min-w-[16rem] px-4 py-2.5 border border-brand-slate/40 rounded-lg bg-brand-ghost text-brand-black text-base"
          >
            <option value="all">{t('allCategories')}</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {t(category.key)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedDrinks.map((drink) => (
            <div
              key={drink.id}
              className="bg-brand-ghost p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg hover:bg-gray-50 transition-shadow transition-colors flex flex-col min-h-[14rem]"
            >
              <div>
                <h4 className="text-xl md:text-2xl font-bold text-brand-black">{drink.name}</h4>
                <p className="text-base md:text-lg font-normal text-brand-black/80 mt-2">
                  {drink.description || t('noDescription')}
                </p>
                <p className="text-lg md:text-xl font-normal text-brand-black mt-2">
                  {getCategoryLabel(drink.category)}
                </p>
                <p className="text-sm md:text-base font-normal text-brand-slate mt-1">
                  {t('addedDate', { date: new Date(drink.created_at).toLocaleDateString() })}
                </p>
              </div>

              <div className="mt-auto pt-4 flex items-center gap-4 text-base md:text-lg border-t border-brand-slate/20">
                <button
                  onClick={() => onEditDrink(drink)}
                  className="text-brand-black hover:text-brand-slate font-semibold"
                >
                  {t('edit')}
                </button>
                <button
                  onClick={() => onDeleteDrink(drink.id, drink.name)}
                  className="text-brand-red hover:brightness-110 font-semibold"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {sortedDrinks.length === 0 && (
          <p className="text-brand-slate text-center py-8 text-xl md:text-2xl">{t('noDrinksInMenu')}</p>
        )}
      </div>
    </div>
  );
}
