import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { register, setSession } from '../services/auth.service';
import { httpPost } from '../services/httpClient';
import type { LoginResponse } from '../types';
import { PasswordInput } from '../components/passwordInput';
import { normalizeApiError } from '../utils/errors';
import { useTranslation } from 'react-i18next';
import background from '../assets/background.png';

export default function RegisterPage() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;

  const onGoogleSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential;
      const data = await httpPost<LoginResponse>('/auth/google/token', {
        idToken,
      });
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
      if (password !== confirm)
        throw new Error(t('auth.errors.passwordMismatch'));
      await register(email.trim(), password, name.trim());
      nav('/login');
    } catch (err: any) {
      setError(normalizeApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunset/10 via-white to-berry/10 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div
          className="md:w-1/2 relative flex items-center min-h-[90vh] overflow-hidden bg-cover bg-center text-white flex flex-col items-center justify-center p-10"
          style={{ backgroundImage: `url(${background})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/70 to-transparent z-0"></div>

          <div className="text-center z-10 px-6">
            <h2 className="text-5xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
              {t('auth.welcomeTo')} <span className="text-sunset">Fileor</span>
            </h2>

            <p className="text-lg mb-10 text-gray-200 max-w-md mx-auto leading-relaxed">
              {t('auth.registerSubtitle')}
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
            <Link
              to="/login"
              className="text-gray-500 hover:text-sunset border-b-2 border-transparent hover:border-sunset transition"
            >
              {t('auth.signIn')}
            </Link>
            <span className="text-sunset border-b-2 border-sunset">
              {t('auth.register')}
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {t('auth.registerTitle')}
          </h2>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-300 px-3 py-2 rounded">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">{t('auth.fullName')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-sunset"
              />
            </div>

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
              id="password"
              label={t('auth.password')}
              value={password}
              onChange={setPassword}
            />
            <PasswordInput
              id="confirm-password"
              label={t('auth.confirmPassword')}
              value={confirm}
              onChange={setConfirm}
            />

            <div className="flex items-center text-sm">
              <input type="checkbox" className="mr-2" required />
              <span>
                {t('auth.agreeTo')}{' '}
                <a href="#" className="text-sunset-600 hover:underline">
                  {t('auth.terms')}
                </a>
              </span>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-sunset  text-white font-semibold rounded px-4 py-2 hover:bg-sunset transition disabled:opacity-60"
            >
              {busy ? t('auth.creating') : t('auth.signUp')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
