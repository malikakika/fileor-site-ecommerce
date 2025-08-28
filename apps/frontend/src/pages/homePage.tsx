import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import HeroSection from '../components/heroSection';
import { Palette, Star, Handshake, Instagram } from 'lucide-react';

const products = [
  {
    id: 1,
    name: 'bracelet.sun',
    image:
      'https://tse2.mm.bing.net/th/id/OIP.jamHpOzQJyFU52djmHQhrAHaFj?pid=Api',
    colors: ['#FF8C42', '#FFEBC1', '#3FB8AF'],
  },
  {
    id: 2,
    name: 'bracelet.ocean',
    image:
      'https://tse2.mm.bing.net/th/id/OIP.RhecJyejoZ0rVZUpS9_R9QHaFs?pid=Api',
    colors: ['#3FB8AF', '#3E8914', '#2B2D42'],
  },
  {
    id: 3,
    name: 'bracelet.forest',
    image:
      'https://tse4.mm.bing.net/th/id/OIP.X_octfHyM6K9ZOkjsjIA_QHaJd?pid=Api',
    colors: ['#3E8914', '#D72638', '#FF8C42'],
  },
];

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="bg-sand min-h-screen text-ink">
      <HeroSection />

      <div className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">
          {t('home.section_title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((bracelet) => (
            <div
              key={bracelet.id}
              className="bg-white border border-sunset rounded-lg shadow hover:shadow-lg transition"
            >
              <img
                src={bracelet.image}
                alt={bracelet.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  {t(bracelet.name)}
                </h3>
                <div className="flex gap-2">
                  {bracelet.colors.map((color, index) => (
                    <span
                      key={index}
                      className="w-5 h-5 rounded-full border"
                      style={{ backgroundColor: color }}
                    ></span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white py-12 px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {t('home.why_choose')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">
          <div className="p-6 border rounded-lg shadow hover:shadow-lg transition">
            <Palette className="w-10 h-10 mx-auto text-sunset" />
            <h3 className="text-xl font-semibold mt-4">{t('home.handmade')}</h3>
            <p className="mt-2 text-gray-600">{t('home.handmade_text')}</p>
          </div>
          <div className="p-6 border rounded-lg shadow hover:shadow-lg transition">
            <Star className="w-10 h-10 mx-auto text-yellow-400" />
            <h3 className="text-xl font-semibold mt-4">{t('home.unique')}</h3>
            <p className="mt-2 text-gray-600">{t('home.unique_text')}</p>
          </div>
          <div className="p-6 border rounded-lg shadow hover:shadow-lg transition">
            <Handshake className="w-10 h-10 mx-auto text-berry" />
            <h3 className="text-xl font-semibold mt-4">
              {t('home.community')}
            </h3>
            <p className="mt-2 text-gray-600">{t('home.community_text')}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-sunset to-berry py-12 px-4 text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {t('home.testimonials')}
        </h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white text-ink p-6 rounded-lg shadow">
            <p className="italic">"{t('home.testimonial1')}"</p>
            <p className="mt-4 font-semibold">- {t('home.client1')}</p>
          </div>
          <div className="bg-white text-ink p-6 rounded-lg shadow">
            <p className="italic">"{t('home.testimonial2')}"</p>
            <p className="mt-4 font-semibold">- {t('home.client2')}</p>
          </div>
        </div>
      </div>

      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('home.cta_title')}</h2>
        <p className="mb-6 text-gray-700">{t('home.cta_text')}</p>
        <Link to="/editor">
          <button className="bg-sunset text-white px-6 py-3 rounded-full hover:bg-berry transition font-semibold">
            {t('home.personalize_button')}
          </button>
        </Link>
      </div>

      <div className="bg-gray-100 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('home.instagram_title')}</h2>
        <p className="mb-6 text-gray-600">{t('home.instagram_text')}</p>
        <a
          href="https://www.instagram.com/fileor_kika/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
        >
          <Instagram className="w-5 h-5" />
          {t('home.follow_instagram')}
        </a>
      </div>
    </div>
  );
}
