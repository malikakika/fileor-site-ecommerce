import  { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type AuthPromptModalProps = {
  open: boolean;
  onClose?: () => void; 
};

export default function AuthPromptModal({ open, onClose }: AuthPromptModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const goLogin = () => {
    const next = location.pathname + location.search;
    navigate('/login', { state: { next } });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      aria-modal="true"
      role="dialog"
      onClick={onClose} 
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6"
        onClick={(e) => e.stopPropagation()} 
      >
        <h3 className="text-xl font-semibold mb-2">
          {t('auth.requiredTitle')}
        </h3>

        <p className="text-ink/80 mb-6">
          {t('auth.requiredMessage')}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            className="px-4 py-2 rounded border border-ink/20"
            type="button"
            onClick={() => onClose?.()}
          >
            {t('auth.later')}
          </button>

          <button
            className="px-4 py-2 rounded bg-sunset text-white hover:bg-berry transition"
            type="button"
            onClick={goLogin}
          >
            {t('auth.goLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}
