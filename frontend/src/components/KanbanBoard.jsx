/**
 * Kanban board for order workflow management
 * Displays orders in 3 columns: Pending, Preparing, Ready
 */
import { useTranslation } from 'react-i18next';
import OrderCard from './OrderCard';

const COLUMN_STATUSES = ['pending', 'preparing', 'ready'];

export default function KanbanBoard({ orders, drinks, onStatusChange, onDeleteOrder }) {
  const { t } = useTranslation();

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  const getColumnColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50';
      case 'preparing':
        return 'bg-brand-blue/10';
      case 'ready':
        return 'bg-green-50';
      default:
        return 'bg-brand-ghost';
    }
  };

  const getColumnBorderColor = (status) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-300';
      case 'preparing':
        return 'border-brand-blue';
      case 'ready':
        return 'border-green-300';
      default:
        return 'border-brand-slate/30';
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMN_STATUSES.map((status) => {
          const ordersInColumn = getOrdersByStatus(status);
          const columnLabel = `column${status.charAt(0).toUpperCase() + status.slice(1)}`;

          return (
            <div
              key={status}
              className={`rounded-lg border-2 p-3 min-h-[20rem] ${getColumnColor(status)} ${getColumnBorderColor(status)}`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="min-w-0 flex-1 text-base md:text-lg font-semibold text-brand-black whitespace-nowrap truncate">
                  {t(columnLabel)}
                </h3>
                <span className="text-base md:text-lg font-medium text-brand-black whitespace-nowrap">
                  {ordersInColumn.length} {ordersInColumn.length === 1 ? t('order') : t('orders')}
                </span>
              </div>

              <div className="space-y-2">
                {ordersInColumn.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-brand-slate text-sm">{t('noOrdersInColumn')}</p>
                  </div>
                ) : (
                  ordersInColumn.map((order) => (
                    <div key={order.id} className="cursor-pointer text-sm md:text-base">
                      <OrderCard
                        order={order}
                        drinks={drinks}
                        onStatusChange={onStatusChange}
                        onDeleteOrder={onDeleteOrder}
                        isBarman={true}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
