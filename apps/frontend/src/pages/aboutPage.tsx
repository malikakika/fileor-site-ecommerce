import { useTranslation } from 'react-i18next';
import { HeartHandshake, Sparkles, Layers } from 'lucide-react';

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
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{t('about.storyTitle')}</h2>
          <p className="leading-7 text-gray-700">{t('about.story')}</p>
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
