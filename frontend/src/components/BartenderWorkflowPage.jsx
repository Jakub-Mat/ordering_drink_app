import { useTranslation } from 'react-i18next';
import KanbanBoard from './KanbanBoard';
import SectionHeader from './SectionHeader';

export default function BartenderWorkflowPage({ loading, message, orders, drinks, onStatusChange, onDeleteOrder }) {
  const { t } = useTranslation();

  return (
    <div className="flex-1">
      <SectionHeader title={t('kanbanTitle')}/>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-brand-blue/10 text-brand-slate border-2 border-brand-blue">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-brand-slate text-lg">{t('loadingOrders')}</p>
        </div>
      ) : (
        <KanbanBoard
          orders={orders}
          drinks={drinks}
          onStatusChange={onStatusChange}
          onDeleteOrder={onDeleteOrder}
        />
      )}
    </div>
  );
}
