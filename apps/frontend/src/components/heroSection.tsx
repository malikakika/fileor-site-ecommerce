import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      <div className="bg-gradient-to-br from-sunset via-berry to-sunset py-10 px-6 text-center text-white relative">
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight drop-shadow-lg">
            {t('home.hero_title')}
          </h1>
          <p className="text-lg sm:text-xl mt-4 opacity-90">
            {t('home.hero_description')}
          </p>
          <div className="mt-8">
            <Link to="/editor">
              <button className="bg-white text-sunset px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-xl hover:bg-sand hover:text-berry transition-all duration-300 flex items-center gap-2 mx-auto">
                {t('home.personalize_button')}
                <ArrowRight size={18} />
              </button>
            </Link>
          </div>

          <p className="mt-6 text-sm opacity-80">{t('home.hero_subtext')}</p>
        </div>
      </div>
    </section>
  );
}
