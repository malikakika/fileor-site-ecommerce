import { useEffect, useState } from 'react';
import { designsService, DesignDTO } from '../../services/designs.service';
import { signImage } from '../../services/uploads.service';
import AccordionSection from '../../components/accordionSection';
import { useTranslation } from 'react-i18next';

export default function AdminDesignsSection() {
  const { t } = useTranslation();

  const [items, setItems] = useState<
    Array<DesignDTO & { imageUrl?: string; exampleImageUrl?: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMeta, setPreviewMeta] = useState<{ id: string; title?: string } | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const data = await designsService.list();

      const withUrls = await Promise.all(
        data.map(async (d) => {
          const imageUrl = await signImage(d.imagePath);
          const exampleImageUrl = d.exampleImage ? await signImage(d.exampleImage) : undefined;
          return { ...d, imageUrl, exampleImageUrl };
        })
      );
      setItems(withUrls);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const right = (
    <button
      className="text-sm underline"
      onClick={(e) => {
        e.stopPropagation();
        load();
      }}
      disabled={loading}
    >
      {loading ? t('designs.loading') : t('designs.refresh')}
    </button>
  );

  const openPreview = async (
    d: DesignDTO & { imageUrl?: string; exampleImageUrl?: string },
    type: 'design' | 'example'
  ) => {
    try {
      const src =
        type === 'design'
          ? await signImage(d.imagePath)
          : d.exampleImage
          ? await signImage(d.exampleImage)
          : null;

      if (!src) return;

      setPreviewUrl(src);
      const who = d.user?.email || d.user?.name || d.userId?.slice(0, 8) || d.id.slice(0, 8);

      setPreviewMeta({
        id: d.id,
        title: type === 'design' ? `${t('designs.design')} ${who}` : `${t('designs.exampleImage')} ${who}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewMeta(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <AccordionSection title={t('designs.sectionTitle')} rightAdornment={right}>
      {err && (
        <div className="mb-3 p-2 bg-red-100 text-red-800 rounded">{err}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((d) => {
          const userLabel = d.user
            ? `${d.user.name ? d.user.name + ' • ' : ''}${d.user.email}`
            : `${t('designs.user')}: ${d.userId?.slice(0, 8)}`;

          return (
            <div
              key={d.id}
              className="border rounded-lg overflow-hidden bg-white shadow-sm"
            >
              {/* Image principale */}
              <button
                type="button"
                onClick={() => openPreview(d, 'design')}
                className="block w-full group"
                title={t('designs.showDesign')}
              >
                {d.imageUrl ? (
                  <img
                    src={d.imageUrl}
                    alt={d.id}
                    className="w-full h-48 object-contain bg-gray-50 transition group-hover:opacity-90"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400">
                    {t('designs.noImage')}
                  </div>
                )}
              </button>

              {/* Image d’exemple */}
              {d.exampleImageUrl && (
                <button
                  type="button"
                  onClick={() => openPreview(d, 'example')}
                  className="block w-full group border-t"
                  title={t('designs.showExample')}
                >
                  <img
                    src={d.exampleImageUrl}
                    alt={`example-${d.id}`}
                    className="w-full h-32 object-contain bg-gray-50 transition group-hover:opacity-90"
                  />
                  <div className="text-xs text-gray-500 text-center py-1">
                    {t('designs.exampleImage')}
                  </div>
                </button>
              )}

              <div className="p-3 text-sm">
                <div className="font-medium flex items-center justify-between gap-2">
                  <span>#{d.id.slice(0, 8)}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(d.createdAt).toLocaleString('fr-FR')}
                  </span>
                </div>

                <div className="mt-1 text-gray-700">{userLabel}</div>

                {d.message && (
                  <div className="text-gray-600 mt-1">“{d.message}”</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!loading && items.length === 0 && (
        <div className="text-center text-gray-500 py-6">{t('designs.empty')}</div>
      )}

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-white mb-2">
              <div className="text-sm opacity-80">
                {previewMeta?.title} — {previewMeta?.id?.slice(0, 8)}
              </div>
              <button
                onClick={closePreview}
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                title={t('designs.close')}
              >
                {t('designs.close')}
              </button>
            </div>
            <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
              <img
                src={previewUrl}
                alt="preview"
                className="max-h-[80vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </AccordionSection>
  );
}
