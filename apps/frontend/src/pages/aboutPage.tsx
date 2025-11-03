import { useTranslation } from 'react-i18next';
import { HeartHandshake, Sparkles, Layers } from 'lucide-react';
import atebas from '../assets/atebas.png'
import bracelet from '../assets/bracelet.png'


export default function AboutPage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <HeartHandshake size={22} />,
      title: t('about.values.craft'),
      desc: t('about.values.craftDesc'),
    },
    {
      icon: <Sparkles size={22} />,
      title: t('about.values.creativity'),
      desc: t('about.values.creativityDesc'),
    },
    {
      icon: <Layers size={22} />,
      title: t('about.values.quality'),
      desc: t('about.values.qualityDesc'),
    },
  ];

  return (
    <div className="min-h-screen bg-sand text-ink">
      <div className="bg-gradient-to-br from-sunset to-berry py-16 px-4 text-center text-white">
        <h1 className="text-4xl font-extrabold mb-3">{t('about.title')}</h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          {t('about.subtitle')}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <section className="bg-white rounded-lg shadow grid md:grid-cols-2 items-stretch overflow-hidden">
  <div className="p-6 flex flex-col justify-center">
    <h2 className="text-3xl font-bold mb-4 text-sunset">
      {t('about.bracelets.title')}
    </h2>
    <p className="leading-7 text-gray-700 mb-6">
      {t('about.bracelets.intro')}
    </p>
    <h3 className="text-xl font-semibold mb-2">
      {t('about.bracelets.howTitle')}
    </h3>
    <p className="text-gray-700 whitespace-pre-line leading-7">
      {t('about.bracelets.howDesc')}
    </p>
  </div>

  <img
    src={bracelet}
    alt="Bracelets brésiliens colorés"
    className="w-full h-full object-cover"
    loading="lazy"
  />
</section>

        <section className="bg-white rounded-lg shadow grid md:grid-cols-2 gap-6 items-center">
          <img
            src={atebas}
            alt="Atébas colorées dans les cheveux"
            className="w-full "
            loading="lazy"
          />
          <div>
            <h2 className="text-3xl font-bold mb-4 text-sunset">
              {t('about.atebas.title')}
            </h2>
            <p className="leading-7 text-gray-700 mb-6">
              {t('about.atebas.intro')}
            </p>
            <h3 className="text-xl font-semibold mb-2">
              {t('about.atebas.howTitle')}
            </h3>
            <p className="text-gray-700 whitespace-pre-line leading-7">
              {t('about.atebas.howDesc')}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="text-sunset mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-700">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">{t('about.ctaTitle')}</h3>
          <p className="text-gray-700 mb-4">{t('about.ctaSubtitle')}</p>
          <a
            href="https://www.instagram.com/fileor_kika/"
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-sunset text-white px-6 py-2 rounded-full hover:bg-berry transition"
          >
            {t('about.follow')}
          </a>
        </section>
      </div>
    </div>
  );
}
