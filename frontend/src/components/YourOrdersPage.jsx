import { useTranslation } from 'react-i18next';
import OrdersList from './OrdersList';

/**
 * Your Orders Page - Displays customer's orders
 */
export default function YourOrdersPage({ orders, drinks, loading, t }) {
  return (
    <div className="flex-1">
      {/* Page Header */}
      <h2 className="text-3xl font-bold mb-2 text-brand-black">{t('yourOrders')}</h2>
      <div className="h-1 w-20 bg-brand-blue mb-6 rounded-full"></div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-brand-slate text-lg">{t('loadingOrders')}</p>
        </div>
      ) : (
        <div className="bg-brand-ghost rounded-lg p-6 border-2 border-brand-slate/20">
          <OrdersList
            orders={orders}
            drinks={drinks}
            onStatusChange={() => {}}
            isBarman={false}
          />
        </div>
      )}
    </div>
  );
}
