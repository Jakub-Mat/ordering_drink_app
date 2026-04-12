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

  // Sort orders by priority status: READY > PREPARING > PENDING
  // For same status level, sort by creation time (newest first)
  const sortedOrders = [...orders].sort((a, b) => {
    const statusPriority = { ready: 0, preparing: 1, pending: 2 };
    const priorityDiff = (statusPriority[a.status] || 3) - (statusPriority[b.status] || 3);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at) - new Date(a.created_at);
  });

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
