/**
 * Customer storage utilities using localStorage
 */

const CUSTOMER_KEY = 'customer_data';

/**
 * Get customer data from localStorage
 */
export const getCustomer = () => {
  try {
    const data = localStorage.getItem(CUSTOMER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading customer from storage:', error);
    return null;
  }
};

/**
 * Save customer data to localStorage
 * @param {string} name - Customer's name
 * @param {string} id - Unique customer ID
 */
export const saveCustomer = (name, id) => {
  try {
    const customerData = { name, id, created_at: new Date().toISOString() };
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customerData));
    return customerData;
  } catch (error) {
    console.error('Error saving customer to storage:', error);
    return null;
  }
};

/**
 * Clear customer data from localStorage
 */
export const clearCustomer = () => {
  try {
    localStorage.removeItem(CUSTOMER_KEY);
  } catch (error) {
    console.error('Error clearing customer from storage:', error);
  }
};

/**
 * Generate a unique customer ID
 */
export const generateCustomerId = () => {
  return `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
