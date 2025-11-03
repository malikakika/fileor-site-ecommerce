import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import HeroSection from '../components/home/heroSection';

import {

  Instagram,
 
} from 'lucide-react';
import ProductCard from '../components/productCard';
import { useEffect, useState } from 'react';
import { Product } from '../types';
import { httpGet } from '../services/httpClient';
import CreationsSection from '../components/home/creationsSection';



export default function HomePage() {
  const { t } = useTranslation();


  const [bestSellers, setBestSellers] = useState<Product[]>([]);

  useEffect(() => {
    httpGet<Product[]>('/products?isBestSeller=true')
      .then(setBestSellers)
      .catch(console.error);
  }, []);

  return (
    <div className="bg-sand min-h-screen text-ink">
      <HeroSection />


      <div className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">
          {t('home.section_title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {bestSellers.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              price={(p.priceCents / 100).toFixed(2) + ' €'}
            />
          ))}
        </div>
      </div>

    <CreationsSection/>
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
