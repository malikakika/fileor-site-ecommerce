import { useEffect, useState } from 'react';
import {
  httpDeleteSecure,
  httpGetSecure,
  httpPatchSecure,
} from '../../services/httpClient';
import { Product } from '../../types';
import AccordionSection from '../../components/accordionSection';

const centsToEuros = (cents?: number) => Number(cents || 0) / 100;
const eurosToCents = (v: string | number) => {
  const s = String(v ?? '').trim();
  if (!s) return 0;
  const n = parseFloat(s.replace(',', '.'));
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.round(n * 100);
};

type Props = {
  reloadKey?: number;
};

export default function AdminProductsListSection({ reloadKey }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Partial<Product>>({});

  const loadProducts = async () => {
    try {
      setLoadingList(true);
      const list = await httpGetSecure<Product[]>('/products');
      setProducts(list);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [reloadKey]);

  const startEdit = (p: Product) => {
    setEditId(p.id);
    setEditRow({
      title: p.title,
      slug: p.slug,
      priceCents: p.priceCents,
      description: p.description ?? '',
      isBestSeller: p.isBestSeller ?? false,
    });
  };
  const cancelEdit = () => {
    setEditId(null);
    setEditRow({});
  };

  const saveEdit = async (id: string) => {
    try {
      const payload: Partial<Product> = {
        title: (editRow.title ?? '').toString().trim(),
        slug: (editRow.slug ?? '').toString().trim(),
        priceCents: Math.max(0, Number(editRow.priceCents) || 0),
        description: (editRow.description ?? '')?.toString().trim() || null,
        isBestSeller: !!editRow.isBestSeller, 
      };
      const updated = await httpPatchSecure<Product>(
        `/products/${id}`,
        payload
      );
      setProducts((arr) =>
        arr.map((x) => (x.id === id ? { ...x, ...updated } : x))
      );
      setMsg('Produit modifié');
      cancelEdit();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const onDelete = async (p: Product) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Supprimer "${p.title}" ?`)) return;
    try {
      setProducts((arr) => arr.filter((x) => x.id !== p.id));
      await httpDeleteSecure(`/products/${p.id}`);
      setMsg(`Produit supprimé : ${p.title}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      loadProducts();
    }
  };

  const refreshBtn = (
    <button
      className="text-sm underline"
      onClick={(e) => {
        e.stopPropagation();
        loadProducts();
      }}
      disabled={loadingList}
      title="Rafraîchir"
    >
      {loadingList ? 'Chargement…' : 'Rafraîchir'}
    </button>
  );

  return (
    <AccordionSection title="Mes produits" rightAdornment={refreshBtn}>
      {msg && (
        <div className="mb-3 p-2 bg-green-100 text-green-800 rounded">
          {msg}
        </div>
      )}
      {err && (
        <div className="mb-3 p-2 bg-red-100 text-red-800 rounded">{err}</div>
      )}

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Titre</th>
              <th className="text-left p-2">Slug</th>
              <th className="text-right p-2">Prix</th>
              <th className="text-left p-2">Description</th>
              <th className="p-2 text-center">Best Seller</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isEditing = editId === p.id;
              return (
                <tr key={p.id} className="border-t">
                  <td className="p-2 align-top">
                    {isEditing ? (
                      <input
                        className="border p-1 rounded w-full"
                        value={editRow.title ?? ''}
                        onChange={(e) =>
                          setEditRow((r) => ({ ...r, title: e.target.value }))
                        }
                      />
                    ) : (
                      <span className="font-medium">{p.title}</span>
                    )}
                  </td>

                  <td className="p-2 align-top">
                    {isEditing ? (
                      <input
                        className="border p-1 rounded w-full"
                        value={editRow.slug ?? ''}
                        onChange={(e) =>
                          setEditRow((r) => ({ ...r, slug: e.target.value }))
                        }
                      />
                    ) : (
                      p.slug
                    )}
                  </td>

                  <td className="p-2 align-top text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        className="border p-1 rounded w-28 text-right"
                        value={centsToEuros(
                          editRow.priceCents as number
                        ).toFixed(2)}
                        onChange={(e) =>
                          setEditRow((r) => ({
                            ...r,
                            priceCents: eurosToCents(e.target.value),
                          }))
                        }
                      />
                    ) : (
                      new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(centsToEuros(p.priceCents))
                    )}
                  </td>

                  <td className="p-2 align-top">
                    {isEditing ? (
                      <textarea
                        className="border p-1 rounded w-full min-h-[60px]"
                        value={editRow.description ?? ''}
                        onChange={(e) =>
                          setEditRow((r) => ({
                            ...r,
                            description: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <span className="line-clamp-2">
                        {p.description ?? '—'}
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={!!editRow.isBestSeller}
                        onChange={(e) =>
                          setEditRow((r) => ({
                            ...r,
                            isBestSeller: e.target.checked,
                          }))
                        }
                      />
                    ) : p.isBestSeller ? (
                      '⭐'
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="p-2 align-top whitespace-nowrap">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 rounded bg-black text-white"
                          onClick={() => saveEdit(p.id)}
                        >
                          Enregistrer
                        </button>
                        <button
                          className="px-2 py-1 rounded border"
                          onClick={cancelEdit}
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 rounded border"
                          onClick={() => startEdit(p)}
                        >
                          Modifier
                        </button>
                        <button
                          className="px-2 py-1 rounded border text-red-600"
                          onClick={() => onDelete(p)}
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

            {!products.length && !loadingList && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Aucun produit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AccordionSection>
  );
}
