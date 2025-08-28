import { createClient } from '@supabase/supabase-js';

function assertString(v: unknown, name: string): asserts v is string {
  if (typeof v !== 'string' || v.trim().length === 0) {
    throw new Error(`Missing ${name}`);
  }
}

function looksLikeJwt(k: string): boolean {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(k);
}

const urlEnv = (process.env.SUPABASE_URL ?? '').trim();
const keyEnv = (process.env.SUPABASE_SERVICE_ROLE ?? '').trim();

assertString(urlEnv, 'SUPABASE_URL');
assertString(keyEnv, 'SUPABASE_SERVICE_ROLE');

if (!looksLikeJwt(keyEnv)) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE does not look like a JWT (expected 3 dot-separated segments).'
  );
}

export const supabaseAdmin = createClient(urlEnv, keyEnv, {
  auth: { persistSession: false },
});

console.log('[supabase] env ok:', {
  url: true,
  srk_segments: keyEnv.split('.').length,
});
