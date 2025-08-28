import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register } from '../services/auth.service';
import { PasswordInput } from '../components/passwordInput';
import { normalizeApiError } from '../utils/errors';

export default function RegisterPage() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(false);

    if (password !== confirm) {
      setError(t('auth.errors.passwordMismatch'));
      setBusy(false);
      return;
    }
    if (password.length < 6) {
      setError(t('auth.errors.passwordTooShort'));
      setBusy(false);
      return;
    }

    try {
      await register(
        email.trim().toLowerCase(),
        password,
        name.trim() || undefined
      );
      setOk(true);
      setTimeout(() => nav('/login'), 1000);
    } catch (err: any) {
      const kind = normalizeApiError(err);
      const msg =
        kind === 'EMAIL_IN_USE'
          ? t('auth.errors.emailInUse')
          : kind === 'PASSWORD_TOO_SHORT'
          ? t('auth.errors.passwordTooShort')
          : kind === 'VALIDATION'
          ? t('auth.errors.validation')
          : t('auth.errors.generic');
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {t('auth.registerTitle')}
        </h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-300 px-3 py-2 rounded">
            {error}
          </div>
        )}
        {ok && (
          <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-300 px-3 py-2 rounded">
            {t('auth.success.register')}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">
              {t('auth.nameOptional')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

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

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-60"
          >
            {busy ? t('auth.registering') : t('auth.register')}
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          {t('auth.alreadyAccount')}{' '}
          <Link to="/login" className="text-blue-600 underline">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
