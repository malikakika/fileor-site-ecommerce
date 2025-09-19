import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, AUTH_EVENT } from '../services/auth.service';
import AuthPromptModal from './authPromptModal';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAuthed(!!getCurrentUser());
    setChecked(true);

    const onAuthChange = () => setAuthed(!!getCurrentUser());
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth_user' || e.key === 'auth_token') {
        setAuthed(!!getCurrentUser());
      }
    };
    window.addEventListener(AUTH_EVENT, onAuthChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(AUTH_EVENT, onAuthChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (!checked) return null;

  return (
    <>
      <div className={!authed ? 'pointer-events-none opacity-60 blur-[1px]' : ''}>
        {children}
      </div>

      {!authed && (
        <AuthPromptModal
          open={true}
          onClose={() => {
            navigate('/', { replace: true });
           
          }}
        />
      )}
    </>
  );
}
