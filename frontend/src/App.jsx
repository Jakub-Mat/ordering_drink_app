import { useState, useEffect } from 'react';
import CustomerView from './components/CustomerView';
import BartenderView from './components/BartenderView';

/**
 * Main App component
 * Routes between Customer and Bartender views based on URL parameters
 */
function App() {
  const [isBartender, setIsBartender] = useState(false);

  // Check URL for barman parameter on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const barmanMode = params.get('barman') === 'true';
    setIsBartender(barmanMode);
  }, []);

  const handleExitBartender = () => {
    setIsBartender(false);
    // Update URL to remove barman parameter
    window.history.replaceState({}, '', window.location.origin + window.location.pathname);
  };

  return (
    <div className="w-full min-h-screen">
      {isBartender ? (
        <BartenderView onExit={handleExitBartender} />
      ) : (
        <CustomerView />
      )}
    </div>
  );
}

export default App;