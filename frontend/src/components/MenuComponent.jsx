/**
 * Menu component that displays available drinks
 */
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

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

// Mapping of category ID to translation key
const categoryKeys = {
  1: 'categoryBeer',
  2: 'categoryWater',
  3: 'categoryNonAlcoholic',
  4: 'categoryHot',
  5: 'categoryAlcoholic'
};

// Mapping of category ID to image filename
const categoryImageMap = {
  1: 'beer.png',
  2: 'water.png',
  3: 'sweetDrink.png',
  4: 'coffee.png',
  5: 'mochito.png',
};

// Function to get drink image with fallback
const getDrinkImage = (filename) => {
  return drinkImageMap[filename] || drinkImageMap['water.png'];
};

export default function MenuComponent({ drinks, selectedDrinks, onToggleDrink }) {
  const { t } = useTranslation();
  const [expandedCategories, setExpandedCategories] = useState({});

  // Group drinks by category ID
  const groupedDrinks = drinks.reduce((acc, drink) => {
    const categoryId = drink.category || 3;
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(drink);
    return acc;
  }, {});

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">{t('drinkMenu')}</h2>
      
      {drinks.length === 0 ? (
        <p className="text-center text-gray-500 py-8">{t('noDrinksAvailable')}</p>
      ) : (
        <div className="space-y-4">
          {Object.keys(groupedDrinks).map(categoryId => {
            const isExpanded = expandedCategories[categoryId];
            const categoryName = t(categoryKeys[categoryId]);
            const categoryImage = getDrinkImage(categoryImageMap[categoryId]);
            const categoryDrinks = groupedDrinks[categoryId];
            
            return (
              <div key={categoryId} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(categoryId)}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img src={categoryImage} alt={categoryName} className="w-12 h-12 object-contain" />
                    <h3 className="text-lg font-bold">{categoryName}</h3>
                    <span className="text-sm text-gray-500">({categoryDrinks.length} {t('drinks')})</span>
                  </div>
                  <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {isExpanded && (
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categoryDrinks.map(drink => {
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
                              <div>
                                <h3 className="text-lg font-bold mb-2">{drink.name}</h3>
                                <p className="text-sm text-gray-600">{drink.description || t('noDescription')}</p>
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
