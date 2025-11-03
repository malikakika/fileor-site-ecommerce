import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import background from '../../assets/background.png';

export default function HeroSection() {
  const { t } = useTranslation();
  const values = [
    {
      id: 'handmade',
      color: 'text-amber-200',
      title: t('home.handmade'),
      text: t('home.handmade_story'),
    },
    {
      id: 'unique',
      color: 'text-pink-200',
      title: t('home.unique'),
      text: t('home.values_story_2'),
    },
    {
      id: 'community',
      color: 'text-sunset',
      title: t('home.community'),
      text: t('home.values_story_3'),
    },
  ];

  const [index, setIndex] = useState(0);
  const current = values[index];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % values.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [values.length]);

  return (
    <section
      className="relative flex items-center min-h-[90vh] overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-0"></div>

      <div className="relative z-10 text-left px-8 md:px-20 max-w-2xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-white drop-shadow-lg"
        >
          {t('home.why_choose')}
        </motion.h1>

        <p className="text-lg sm:text-xl text-gray-200 mb-6 max-w-xl">
          {t('home.hero_description')}
        </p>

        {/* Texte animé */}
        <div className="h-24 flex items-center mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className={`text-xl md:text-2xl font-medium ${current.color} max-w-2xl whitespace-pre-line`}
            >
              {current.text}
            </motion.div>
          </AnimatePresence>
        </div>

        <Link to="/editor">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-sunset px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-xl hover:bg-sand hover:text-berry transition-all duration-300 flex items-center gap-2 font-semibold"
          >
            {t('home.personalize_button')}
            <ArrowRight size={18} />
          </motion.button>
        </Link>

        <p className="mt-6 text-sm text-gray-300">{t('home.hero_subtext')}</p>
      </div>
    </section>
  );
}
