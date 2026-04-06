/**
 * Individual order card component for displaying order status
 */
export default function OrderCard({ order, drinks, onStatusChange, onDeleteOrder, isBarman = false }) {
  // Map drink IDs to drink names
  const getDrinkNames = () => {
    if (!order.drink_ids || !drinks) return 'Unknown';
    return order.drink_ids
      .map(id => {
        const drink = drinks.find(d => d.id === id);
        return drink?.name || 'Unknown';
      })
      .join(', ');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'ready':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getNextStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'preparing';
      case 'preparing':
        return 'ready';
      default:
        return status;
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor(order.status)}`} id={`order-${order.id}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-gray-500">Order #{order.id}</p>
          <h4 className="text-lg font-bold">{order.customer_name || 'Unknown Customer'}</h4>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">
            {new Date(order.created_at).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm mb-2"><strong>Drinks:</strong></p>
        <div className="flex flex-wrap gap-2">
          {order.drink_ids && order.drink_ids.length > 0 ? (
            order.drink_ids.map((id) => {
              const drink = drinks.find(d => d.id === id);
              return (
                <span
                  key={`${order.id}-${id}`}
                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                >
                  {drink?.name || 'Unknown'}
                </span>
              );
            })
          ) : (
            <span className="text-sm text-gray-700">Unknown</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-bold text-sm uppercase">
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
        
        {isBarman && (
          <div className="flex space-x-2">
            {order.status !== 'ready' && (
              <button
                onClick={() => onStatusChange(order.id, getNextStatus(order.status))}
                className="bg-white text-gray-800 px-4 py-2 rounded font-bold text-sm hover:bg-gray-100 transition-colors"
              >
                {order.status === 'pending' ? 'Start Preparing' : 'Mark Ready'}
              </button>
            )}
            {order.status === 'ready' && onDeleteOrder && (
              <button
                onClick={() => onDeleteOrder(order.id)}
                className="bg-red-500 text-white px-4 py-2 rounded font-bold text-sm hover:bg-red-600 transition-colors"
              >
                Delete Order
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
