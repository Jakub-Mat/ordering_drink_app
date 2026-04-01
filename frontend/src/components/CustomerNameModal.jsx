import { useState } from 'react';

/**
 * Modal for customer name entry
 */
export default function CustomerNameModal({ onSubmit }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    onSubmit(name.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Welcome! 👋</h2>
        <p className="text-gray-600 text-center mb-6">Please enter your name to get started</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mb-4"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white text-lg font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start Ordering
          </button>
        </form>
      </div>
    </div>
  );
}
