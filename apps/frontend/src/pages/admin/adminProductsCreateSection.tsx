import { useMemo, useState } from 'react';
import { httpPostSecure } from '../../services/httpClient';
import { uploadProductImage, signImage } from '../../services/uploads.service';
import { Product } from '../../types';
import AccordionSection from '../../components/accordionSection';

const eurosToCents = (v: string | number) => {
  const s = String(v ?? '').trim();
  if (!s) return 0;
  const n = parseFloat(s.replace(',', '.'));
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.round(n * 100);
};

type Props = {
  onCreated?: (p: Product) => void;
};

export default function AdminProductsCreateSection({ onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [priceEuros, setPriceEuros] = useState<string>('');
  const [description, setDescription] = useState('');
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busyUp, setBusyUp] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const coverPreview = useMemo(() => previews[0] || '', [previews]);
  const descMax = 1000;

  const onUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusyUp(true);
    setErr(null);
    try {
      const { path } = await uploadProductImage(file);
      const url = await signImage(path);
      setImagePaths((p) => [...p, path]);
      setPreviews((p) => [...p, url]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyUp(false);
      e.target.value = '';
    }
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        priceCents: eurosToCents(priceEuros),
        currency: 'EUR',
        images: imagePaths,
        description: description.trim() || null,
      };
      const created = await httpPostSecure<Product>('/products', payload);
      setMsg(`Produit créé : ${created.title}`);

      setTitle('');
      setSlug('');
      setPriceEuros('');
      setDescription('');
      setImagePaths([]);
      setPreviews([]);

      onCreated?.(created);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <AccordionSection title="Créer un produit" defaultOpen>
      {msg && (
        <div className="mb-3 p-2 bg-green-100 text-green-800 rounded">
          {msg}
        </div>
      )}
      {err && (
        <div className="mb-3 p-2 bg-red-100 text-red-800 rounded">{err}</div>
      )}

      <div className="space-y-2 mb-3">
        <label className="block text-sm font-medium">Upload image</label>
        <input type="file" accept="image/*" onChange={onUploadFile} />
        {busyUp && <div className="text-sm">Upload...</div>}

        {!!previews.length && (
          <>
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Preview"
                className="w-full h-40 object-cover rounded border"
              />
            )}
            <div className="grid grid-cols-3 gap-2">
              {previews.map((u, i) => (
                <img
                  key={i}
                  src={u}
                  className="w-full h-24 object-cover rounded border"
                />
              ))}
            </div>
          </>
        )}
      </div>

      <form onSubmit={onCreate} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
        <input
          className="w-full border p-2 rounded"
          type="number"
          step="0.01"
          inputMode="decimal"
          placeholder="Prix en € (ex: 12.99)"
          value={priceEuros}
          onChange={(e) => setPriceEuros(e.target.value)}
          min={0}
          required
        />
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Description (optionnelle)
          </label>
          <textarea
            className="w-full border p-2 rounded min-h-[120px]"
            maxLength={descMax}
            placeholder="Décris le produit…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="text-xs text-gray-500 text-right">
            {description.length}/{descMax}
          </div>
        </div>
        <button
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={busyUp}
        >
          Créer
        </button>
      </form>
    </AccordionSection>
  );
}
