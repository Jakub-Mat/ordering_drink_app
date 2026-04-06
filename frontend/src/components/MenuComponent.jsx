/**
 * Menu component that displays available drinks
 */
import { useTranslation } from 'react-i18next';

// Import drink images
import beerImg from '../assets/drink_icons/beer.png';
import coffeeImg from '../assets/drink_icons/coffee.png';
import colaImg from '../assets/drink_icons/cola.png';
import mochitoImg from '../assets/drink_icons/mochito.png';
import sangiraImg from '../assets/drink_icons/sangira.png';
import sweetDrinkImg from '../assets/drink_icons/sweetDrink.png';
import teaImg from '../assets/drink_icons/tea.png';
import waterImg from '../assets/drink_icons/water.png';
import wineImg from '../assets/drink_icons/wine.png';

// Mapping of filenames to imported images
const drinkImageMap = {
  'beer.png': beerImg,
  'coffee.png': coffeeImg,
  'cola.png': colaImg,
  'mochito.png': mochitoImg,
  'sangira.png': sangiraImg,
  'sweetDrink.png': sweetDrinkImg,
  'tea.png': teaImg,
  'water.png': waterImg,
  'wine.png': wineImg
};

// Function to get drink image with fallback
const getDrinkImage = (filename) => {
  return drinkImageMap[filename] || drinkImageMap['water.png'];
};

export default function MenuComponent({ drinks, selectedDrinks, onToggleDrink }) {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">{t('drinkMenu')}</h2>
      
      {drinks.length === 0 ? (
        <p className="text-center text-gray-500 py-8">{t('noDrinksAvailable')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {drinks.map(drink => {
            const isSelected = selectedDrinks.includes(drink.id);
            return (
              <button
                key={drink.id}
                onClick={() => onToggleDrink(drink.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left shadow-sm ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-blue-200/50'
                    : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={getDrinkImage(drink.icon_name || 'water.png')} alt={drink.name} className="w-12 h-12 object-contain" />
                    <div>
                      <h3 className="text-lg font-bold mb-2">{drink.name}</h3>
                      <p className="text-sm text-gray-600">{drink.description || t('noDescription')}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                      {t('selected')}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
