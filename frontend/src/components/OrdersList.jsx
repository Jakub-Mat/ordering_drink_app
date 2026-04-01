/**
 * Order list component - displays multiple orders
 */
import OrderCard from './OrderCard';

export default function OrdersList({ orders, drinks, onStatusChange, isBarman = false, highlightOrderId = null }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">
          {isBarman ? 'No orders yet - waiting for customers...' : 'You haven\'t placed any orders yet'}
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
          isBarman={isBarman}
        />
      ))}
    </div>
  );
}
