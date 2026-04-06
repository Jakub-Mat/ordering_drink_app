import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MenuComponent from './MenuComponent';
import OrdersList from './OrdersList';
import CustomerNameModal from './CustomerNameModal';
import LanguageSwitcher from './LanguageSwitcher';
import { fetchDrinks, createOrder, fetchCustomerOrders } from '../utils/api';
import { getCustomer, saveCustomer, generateCustomerId, clearCustomer } from '../utils/storage';

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
    } catch (error) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow border-b-4 border-blue-500 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t('drinkBar')}</h1>
            <p className="text-gray-600 mt-2">{t('welcome', { name: customer.name })}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Message Alert */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-blue-100 text-blue-800 border-2 border-blue-300">
            {message}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('loadingMenu')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Section - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <MenuComponent
                drinks={drinks}
                selectedDrinks={selectedDrinks}
                onToggleDrink={handleToggleDrink}
              />

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting || selectedDrinks.length === 0}
                  className={`w-full text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors ${
                    selectedDrinks.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {submitting ? t('orderSubmitting') : t('orderButton', { count: selectedDrinks.length })}
                </button>
              </div>
            </div>

            {/* Orders History - Takes 1 column on large screens */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold mb-6">{t('yourOrders')}</h2>
              <OrdersList
                orders={orders}
                drinks={drinks}
                onStatusChange={() => {}}
                isBarman={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
