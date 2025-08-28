import { AuthUser, LoginResponse } from '../types';
import { httpPost } from './httpClient';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
export const AUTH_EVENT = 'auth:changed';

function broadcastAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function setSession(token: string, user: AuthUser) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Storage error (setSession)', e);
  }
  broadcastAuthChange();
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error('Storage error (clearSession)', e);
  }
  broadcastAuthChange();
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error('Storage error (getToken)', e);
    return null;
  }
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch (e) {
    console.error('Storage error (getCurrentUser)', e);
    return null;
  }
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const data = await httpPost<LoginResponse>('/auth/login', {
    email,
    password,
  });
  setSession(data.access_token, data.user);
  return data;
}

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<LoginResponse> {
  const data = await httpPost<LoginResponse>('/auth/register', {
    email,
    password,
    name,
  });
  setSession(data.access_token, data.user);
  return data;
}
