import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import {
  ShoppingCart,
  LogIn,
  UserPlus,
  LogOut,
  MessageCircle,
} from 'lucide-react';
import { useCart } from '../context/cartContext';
import LanguageSwitcher from './languageSwitcher';
import {
  getCurrentUser,
  clearSession,
  AUTH_EVENT,
} from '../services/auth.service';

export default function Header() {
  const { t } = useTranslation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { cart } = useCart();
  const navigate = useNavigate();

  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth_user' || e.key === 'auth_token') {
        setUser(getCurrentUser());
      }
    };
    const onAuthChange = () => setUser(getCurrentUser());

    window.addEventListener('storage', onStorage);
    window.addEventListener(AUTH_EVENT, onAuthChange);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(AUTH_EVENT, onAuthChange);
    };
  }, []);

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const initials = useMemo(() => {
    const n = user?.name?.trim() || user?.email || '';
    const parts = n.split(/\s+/).filter(Boolean);
    const s = parts.length >= 2 ? parts[0][0] + parts[1][0] : n[0];
    return (s || '?').toUpperCase();
  }, [user]);

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-sunset to-berry text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
         <Link to="/" className="flex items-center ">
    <img
      src="public/logo.png" 
      alt="Filéor logo"
      className="W-32 h-32 object-contain hover:scale-105 transition-transform"
    />
         </Link>

        <nav className="hidden md:flex space-x-8 items-center">
          <NavLink to="/" className="hover:text-yellow-300 font-medium">
            {t('nav.home')}
          </NavLink>

          <NavLink to="/editor" className="hover:text-yellow-300 font-medium">
            {t('nav.customize')}
          </NavLink>

          <NavLink to="/products" className="hover:text-yellow-300 font-medium">
            {t('nav.products')}
          </NavLink>

          <NavLink to="/about" className="hover:text-yellow-300 font-medium">
            {t('nav.about')}
          </NavLink>
          <NavLink to="/contact" className="hover:text-yellow-300 font-medium">
            {t('nav.contact')}
          </NavLink>
        </nav>

        <div className="flex items-center space-x-3">
          {user && (
            <button
              onClick={() => navigate('/chat')}
              className="relative hover:text-yellow-300 focus:outline-none"
              aria-label="Ouvrir le chat de support"
              title="Support"
            >
              <MessageCircle size={26} />
            </button>
          )}

          {user && (
            <button
              onClick={() => navigate('/cart')}
              className="relative hover:text-yellow-300 focus:outline-none"
              aria-label="Ouvrir le panier"
              title={t('nav.cart') || 'Panier'}
            >
              <ShoppingCart size={26} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          )}

          <LanguageSwitcher />

          {!user ? (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded"
                title={t('auth.login') || 'Se connecter'}
              >
                <LogIn size={16} />
                <span className="hidden sm:inline">{t('auth.login')}</span>
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-1 bg-yellow-400 text-ink hover:bg-yellow-300 px-3 py-1.5 rounded"
                title={t('auth.register') || 'Créer un compte'}
              >
                <UserPlus size={16} />
                <span className="hidden sm:inline">{t('auth.register')}</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-white/90 text-ink font-bold grid place-items-center hover:bg-white"
                title={user.email}
              >
                {initials}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white text-ink rounded shadow z-50">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-semibold truncate">
                      {user.name || user.email}
                    </p>
                  </div>

                  <button
                    className="w-full text-left px-4 py-2 hover:bg-sand"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/account');
                    }}
                  >
                    {t('auth.profile')}
                  </button>

                  {user.role === 'ADMIN' && (
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-sand"
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/admin');
                      }}
                    >
                      {t('auth.admin')}
                    </button>
                  )}

                  <button
                    className="w-full text-left px-4 py-2 hover:bg-sand flex items-center gap-2 text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} /> {t('auth.logout')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden px-4 pb-3 flex gap-3">
        {!user ? (
          <>
            <button
              onClick={() => navigate('/login')}
              className="flex-1 bg-white/10 hover:bg-white/20 px-3 py-2 rounded"
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex-1 bg-yellow-400 text-ink hover:bg-yellow-300 px-3 py-2 rounded"
            >
              {t('auth.register')}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/account')}
              className="flex-1 bg-white/10 hover:bg-white/20 px-3 py-2 rounded"
            >
              {t('auth.profile')}
            </button>
            {user.role === 'ADMIN' && (
              <button
                onClick={() => navigate('/admin')}
                className="flex-1 bg-white/10 hover:bg-white/20 px-3 py-2 rounded"
              >
                {t('auth.admin')}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex-1 bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-red-200"
            >
              {t('auth.logout')}
            </button>
          </>
        )}
      </div>
    </header>
  );
}
