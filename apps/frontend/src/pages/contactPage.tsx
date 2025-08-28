import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Instagram, Send } from 'lucide-react';
import { chatService } from '../services/chat.service';

const isLoggedIn = () => !!localStorage.getItem('auth_token');

export default function ContactPage() {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const logged = useMemo(isLoggedIn, []);

  const validate = () => {
    const m = msg.trim();
    if (!m) {
      setErrMsg(
        (t('contact.errors.required') as string) ||
          'Tous les champs sont requis.'
      );
      return false;
    }
    if (!logged) {
      const n = name.trim();
      const e = email.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
      if (!n || !e) {
        setErrMsg(
          (t('contact.errors.required') as string) ||
            'Tous les champs sont requis.'
        );
        return false;
      }
      if (!emailOk) {
        setErrMsg(
          (t('contact.errors.email') as string) || 'Adresse email invalide.'
        );
        return false;
      }
    }
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOkMsg(null);
    setErrMsg(null);
    if (!validate()) return;

    try {
      setSubmitting(true);
      const text = msg.trim();

      if (logged) {
        await chatService.sendMyMessage(`Contact via formulaire:\n\n${text}`);
      } else {
        await chatService.publicSend({
          name: name.trim(),
          email: email.trim(),
          text,
        });
      }

      setOkMsg(
        (t('contact.thanks') as string) ||
          'Merci, votre message a bien été envoyé ! Vous pouvez suivre la réponse dans le support.'
      );
      setMsg('');
      if (!logged) {
        setName('');
        setEmail('');
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : String(err);
      setErrMsg(
        text ||
          (t('contact.errors.generic') as string) ||
          'Erreur lors de l’envoi.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand text-ink">
      <div className="bg-gradient-to-br from-sunset to-berry py-16 px-4 text-center text-white">
        <h1 className="text-4xl font-extrabold mb-3">{t('contact.title')}</h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold mb-3">
              {t('contact.reachUs')}
            </h2>
            <ul className="space-y-3 text-ink">
              <li className="flex items-center gap-2">
                <Mail size={18} />
                <a
                  href="mailto:contact@fileor.local"
                  className="hover:underline"
                >
                  contact@fileor.local
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} />
                <a href="tel:+33000000000" className="hover:underline">
                  +33 0 00 00 00 00
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={18} />
                <span>{t('contact.cityCountry')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Instagram size={18} />
                <a
                  className="hover:underline"
                  href="https://www.instagram.com/fileor_kika/"
                  target="_blank"
                  rel="noreferrer"
                >
                  @fileor_kika
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="font-semibold mb-2">{t('contact.hoursTitle')}</h3>
            <p className="text-sm leading-6 text-gray-700">
              {t('contact.hours')}
            </p>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {t('contact.formTitle')}
            </h2>

            {okMsg && (
              <div className="mb-3 p-2 rounded bg-green-100 text-green-800">
                {okMsg}
              </div>
            )}
            {errMsg && (
              <div className="mb-3 p-2 rounded bg-red-100 text-red-800">
                {errMsg}
              </div>
            )}

            <form
              onSubmit={submit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {!logged && (
                <>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-700">
                      {t('contact.name')}
                    </span>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('contact.name') || 'Nom'}
                      className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sunset"
                      autoComplete="name"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-700">
                      {t('contact.email')}
                    </span>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('contact.email') || 'Email'}
                      className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sunset"
                      autoComplete="email"
                    />
                  </label>
                </>
              )}

              <label
                className={`${
                  logged ? 'md:col-span-2' : 'md:col-span-2'
                } flex flex-col gap-1`}
              >
                <span className="text-sm text-gray-700">
                  {t('contact.message')}
                </span>
                <textarea
                  required
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder={t('contact.message') || 'Votre message…'}
                  className="border rounded px-3 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-sunset"
                />
              </label>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-full inline-flex items-center gap-2 text-white transition
                    ${
                      submitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-sunset hover:bg-berry'
                    }`}
                  aria-busy={submitting}
                >
                  <Send size={18} />
                  {submitting
                    ? t('contact.sending') || 'Envoi…'
                    : t('contact.send') || 'Envoyer'}
                </button>
              </div>
            </form>

            <p className="mt-3 text-xs text-gray-500">
              {t('contact.disclaimer') ||
                'Vos informations ne seront utilisées que pour répondre à votre demande.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
