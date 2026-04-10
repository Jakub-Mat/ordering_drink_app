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
        return 'bg-blue-50';
      case 'ready':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getColumnBorderColor = (status) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-300';
      case 'preparing':
        return 'border-blue-300';
      case 'ready':
        return 'border-green-300';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">{t('kanbanTitle')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMN_STATUSES.map((status) => {
          const ordersInColumn = getOrdersByStatus(status);
          const columnLabel = `column${status.charAt(0).toUpperCase() + status.slice(1)}`;

          return (
            <div
              key={status}
              className={`rounded-lg border-2 p-4 min-h-96 ${getColumnColor(status)} ${getColumnBorderColor(status)}`}
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {t(columnLabel)}
                </h3>
                <p className="text-sm text-gray-600">
                  {ordersInColumn.length} {ordersInColumn.length === 1 ? t('order') : t('orders')}
                </p>
              </div>

              <div className="space-y-3">
                {ordersInColumn.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">{t('noOrdersInColumn')}</p>
                  </div>
                ) : (
                  ordersInColumn.map((order) => (
                    <div key={order.id} className="cursor-pointer">
                      <OrderCard
                        order={order}
                        drinks={drinks}
                        onStatusChange={onStatusChange}
                        onDeleteOrder={onDeleteOrder}
                        isBarman={true}
                      />
                      {status !== 'ready' && (
                        <p className="text-xs text-gray-600 mt-2 italic text-center">
                          {t('clickToAdvance')}
                        </p>
                      )}
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
