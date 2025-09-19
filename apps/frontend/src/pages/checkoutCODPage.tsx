import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/cartContext';
import { ordersService } from '../services/orders.service';
import { useCurrency } from '../context/currencyContext'; 

type Form = {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  note?: string;
};

export default function CheckoutCODPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { currency } = useCurrency(); // 'MAD' | 'EUR'

  const [form, setForm] = useState<Form>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);

  const items = useMemo(
    () =>
      cart.map((c) => ({
        id: String(c.id),
        name: String(c.name ?? ''),
        quantity: Math.max(1, Number(c.quantity || 1)),
        unitPrice: Number(c.price || 0),
        subtotal: Number(c.price || 0) * Math.max(1, Number(c.quantity || 1)),
      })),
    [cart]
  );

  const total = useMemo(
    () => items.reduce((s, it) => s + it.subtotal, 0),
    [items]
  );

  useEffect(() => {
    if (!cart || cart.length === 0) navigate('/cart');
  }, [cart, navigate]);

  const update =
    (k: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const isValid = () =>
    form.fullName.trim().length >= 2 &&
    form.phone.trim().length >= 6 &&
    form.address.trim().length >= 5 &&
    form.city.trim().length >= 2;

  const submit = async () => {
    if (!isValid()) {
      setErr(t('cod.errors.validation') || 'Veuillez vérifier le formulaire.');
      return;
    }
    try {
      setLoading(true);
      setErr(null);

      const order = await ordersService.create({
        customerName: form.fullName,
        customerEmail: form.email || '',
        customerPhone: form.phone,
        address: `${form.address}, ${form.city}`,
        items: items.map((it) => ({
          id: it.id,
          quantity: it.quantity,
        })),
        paymentMethod: 'COD',
        market: currency === 'EUR' ? 'FR' : 'MA',
      });

      clearCart();
      navigate('/checkout/success', {
        state: { orderRef: order.id || 'REF' },
      });
    } catch (e: any) {
      console.error(e);
      setErr(t('cod.errors.generic') || e?.message || 'Erreur serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('cod.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-4 border">
          {err && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{err}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">{t('cod.fullName')}</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.fullName}
                onChange={update('fullName')}
                placeholder={t('cod.fullNamePh') || ''}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">{t('cod.phone')}</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.phone}
                onChange={update('phone')}
                placeholder={t('cod.phonePh') || ''}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Email (optionnel)</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.email}
                onChange={update('email')}
                placeholder="ex. nom@domaine.com"
                type="email"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-1">{t('cod.address')}</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.address}
                onChange={update('address')}
                placeholder={t('cod.addressPh') || ''}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">{t('cod.city')}</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.city}
                onChange={update('city')}
                placeholder={t('cod.cityPh') || ''}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-1">{t('cod.note')}</label>
              <textarea
                className="w-full border rounded px-3 py-2 h-24"
                value={form.note}
                onChange={update('note')}
                placeholder={t('cod.notePh') || ''}
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              className="bg-sunset text-white px-4 py-2 rounded hover:bg-berry transition disabled:opacity-60"
              onClick={submit}
              disabled={loading}
            >
              {loading ? (t('cod.processing') || 'Traitement...') : t('cod.confirm')}
            </button>
            <Link to="/cart" className="text-ink/70 underline">
              {t('cod.backToCart')}
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 border">
          <h2 className="font-semibold mb-3">{t('cod.summary')}</h2>

          {items.length === 0 ? (
            <div className="text-sm text-ink/60">
              {t('cart.empty') || 'Votre panier est vide.'}
            </div>
          ) : (
            <>
              <ul className="space-y-2">
                {items.map((it) => (
                  <li key={it.id} className="flex justify-between text-sm">
                    <span className="truncate pr-2">
                      {it.name} × {it.quantity}
                    </span>
                    <span className="font-medium">{fmt(it.subtotal)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 border-t pt-3 flex justify-between font-bold">
                <span>{t('cod.total')}</span>
                <span>{fmt(total)}</span>
              </div>

              <p className="text-xs text-ink/60 mt-2">{t('cod.codNote')}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
