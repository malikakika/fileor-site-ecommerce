import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Instagram } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-16 bg-gradient-to-br from-sunset to-berry text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-2xl font-extrabold tracking-wide">Fileor</h3>
          <p className="mt-3 text-white/90">{t('footer.tagline')}</p>

          <div className="mt-4">
            <a
              href="https://www.instagram.com/fileor_kika/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 hover:bg-white/20 transition"
              aria-label="Instagram"
              title="@fileor_kika"
            >
              <Instagram size={18} />
              <span>{t('footer.follow_us')} @fileor_kika</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3">{t('footer.products')}</h4>
          <ul className="space-y-2 text-white/90">
            <li>
              <Link to="/products/bracelets" className="hover:underline">
                {t('nav.brazilianBracelets')}
              </Link>
            </li>
            <li>
              <Link to="/products/atebas" className="hover:underline">
                {t('nav.atebas')}
              </Link>
            </li>
            <li>
              <Link to="/products/beadAccessories" className="hover:underline">
                {t('nav.beadAccessories')}
              </Link>
            </li>
            <li>
              <Link to="/products/anklets" className="hover:underline">
                {t('nav.anklets')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3">{t('footer.links')}</h4>
          <ul className="space-y-2 text-white/90">
            <li>
              <Link to="/" className="hover:underline">
                {t('nav.home')}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                {t('nav.about')}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                {t('nav.contact')}
              </Link>
            </li>
            <li>
              <Link to="/editor" className="hover:underline">
                {t('nav.customize')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3">{t('footer.contact')}</h4>
          <ul className="space-y-2 text-white/90">
            <li className="flex items-center gap-2">
              <Mail size={18} />{' '}
              <a href="mailto:contact@fileor.local" className="hover:underline">
                contact@fileor.local
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={18} />{' '}
              <a href="tel:+33000000000" className="hover:underline">
                +33 0 00 00 00 00
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={18} /> <span>{t('footer.city_country')}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-white/80">
            © {new Date().getFullYear()} Fileor. {t('footer.rights')}
          </p>
          <div className="text-sm text-white/80">
            <Link to="/legal" className="hover:underline">
              {t('footer.legal')}
            </Link>
            <span className="mx-2">•</span>
            <Link to="/privacy" className="hover:underline">
              {t('footer.privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
