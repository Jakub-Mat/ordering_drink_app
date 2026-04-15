import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CustomerNameModal from './CustomerNameModal';
import Navigation from './Navigation';
import DrinkMenuPage from './DrinkMenuPage';
import YourOrdersPage from './YourOrdersPage';
import { fetchDrinks, createOrder, fetchCustomerOrders } from '../utils/api';
import { getCustomer, saveCustomer, generateCustomerId, clearCustomer } from '../utils/storage';
import { onWebSocketEvent, offWebSocketEvent } from '../utils/websocket';

/**
 * Customer View - Default interface for ordering drinks
 */
export default function CustomerView() {
  const [customer, setCustomer] = useState(null);
  const [drinks, setDrinks] = useState([]);
  const [selectedDrinks, setSelectedDrinks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [pollInterval, setPollInterval] = useState(null);
  const [currentPage, setCurrentPage] = useState('menu');
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  // Initialize customer data
  useEffect(() => {
    const existingCustomer = getCustomer();
    if (existingCustomer) {
      setCustomer(existingCustomer);
    }
  }, []);

  // Load drinks and set up polling
  useEffect(() => {
    const loadDrinks = async () => {
      const drinksList = await fetchDrinks();
      setDrinks(drinksList);
      setLoading(false);
    };

    loadDrinks();
  }, []);

  // Polling for customer's orders
  useEffect(() => {
    if (!customer) return;

    const pollOrders = async () => {
      const customerOrders = await fetchCustomerOrders(customer.name);
      setOrders(customerOrders);
    };

    // Initial load
    pollOrders();

    // Set up polling interval (5 seconds)
    const interval = setInterval(pollOrders, 5000);
    setPollInterval(interval);

    return () => clearInterval(interval);
  }, [customer]);

  // WebSocket listener pro aktualizace statusu objednávky
  useEffect(() => {
    if (!customer) return;

    const handleOrderStatusChanged = (updateData) => {
      console.log('[CustomerView] Status objednávky změněn:', updateData);
      
      setOrders(prev =>
        prev.map(order =>
          order.id === updateData.id
            ? { ...order, status: updateData.status }
            : order
        )
      );
    };

    onWebSocketEvent('orderStatusChanged', handleOrderStatusChanged);

    return () => {
      offWebSocketEvent('orderStatusChanged', handleOrderStatusChanged);
    };
  }, [customer]);

  const handleCustomerNameSubmit = (name) => {
    const customerId = generateCustomerId();
    const customerData = saveCustomer(name, customerId);
    setCustomer(customerData);
  };

  const handleLogout = () => {
    clearCustomer();
    setCustomer(null);
    setOrders([]);
    setSelectedDrinks([]);
    setMessage('');
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  };

  const handleToggleDrink = (drinkId) => {
    setSelectedDrinks(prev =>
      prev.includes(drinkId)
        ? prev.filter(id => id !== drinkId)
        : [...prev, drinkId]
    );
  };

  const handleSubmitOrder = async () => {
    if (selectedDrinks.length === 0) {
      setMessage(t('pleaseSelectDrink'));
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSubmitting(true);
    try {
      await createOrder(customer.name, selectedDrinks);
      setMessage(t('orderSubmitted'));
      setSelectedDrinks([]);
      
      // Refresh orders immediately
      const customerOrders = await fetchCustomerOrders(customer.name);
      setOrders(customerOrders);
      
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage(t('orderSubmitFailed'));
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (!customer) {
    return <CustomerNameModal onSubmit={handleCustomerNameSubmit} />;
  }

  return (
    <div className="min-h-screen bg-brand-ghost flex flex-col lg:flex-row">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-brand-ghost shadow-sm border-b-2 border-brand-slate sticky top-0 z-20 lg:static">
          <div className="relative px-4 py-4 md:py-5">
            {/* Hamburger Menu - Mobile */}
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
              <h1 className="text-xl md:text-2xl font-bold text-brand-black">
                {t('drinkBar')}
              </h1>
              <p className="text-sm text-brand-slate">
                {t('welcome', { name: customer.name })}
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto px-4 py-6 md:px-6 md:py-8">
          <div className="max-w-6xl mx-auto">
            {currentPage === 'menu' ? (
              <DrinkMenuPage
                drinks={drinks}
                selectedDrinks={selectedDrinks}
                onToggleDrink={handleToggleDrink}
                onSubmitOrder={handleSubmitOrder}
                submitting={submitting}
                message={message}
                loading={loading}
                t={t}
              />
            ) : (
              <YourOrdersPage
                orders={orders}
                drinks={drinks}
                loading={loading}
                t={t}
              />
            )}
          </div>
        </main>
      </div>

      {/* Navigation Sidebar */}
      <Navigation
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        customerName={customer.name}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />
    </div>
  );
}
