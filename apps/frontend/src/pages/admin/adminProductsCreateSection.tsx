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
  const [mainImage, setMainImage] = useState<string | null>(null); // ✅ nouvelle variable
  const [busyUp, setBusyUp] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const descMax = 1000;

  const onUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setBusyUp(true);
    setErr(null);
    try {
      const newPaths: string[] = [];
      const newPreviews: string[] = [];

      for (const file of Array.from(files)) {
        const { path } = await uploadProductImage(file);
        const url = await signImage(path);
        newPaths.push(path);
        newPreviews.push(url);
      }

      setImagePaths((p) => [...p, ...newPaths]);
      setPreviews((p) => [...p, ...newPreviews]);
      if (!mainImage && newPreviews.length > 0) {
        setMainImage(newPreviews[0]); 
      }
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
        description: description.trim() || null,
        images: imagePaths,
        coverImage: mainImage, 
      };
      const created = await httpPostSecure<Product>('/products', payload);
      setMsg(`Produit créé : ${created.title}`);

      setTitle('');
      setSlug('');
      setPriceEuros('');
      setDescription('');
      setImagePaths([]);
      setPreviews([]);
      setMainImage(null);

      onCreated?.(created);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <AccordionSection title="Créer un produit" defaultOpen>
      {msg && <div className="mb-3 p-2 bg-green-100 text-green-800 rounded">{msg}</div>}
      {err && <div className="mb-3 p-2 bg-red-100 text-red-800 rounded">{err}</div>}

      <div className="space-y-2 mb-3">
        <label className="block text-sm font-medium">Uploader des images</label>
        <input type="file" accept="image/*" multiple onChange={onUploadFiles} /> {/* ✅ multiple */}
        {busyUp && <div className="text-sm">Upload...</div>}

        {!!previews.length && (
          <>
            {mainImage && (
              <div>
                <p className="text-sm font-semibold mb-1">Image principale :</p>
                <img
                  src={mainImage}
                  alt="Principale"
                  className="w-full h-40 object-cover rounded border-2 border-blue-500 mb-3"
                />
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {previews.map((url, i) => (
                <div
                  key={i}
                  className={`relative cursor-pointer border rounded overflow-hidden ${
                    url === mainImage ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setMainImage(url)} 
                >
                  <img
                    src={url}
                    className="w-full h-24 object-cover"
                    alt={`preview-${i}`}
                  />
                  {url === mainImage && (
                    <div className="absolute inset-0 bg-blue-500/20"></div>
                  )}
                </div>
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
