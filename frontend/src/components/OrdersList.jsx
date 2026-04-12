/**
 * Order list component - displays multiple orders
 */
import { useTranslation } from 'react-i18next';
import OrderCard from './OrderCard';

export default function OrdersList({ orders, drinks, onStatusChange, onDeleteOrder, isBarman = false, highlightOrderId = null }) {
  const { t } = useTranslation();

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-brand-slate text-lg">
          {isBarman ? t('noOrdersWaiting') : t('noOrdersPlaced')}
        </p>
      </div>
    );
  }

  // For bartender: sort by status (pending first, then preparing)
  // For customer: sort by creation time (newest first)
  const sortedOrders = isBarman
    ? [...orders].sort((a, b) => {
        const statusPriority = { pending: 0, preparing: 1, ready: 2 };
        return (statusPriority[a.status] || 3) - (statusPriority[b.status] || 3);
      })
    : [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="w-full space-y-3">
      {sortedOrders.map(order => (
        <OrderCard
          key={order.id}
          order={order}
          drinks={drinks}
          onStatusChange={onStatusChange}
          onDeleteOrder={onDeleteOrder}
          isBarman={isBarman}
        />
      ))}
    </div>
  );
}
