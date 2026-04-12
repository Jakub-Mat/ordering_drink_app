/**
 * Individual order card component for displaying order status
 */
import { useTranslation } from 'react-i18next';

export default function OrderCard({ order, drinks, onStatusChange, onDeleteOrder, isBarman = false }) {
  const { t } = useTranslation();

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'preparing':
        return 'bg-brand-blue/10 border-brand-blue text-brand-blue';
      case 'ready':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-brand-slate/10 border-brand-slate text-brand-slate';
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

  const drinkLabels = (order.drink_ids || []).map((id) => {
    const drink = drinks.find((d) => d.id === id);
    return drink?.name || t('unknown');
  });

  if (isBarman) {
    return (
      <div
        className={`p-4 rounded-lg border ${getStatusColor(order.status)} shadow-sm ${order.status !== 'ready' ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        id={`order-${order.id}`}
        onClick={() => {
          if (order.status !== 'ready') {
            onStatusChange(order.id, getNextStatus(order.status));
          }
        }}
      >
        <p className="text-sm md:text-base text-brand-black">{t('orderNumber', { id: order.id })}</p>
        <h4 className="text-base md:text-lg font-bold text-brand-black mb-2">{order.customer_name || t('unknownCustomer')}</h4>

        <p className="text-sm md:text-base text-brand-black mb-1">{t('drinks')}:</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {drinkLabels.length > 0 ? (
            drinkLabels.map((label, idx) => (
              <span
                key={`${order.id}-${idx}`}
                className="inline-flex items-center rounded-full bg-brand-blue/20 px-2.5 py-1 text-sm font-medium text-brand-blue"
              >
                {label}
              </span>
            ))
          ) : (
            <span className="text-sm md:text-base text-brand-slate">{t('unknown')}</span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-sm md:text-base font-medium text-brand-black">{t(`${order.status}Status`)}</span>
          {order.status === 'ready' && onDeleteOrder && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteOrder(order.id);
              }}
              className="bg-brand-red text-brand-ghost px-3 py-1.5 rounded font-bold text-xs md:text-sm hover:brightness-110 transition-all"
            >
              {t('deleteOrder')}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`p-4 rounded-lg border-2 ${getStatusColor(order.status)} ${
        isBarman && order.status !== 'ready' 
          ? 'cursor-pointer hover:shadow-lg transition-shadow' 
          : ''
      }`} 
      id={`order-${order.id}`}
      onClick={() => {
        if (isBarman && order.status !== 'ready') {
          onStatusChange(order.id, getNextStatus(order.status));
        }
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-brand-slate/60">{t('orderNumber', { id: order.id })}</p>
          <h4 className="text-lg font-bold text-brand-black">{order.customer_name || t('unknownCustomer')}</h4>
        </div>
        <div className="text-right">
          <p className="text-xs text-brand-slate/60">
            {/* ručně jsem opravil čas zobrazení, aby byl v místním formátu a přidal jsem "Z" na konec, aby se správně interpretoval jako UTC čas */}
            {new Date(`${order.created_at}Z`).toLocaleTimeString('cs-CZ', { 
                hour: '2-digit', 
                minute: '2-digit' 
          })}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm mb-2 text-brand-black"><strong>{t('drinks')}</strong></p>
        <div className="flex flex-wrap gap-2">
          {order.drink_ids && order.drink_ids.length > 0 ? (
            order.drink_ids.map((id) => {
              const drink = drinks.find(d => d.id === id);
              return (
                <span
                  key={`${order.id}-${id}`}
                  className="inline-flex items-center rounded-full bg-brand-blue/20 px-3 py-1 text-sm font-medium text-brand-blue"
                >
                  {drink?.name || t('unknown')}
                </span>
              );
            })
          ) : (
            <span className="text-sm text-brand-slate">{t('unknown')}</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-bold text-sm uppercase text-brand-black">
          {t(`${order.status}Status`)}
        </span>
        
        {isBarman && (
          <div className="flex space-x-2">
            {order.status !== 'ready' && (
              <button
                onClick={() => onStatusChange(order.id, getNextStatus(order.status))}
                className="bg-brand-ghost text-brand-black px-4 py-2 rounded font-bold text-sm hover:bg-brand-slate/10 border-2 border-brand-slate transition-colors"
              >
                {order.status === 'pending' ? t('startPreparing') : t('markReady')}
              </button>
            )}
            {order.status === 'ready' && onDeleteOrder && (
              <button
                onClick={() => onDeleteOrder(order.id)}
                className="bg-brand-red text-brand-ghost px-4 py-2 rounded font-bold text-sm hover:brightness-110 transition-all"
              >
                {t('deleteOrder')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
