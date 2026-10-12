/**
 * Password gate for preview deployments (preview.outsideobservations.com).
 *
 * Enabled only where SITE_ACCESS_PASSWORD is set (on Netlify, scope it to the
 * preview branch). Without it, nothing is gated and /access redirects home.
 *
 * The cookie holds an HMAC of a fixed message keyed with the password: it
 * cannot be forged without the password, and changing the password signs
 * every visitor out. Web Crypto only, so it runs in the edge middleware and
 * in the Node route handler alike.
 */
export const ACCESS_PATH = '/access';
export const ACCESS_API_PATH = '/api/access';
export const ACCESS_COOKIE = 'oo_preview_access';
export const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const TOKEN_MESSAGE = 'oo-preview-access-v1';

export function getAccessPassword() {
  const password = process.env.SITE_ACCESS_PASSWORD;
  return typeof password === 'string' && password.length > 0 ? password : null;
}

export async function createAccessToken(password) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(TOKEN_MESSAGE));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Same duration whatever the first differing character
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function hasValidAccessToken(token) {
  const password = getAccessPassword();
  if (!password || !token) return false;
  return safeEqual(token, await createAccessToken(password));
}

// Only same-site paths, never back to the gate itself
export function sanitizeNextPath(value) {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.startsWith('/\\') ||
    value === ACCESS_PATH ||
    value.startsWith(`${ACCESS_PATH}?`) ||
    value.startsWith(`${ACCESS_PATH}/`)
  ) {
    return '/';
  }
  return value;
}
