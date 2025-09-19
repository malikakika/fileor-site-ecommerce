import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ThankYouPage() {
  const { t } = useTranslation();
  const loc = useLocation() as any;
  const ref = loc?.state?.orderRef;

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 text-center">
      <h1 className="text-3xl font-bold mb-3">{t('cod.thanksTitle')}</h1>
      <p className="text-ink/80 mb-6">
        {t('cod.thanksSubtitle')}
      </p>
      {ref && (
        <p className="mb-6">
          {t('cod.orderRef')}: <span className="font-mono">{ref}</span>
        </p>
      )}
      <Link
        to="/products"
        className="inline-block bg-sunset text-white px-5 py-2 rounded hover:bg-berry transition"
      >
        {t('cod.continueShopping')}
      </Link>
    </div>
  );
}
