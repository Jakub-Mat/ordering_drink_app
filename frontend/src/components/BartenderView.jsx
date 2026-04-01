import { useState, useEffect, useRef } from 'react';
import PINModal from './PINModal';
import OrdersList from './OrdersList';
import { fetchOrders, updateOrderStatus, fetchDrinks } from '../utils/api';
import { playNotificationSound, highlightElement } from '../utils/notifications';

const CORRECT_PIN = '1234'; // Hardcoded PIN for MVP

/**
 * Bartender View - Order management interface
 */
export default function BartenderView({ onExit }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [message, setMessage] = useState('');
  const pollIntervalRef = useRef(null);

  // Handle PIN entry
  const handlePINSubmit = (pin) => {
    if (pin === CORRECT_PIN) {
      setAuthenticated(true);
      setMessage('');
    } else {
      setMessage('Incorrect PIN');
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
        setPreviousOrderCount(ordersList.length);
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
        
        // Check for new orders
        if (ordersList.length > previousOrderCount) {
          // Find new orders
          const newOrders = ordersList.filter(
            order => !orders.find(o => o.id === order.id)
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
        setPreviousOrderCount(ordersList.length);
      } catch (error) {
        console.error('Error polling orders:', error);
      }
    }, 5000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [authenticated, orders, previousOrderCount]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      setMessage('Order updated ✓');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error updating order:', error);
      setMessage('Failed to update order');
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
          <button
            onClick={onExit}
            className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg font-bold transition-colors"
          >
            Exit
          </button>
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'pending').length}
            </p>
            <p className="text-sm text-yellow-700">Pending</p>
          </div>
          <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'preparing').length}
            </p>
            <p className="text-sm text-blue-700">Preparing</p>
          </div>
          <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {orders.filter(o => o.status === 'ready').length}
            </p>
            <p className="text-sm text-green-700">Ready</p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading orders...</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">Active Orders</h2>
            <OrdersList
              orders={orders}
              drinks={drinks}
              onStatusChange={handleStatusChange}
              isBarman={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
