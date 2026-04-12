import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import PINModal from './PINModal';
import BartenderSidebar from './BartenderSidebar';
import BartenderWorkflowPage from './BartenderWorkflowPage';
import BartenderMenuManagementPage from './BartenderMenuManagementPage';
import { fetchOrders, updateOrderStatus, fetchDrinks, deleteOrder, createDrink, updateDrink, deleteDrink } from '../utils/api';
import { playNotificationSound, highlightElement } from '../utils/notifications';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const pollIntervalRef = useRef(null);
  const previousOrderCountRef = useRef(0);
  const ordersRef = useRef([]);
  
  // Drink management state
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
    <HashRouter>
      <div className="min-h-screen bg-brand-ghost flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col">
          <header className="bg-brand-ghost shadow-sm border-b-2 border-brand-slate sticky top-0 z-20 lg:static">
            <div className="relative px-4 py-4 md:py-5">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-black p-2 hover:bg-brand-slate/10 rounded-lg transition-colors"
                aria-label="Toggle menu"
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div className="pr-12">
                <h1 className="text-xl md:text-2xl font-bold text-brand-black">{t('bartenderTitle')}</h1>
                <p className="text-sm md:text-base text-brand-slate mt-1">{t('welcomeBarman')}</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto px-4 py-6 md:px-6 md:py-8">
            <div className="max-w-6xl mx-auto">
              <Routes>
                <Route
                  path="/workflow"
                  element={
                    <BartenderWorkflowPage
                      loading={loading}
                      message={message}
                      orders={orders}
                      drinks={drinks}
                      onStatusChange={handleStatusChange}
                      onDeleteOrder={handleDeleteOrder}
                    />
                  }
                />
                <Route
                  path="/menu-management"
                  element={
                    <BartenderMenuManagementPage
                      message={message}
                      drinks={drinks}
                      newDrinkName={newDrinkName}
                      newDrinkDescription={newDrinkDescription}
                      newDrinkCategory={newDrinkCategory}
                      editingDrinkId={editingDrinkId}
                      onNameChange={setNewDrinkName}
                      onDescriptionChange={setNewDrinkDescription}
                      onCategoryChange={setNewDrinkCategory}
                      onSaveDrink={handleSaveDrink}
                      onResetDrinkForm={resetDrinkForm}
                      onEditDrink={handleEditDrink}
                      onDeleteDrink={handleDeleteDrink}
                      categories={DRINK_CATEGORIES}
                    />
                  }
                />
                <Route path="*" element={<Navigate to="/workflow" replace />} />
              </Routes>
            </div>
          </main>
        </div>

        <BartenderSidebar
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onLogout={onExit}
        />
      </div>
    </HashRouter>
  );
}
