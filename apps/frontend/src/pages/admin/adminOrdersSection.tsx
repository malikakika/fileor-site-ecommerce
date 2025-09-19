import React, { useEffect, useMemo, useState } from 'react';
import { ordersService, OrderDTO } from '../../services/orders.service';
import AccordionSection from '../../components/accordionSection';
import { useTranslation } from 'react-i18next';

const money = (value: number, currency: 'MAD' | 'EUR' = 'MAD') =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
  }).format(value);

type AdminStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'DELIVERED'
  | 'ALL';

export default function AdminOrdersSection() {
  const { t } = useTranslation();
  const [items, setItems] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [status, setStatus] = useState<AdminStatus>('ALL');
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const data = await ordersService.adminList({ status });
      setItems(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const totalCount = items.length;
  const currency: 'MAD' | 'EUR' = (items[0]?.currency as any) || 'MAD';

  const totalRevenue = useMemo(
    () => items.reduce((sum, o) => sum + (o.total ?? 0), 0),
    [items]
  );

  const right = (
    <div className="flex items-center gap-3">
        <select
          className="appearance-none rounded pl-3 pr-9 py-2 border-0 bg-white focus:ring-0 focus:outline-none"
          value={status}
          onChange={(e) => setStatus(e.target.value as AdminStatus)}
          title={t('adminOrders.filterLabel')}
          aria-label={t('adminOrders.filterLabel') || 'Filter'}
        >
          <option value="ALL">{t('adminOrders.status.ALL')}</option>
          <option value="PENDING_PAYMENT">{t('adminOrders.status.PENDING_PAYMENT')}</option>
          <option value="PAID">{t('adminOrders.status.PAID')}</option>
          <option value="CONFIRMED">{t('adminOrders.status.CONFIRMED')}</option>
          <option value="PROCESSING">{t('adminOrders.status.PROCESSING')}</option>
          <option value="DELIVERED">{t('adminOrders.status.DELIVERED')}</option>
        </select>
      

      <button
        onClick={load}
        disabled={loading}
        className="text-sm underline"
        title={t('adminOrders.refresh') || 'Refresh'}
      >
        {loading ? '...' : t('adminOrders.refresh')}
      </button>
    </div>
  );

  return (
    <AccordionSection title={t('adminOrders.title') || 'Orders'} rightAdornment={right} defaultOpen>
      {err && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{err}</div>}

      <div className="text-sm text-ink/70 mb-3">
        {t('adminOrders.summary.count')}: <b>{totalCount}</b> — {t('adminOrders.summary.revenue')}:{' '}
        <b>{money(totalRevenue, currency)}</b>
      </div>

      {items.length === 0 ? (
        <div className="text-ink/60 text-center py-8">{t('adminOrders.empty')}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2">{t('adminOrders.table.date')}</th>
                <th className="px-3 py-2">{t('adminOrders.table.customer')}</th>
                <th className="px-3 py-2">{t('adminOrders.table.contact')}</th>
                <th className="px-3 py-2">{t('adminOrders.table.address')}</th>
                <th className="px-3 py-2">{t('adminOrders.table.payment')}</th>
                <th className="px-3 py-2">{t('adminOrders.table.status')}</th>
                <th className="px-3 py-2 text-right">{t('adminOrders.table.total')}</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => {
                const d = new Date(o.createdAt);
                const pm =
                  t(`adminOrders.paymentMethod.${o.paymentMethod}`) || o.paymentMethod;
                const statusLabel =
                  t(`adminOrders.status.${o.status as AdminStatus}`) || o.status;

                return (
                  <React.Fragment key={o.id}>
                    <tr className="border-t">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {d.toLocaleDateString()}{' '}
                        {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium">
                          {o.customerName || o.user?.name || '—'}
                        </div>
                        <div className="text-xs text-ink/60">
                          {o.user?.email || o.customerEmail || '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2">{o.customerPhone}</td>
                      <td className="px-3 py-2 max-w-sm truncate" title={o.address}>
                        {o.address}
                      </td>
                      <td className="px-3 py-2">{pm}</td>
                      <td className="px-3 py-2">
                        <span className="inline-block text-xs px-2 py-1 rounded bg-gray-100">
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {money(o.total, (o as any).currency || currency)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          className="text-sunset underline"
                          onClick={() => setOpenId(openId === o.id ? null : o.id)}
                        >
                          {openId === o.id
                            ? t('adminOrders.table.hide')
                            : t('adminOrders.table.details')}
                        </button>
                      </td>
                    </tr>

                    {openId === o.id && (
                      <tr className="bg-gray-50/50">
                        <td colSpan={8} className="px-3 py-3">
                          <div className="grid gap-2">
                            <div className="font-medium">{t('adminOrders.details.items')}</div>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs">
                                <thead>
                                  <tr className="text-left">
                                    <th className="px-2 py-1">{t('adminOrders.details.product')}</th>
                                    <th className="px-2 py-1 text-center">{t('adminOrders.details.qty')}</th>
                                    <th className="px-2 py-1 text-right">{t('adminOrders.details.unitPrice')}</th>
                                    <th className="px-2 py-1 text-right">{t('adminOrders.details.subtotal')}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(o.items || []).map((it, idx) => (
                                    <tr key={o.id + '-' + idx} className="border-t">
                                      <td className="px-2 py-1">{it.name}</td>
                                      <td className="px-2 py-1 text-center">{it.quantity}</td>
                                      <td className="px-2 py-1 text-right">
                                        {money(it.unitPrice, (o as any).currency || currency)}
                                      </td>
                                      <td className="px-2 py-1 text-right">
                                        {money(it.subtotal, (o as any).currency || currency)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AccordionSection>
  );
}
