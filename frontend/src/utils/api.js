const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
const API_BASE = configuredApiBase || `${window.location.protocol}//${window.location.hostname}:3001/api`;

/**
 * Fetch all drinks from the menu
 */
export const fetchDrinks = async () => {
  try {
    const response = await fetch(`${API_BASE}/drinks`);
    if (!response.ok) throw new Error('Failed to fetch drinks');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching drinks:', error);
    return [];
  }
};

/**
 * Create a new drink
 * @param {string} name - Drink name
 * @param {string} description - Drink description
 * @param {number} category - Drink category (1-5)
 */
export const createDrink = async (name, description, category) => {
  try {
    const response = await fetch(`${API_BASE}/drinks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description: description || '',
        category: category || 3,
      }),
    });
    if (!response.ok) throw new Error('Failed to create drink');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating drink:', error);
    throw error;
  }
};

/**
 * Update an existing drink
 * @param {number} drinkId - Drink ID
 * @param {string} name - Drink name
 * @param {string} description - Drink description
 * @param {number} category - Drink category (1-5)
 */
export const updateDrink = async (drinkId, name, description, category) => {
  try {
    const response = await fetch(`${API_BASE}/drinks/${drinkId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description: description || '',
        category: category || 3,
      }),
    });
    if (!response.ok) throw new Error('Failed to update drink');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating drink:', error);
    throw error;
  }
};

/**
 * Delete a drink
 * @param {number} drinkId - Drink ID to delete
 */
export const deleteDrink = async (drinkId) => {
  try {
    const response = await fetch(`${API_BASE}/drinks/${drinkId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete drink');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting drink:', error);
    throw error;
  }
};

/**
 * Fetch all orders (for bartender view)
 */
export const fetchOrders = async () => {
  try {
    const response = await fetch(`${API_BASE}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

/**
 * Create a new order with multiple drinks
 * @param {string} customerName - Customer's name
 * @param {number[]} drinkIds - Array of drink IDs
 */
export const createOrder = async (customerName, drinkIds) => {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_name: customerName,
        drink_ids: drinkIds,
      }),
    });
    if (!response.ok) throw new Error('Failed to create order');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Update order status
 * @param {number} orderId - Order ID
 * @param {string} status - New status (pending, preparing, ready)
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update order status');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Delete an order (only if completed)
 * @param {number} orderId - Order ID
 */
export const deleteOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete order');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

/**
 * Fetch orders for a specific customer (filter by customer_name)
 * @param {string} customerName - Customer's name
 */
export const fetchCustomerOrders = async (customerName) => {
  try {
    const allOrders = await fetchOrders();
    return allOrders.filter(order => order.customer_name === customerName);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return [];
  }
};
