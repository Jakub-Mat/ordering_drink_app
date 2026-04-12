import OrdersList from './OrdersList';
import SectionHeader from './SectionHeader';

/**
 * Your Orders Page - Displays customer's orders
 */
export default function YourOrdersPage({ orders, drinks, loading, t }) {
  return (
    <div className="flex-1">
      {/* Page Header */}
      <SectionHeader title={t('yourOrders')} />

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-brand-slate text-lg">{t('loadingOrders')}</p>
        </div>
      ) : (
        <OrdersList
          orders={orders}
          drinks={drinks}
          onStatusChange={() => {}}
          isBarman={false}
        />
      )}
    </div>
  );
}
