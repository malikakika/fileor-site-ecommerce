import { clearSession, getToken } from './auth.service';

export const API_URL =
  import.meta.env.VITE_API_URL;

export function isFormData(x: unknown): x is FormData {
  if (typeof FormData !== 'undefined' && x instanceof FormData) return true;
  if (typeof x !== 'object' || x === null) return false;
  const anyX = x as any;
  return (
    typeof anyX.append === 'function' &&
    anyX?.[Symbol.toStringTag] === 'FormData'
  );
}

async function parseMaybeJson<T>(res: Response): Promise<T | void> {
  if (res.status === 204) return;
  const text = await res.text();
  if (!text) return;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text);
  }
}

export async function httpGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function httpPost<T>(path: string, body: unknown): Promise<T> {
  const useForm = isFormData(body);
  const headers: Record<string, string> = {};
  if (!useForm) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: useForm ? (body as FormData) : JSON.stringify(body),
  });

  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  return res.json();
}

export async function httpUpload(path: string, fd: FormData) {
  const res = await fetch(`${API_URL}${path}`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ url: string }>;
}

export async function httpGetSecure<T>(path: string): Promise<T> {
  const token = getToken();
  if (!token) throw new Error('No auth token found');

  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    clearSession();
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function httpPostSecure<T>(
  path: string,
  body: unknown
): Promise<T> {
  const token = getToken();
  const useForm = isFormData(body);
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!useForm) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: useForm ? (body as FormData) : JSON.stringify(body),
  });

  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  return res.json();
}

export function httpPatchSecure<T>(path: string, body: unknown): Promise<T>;
export function httpPatchSecure(path: string, body: unknown): Promise<void>;
export async function httpPatchSecure<T>(
  path: string,
  body: unknown
): Promise<T | void> {
  const token = getToken();
  if (!token) throw new Error('No auth token found');

  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    clearSession();
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(await res.text());
  return parseMaybeJson<T>(res);
}

export function httpDeleteSecure<T>(path: string): Promise<T>;
export function httpDeleteSecure(path: string): Promise<void>;
export async function httpDeleteSecure<T>(path: string): Promise<T | void> {
  const token = getToken();
  if (!token) throw new Error('No auth token found');

  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    clearSession();
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(await res.text());
  return parseMaybeJson<T>(res);
}
