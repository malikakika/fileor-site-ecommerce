import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  httpGetSecure,
  httpPatchSecure,
  httpPostSecure,
} from '../services/httpClient';
import { getCurrentUser, getToken, setSession } from '../services/auth.service';
import { PasswordInput } from '../components/passwordInput';

type Me = {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: string;
  updatedAt: string;
};

export default function AccountPage() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState('');
  const [pwOld, setPwOld] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await httpGetSecure<Me>('/auth/me');
        if (!alive) return;
        setMe(data);
        setName(data.name || '');
      } catch (e) {
        setErr(
          e instanceof Error ? e.message : (t('account.errors.load') as string)
        );
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [t]);

  const onSaveProfile = async () => {
    setMsg(null);
    setErr(null);
    try {
      const updated = await httpPatchSecure<Me>('/users/me', { name });
      setMe(updated);

      const current = getCurrentUser();
      const token = getToken();
      if (current && token) {
        setSession(token, { ...current, name: updated.name });
      }

      setMsg(t('account.success.profileUpdated'));
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : (t('account.errors.profileUpdate') as string)
      );
    }
  };

  const onChangePassword = async () => {
    setMsg(null);
    setErr(null);
    try {
      await httpPostSecure<{ ok: true }>('/auth/change-password', {
        oldPassword: pwOld,
        newPassword: pwNew,
      });
      setPwOld('');
      setPwNew('');
      setMsg(t('account.success.passwordUpdated'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (
        msg.includes('Unauthorized') ||
        msg.includes('Old password incorrect')
      ) {
        setErr(t('account.errors.oldPasswordIncorrect'));
      } else {
        setErr(msg || (t('account.errors.passwordUpdate') as string));
      }
    }
  };

  if (loading)
    return <div className="max-w-4xl mx-auto p-4">{t('account.loading')}</div>;
  if (err)
    return <div className="max-w-4xl mx-auto p-4 text-red-600">{err}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">{t('account.title')}</h1>

      {msg && (
        <div className="p-3 bg-green-100 text-green-800 rounded">{msg}</div>
      )}

      <section className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-3">
          {t('account.personalInfo')}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600">
              {t('account.email')}
            </label>
            <input
              disabled
              value={me?.email || ''}
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">
              {t('account.name')}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <button
            onClick={onSaveProfile}
            className="mt-2 px-4 py-2 bg-sunset text-white rounded hover:bg-berry"
          >
            {t('account.save')}
          </button>
        </div>
      </section>

      <section className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-3">
          {t('account.changePassword')}
        </h2>
        <div className="grid gap-3">
          <PasswordInput
            id="old-password"
            label={t('account.oldPassword')}
            value={pwOld}
            onChange={setPwOld}
          />
          <PasswordInput
            id="new-password"
            label={t('account.newPassword')}
            value={pwNew}
            onChange={setPwNew}
          />
          <button
            onClick={onChangePassword}
            className="mt-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            {t('account.updatePassword')}
          </button>
        </div>
      </section>
    </div>
  );
}
