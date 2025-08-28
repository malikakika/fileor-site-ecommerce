import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PasswordInput } from '../components/passwordInput';
import { login } from '../services/auth.service';

export default function LoginPage() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {t('auth.loginTitle')}
        </h1>

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
              className="w-full border rounded px-3 py-2"
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
            className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-60"
          >
            {busy ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-blue-600 underline">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
