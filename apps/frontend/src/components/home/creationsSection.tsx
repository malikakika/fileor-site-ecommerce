import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import atebas from '../../assets/atebas.png';
import braceletbresil from '../../assets/bracelet.png';
import alpha from '../../assets/alpha.png';
import perle from '../../assets/perle.png';
import colier from '../../assets/colier.png';
import create from '../../assets/create.png';

export default function CreationsSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const creations = [
    {
      id: 'brazilian',
      title: t('home.brazilian'),
      text: t('home.brazilian_text'),
      image: braceletbresil,
      link: '/products',
    },
    {
      id: 'alpha',
      title: t('home.alpha'),
      text: t('home.alpha_text'),
      image: alpha,
      link: '/products',
    },
    {
      id: 'atebas',
      title: t('home.atebas'),
      text: t('home.atebas_text'),
      image: atebas,
      link: '/products',
    },
    {
      id: 'beads',
      title: t('home.beads'),
      text: t('home.beads_text'),
      image: perle,
      link: '/products',
    },
    {
      id: 'necklaces',
      title: t('home.necklaces'),
      text: t('home.necklaces_text'),
      image: colier,
      link: '/products',
    },
    {
      id: 'custom',
      title: t('home.custom'),
      text: t('home.custom_text'),

      image: create,
      link: '/editor',
      special: true,
    },
  ];

  return (
    <div className="relative bg-gradient-to-br from-sunset/10 via-white to-berry/10 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-10 text-ink">
          {t('home.creations_title')}
        </h3>


        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {creations.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(item.link)}
              className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border-t-4 hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="h-80 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ${
                    item.special ? 'opacity-90' : ''
                  }`}
                />
              </div>

              <div className="p-6 flex flex-col justify-between text-center">
                <h4 className="text-lg font-bold mb-2 transition">
                  {item.title}
                </h4>
                <p className="text-gray-600 text-sm">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>{' '}
    </div>
  );
}
