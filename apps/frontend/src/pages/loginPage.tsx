import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { PasswordInput } from '../components/passwordInput';
import { login, setSession } from '../services/auth.service';
import { httpPost } from '../services/httpClient';
import type { LoginResponse } from '../types';
import background from '../assets/background.png';

export default function LoginPage() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;

  const onGoogleSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential;
      const data = await httpPost<LoginResponse>('/auth/google/token', { idToken });
      setSession(data.access_token, data.user);
      nav('/');
    } catch {
      setError(t('auth.errors.googleFailed'));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim().toLowerCase(), password);
      nav('/');
    } catch (err: any) {
      const raw = err?.message || '';
      if (raw.includes('Unauthorized') || raw.includes('Invalid credentials')) {
        setError(t('auth.errors.invalidCredentials'));
      } else {
        setError(t('auth.errors.generic'));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunset/10 via-white to-berry/10 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div
          className="md:w-1/2 relative flex items-center min-h-[90vh] overflow-hidden bg-cover bg-center text-white flex flex-col justify-center p-10"
          style={{ backgroundImage: `url(${background})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/70 to-transparent z-0"></div>

          <div className="text-center z-10 px-6">
            <h2 className="text-5xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
              {t('auth.welcomeBack')} <span className="text-sunset">Fileor</span>
            </h2>

            <p className="text-lg mb-10 text-gray-200 max-w-md mx-auto leading-relaxed">
              {t('auth.loginSubtitle')}
            </p>

            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <div className="flex justify-center mb-4">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={() => setError(t('auth.errors.googleFailed'))}
                />
              </div>
            </GoogleOAuthProvider>
          </div>
        </div>

        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <div className="flex justify-end mb-6 space-x-4 text-sm font-medium">
            <span className="text-sunset border-b-2 border-sunset">
              {t('auth.signIn')}
            </span>
            <Link
              to="/register"
              className="text-gray-500 hover:text-sunset border-b-2 border-transparent hover:border-sunset transition"
            >
              {t('auth.register')}
            </Link>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {t('auth.loginTitle')}
          </h2>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-300 px-3 py-2 rounded">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-sunset"
                required
              />
            </div>

            <PasswordInput
              id="login-password"
              label={t('auth.password')}
              value={password}
              onChange={setPassword}
            />

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-sunset text-white font-semibold rounded px-4 py-2 hover:bg-sunset transition disabled:opacity-60"
            >
              {busy ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>

          <p className="text-sm mt-4 text-center">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-sunset underline">
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
