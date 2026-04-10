import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PINModal from './PINModal';
import KanbanBoard from './KanbanBoard';
import LanguageSwitcher from './LanguageSwitcher';
import { fetchOrders, updateOrderStatus, fetchDrinks, deleteOrder, createDrink, updateDrink, deleteDrink } from '../utils/api';
import { playNotificationSound, highlightElement } from '../utils/notifications';

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

const CORRECT_PIN = '1234'; // Hardcoded PIN for MVP

// Available drink categories
const DRINK_CATEGORIES = [
  { id: 1, key: 'categoryBeer' },
  { id: 2, key: 'categoryWater' },
  { id: 3, key: 'categoryNonAlcoholic' },
  { id: 4, key: 'categoryHot' },
  { id: 5, key: 'categoryAlcoholic' }
];

/**
 * Bartender View - Order management interface
 */
export default function BartenderView({ onExit }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const pollIntervalRef = useRef(null);
  const previousOrderCountRef = useRef(0);
  const ordersRef = useRef([]);
  
  // Drink management state
  const [showDrinkManagement, setShowDrinkManagement] = useState(false);
  const [newDrinkName, setNewDrinkName] = useState('');
  const [newDrinkDescription, setNewDrinkDescription] = useState('');
  const [newDrinkCategory, setNewDrinkCategory] = useState(3);
  const [editingDrinkId, setEditingDrinkId] = useState(null);
  const { t } = useTranslation();

  // Handle PIN entry
  const handlePINSubmit = (pin) => {
    if (pin === CORRECT_PIN) {
      setAuthenticated(true);
      setMessage('');
    } else {
      setMessage(t('incorrectPin'));
      setTimeout(() => setMessage(''), 2000);
    }
  };

  // Load initial data and start polling
  useEffect(() => {
    if (!authenticated) return;

    const loadData = async () => {
      try {
        const drinksList = await fetchDrinks();
        setDrinks(drinksList);
        
        const ordersList = await fetchOrders();
        setOrders(ordersList);
        ordersRef.current = ordersList;
        previousOrderCountRef.current = ordersList.length;
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();

    // Set up polling for new orders (5 seconds)
    pollIntervalRef.current = setInterval(async () => {
      try {
        const ordersList = await fetchOrders();
        if (!Array.isArray(ordersList)) return;
        
        // Check for new orders
        if (ordersList.length > previousOrderCountRef.current) {
          // Find new orders
          const newOrders = ordersList.filter(
            order => !ordersRef.current.some(o => o.id === order.id)
          );
          
          // Play notification and highlight
          if (newOrders.length > 0) {
            playNotificationSound();
            newOrders.forEach(order => {
              setTimeout(() => {
                const element = document.getElementById(`order-${order.id}`);
                if (element) highlightElement(element);
              }, 100);
            });
          }
        }

        setOrders(ordersList);
        ordersRef.current = ordersList;
        previousOrderCountRef.current = ordersList.length;
      } catch (error) {
        console.error('Error polling orders:', error);
      }
    }, 5000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [authenticated]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      setMessage(t('orderUpdated'));
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error updating order:', error);
      setMessage(t('orderUpdateFailed'));
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(t('confirmDeleteOrder'))) return;
    
    try {
      await deleteOrder(orderId);
      
      // Update local state
      setOrders(prev => prev.filter(order => order.id !== orderId));
      
      setMessage(t('orderDeleted'));
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error deleting order:', error);
      setMessage(t('orderDeleteFailed'));
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const resetDrinkForm = () => {
    setNewDrinkName('');
    setNewDrinkDescription('');
    setNewDrinkCategory(3);
    setEditingDrinkId(null);
  };

  const handleEditDrink = (drink) => {
    setEditingDrinkId(drink.id);
    setNewDrinkName(drink.name);
    setNewDrinkDescription(drink.description || '');
    setNewDrinkCategory(drink.category || 3);
  };

  const handleSaveDrink = async () => {
    if (!newDrinkName.trim()) {
      setMessage(t('drinkNameRequired'));
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    try {
      if (editingDrinkId) {
        await updateDrink(editingDrinkId, newDrinkName.trim(), newDrinkDescription.trim(), newDrinkCategory);
      } else {
        await createDrink(newDrinkName.trim(), newDrinkDescription.trim(), newDrinkCategory);
      }
      
      // Refresh drinks list
      const drinksList = await fetchDrinks();
      setDrinks(drinksList);
      
      // Clear form
      resetDrinkForm();
      
      setMessage(editingDrinkId ? t('drinkUpdated') : t('drinkAdded'));
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error saving drink:', error);
      setMessage(t('drinkSaveError'));
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const handleDeleteDrink = async (drinkId, drinkName) => {
    if (!window.confirm(t('confirmDeleteDrink', { name: drinkName }))) return;
    
    try {
      await deleteDrink(drinkId);
      
      // Update local state
      setDrinks(prev => prev.filter(drink => drink.id !== drinkId));
      
      setMessage(t('drinkRemoved'));
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error deleting drink:', error);
      setMessage(t('drinkSaveError'));
      setTimeout(() => setMessage(''), 2000);
    }
  };

  if (!authenticated) {
    return <PINModal onSubmit={handlePINSubmit} onCancel={onExit} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white shadow border-b-4 border-red-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">🍹 Bartender Console</h1>
          <div className="flex gap-3 items-center">
            <LanguageSwitcher />
            <button
              onClick={() => setShowDrinkManagement(!showDrinkManagement)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              {showDrinkManagement ? t('hideMenu') : t('manageMenu')}
            </button>
            <button
              onClick={onExit}
              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              {t('exit')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Message Alert */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-800 border-2 border-green-300">
            {message}
          </div>
        )}

        {/* Drink Management Section */}
        {showDrinkManagement && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border-2 border-blue-200">
            <h2 className="text-2xl font-bold mb-6 text-blue-800">🍸 {t('menuManagement')}</h2>
            
            {/* Add New Drink Form */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">{t('addDrink')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder={t('drinkNamePlaceholder')}
                  value={newDrinkName}
                  onChange={(e) => setNewDrinkName(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder={t('drinkDescriptionPlaceholder')}
                  value={newDrinkDescription}
                  onChange={(e) => setNewDrinkDescription(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              
              {/* Category Selector */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-blue-700">{t('selectCategory')}:</label>
                <select
                  value={newDrinkCategory}
                  onChange={(e) => setNewDrinkCategory(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {DRINK_CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>
                      {t(category.key)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSaveDrink}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                >
                  {editingDrinkId ? t('saveChanges') : t('addDrink')}
                </button>
                {editingDrinkId && (
                  <button
                    type="button"
                    onClick={resetDrinkForm}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-bold transition-colors"
                  >
                    {t('cancel')}
                  </button>
                )}
              </div>
            </div>

            {/* Current Menu */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-800">{t('menuCurrent', { count: drinks.length })}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drinks.map(drink => (
                  <div key={drink.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{drink.name}</h4>
                        {drink.description && (
                          <p className="text-sm text-gray-600">{drink.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditDrink(drink)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                          title={t('editDrink')}
                        >
                          {t('edit')}
                        </button>
                        <button
                          onClick={() => handleDeleteDrink(drink.id, drink.name)}
                          className="text-red-600 hover:text-red-800 text-sm font-bold"
                          title={t('removeFromMenu')}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <img
                        src={getDrinkImage(categoryImageMap[drink.category] || 'water.png')}
                        alt={drink.name}
                        className="w-10 h-10 rounded-lg object-contain border border-gray-200"
                      />
                      <p className="text-xs text-gray-400">
                        {t('addedDate', { date: new Date(drink.created_at).toLocaleDateString() })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {drinks.length === 0 && (
                <p className="text-gray-500 text-center py-8">{t('noDrinksInMenu')}</p>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('loadingOrders')}</p>
          </div>
        ) : (
          <KanbanBoard
            orders={orders}
            drinks={drinks}
            onStatusChange={handleStatusChange}
            onDeleteOrder={handleDeleteOrder}
          />
        )}
      </div>
    </div>
  );
}
