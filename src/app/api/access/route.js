import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  ACCESS_COOKIE_MAX_AGE,
  createAccessToken,
  getAccessPassword,
  safeEqual,
} from '@/lib/siteAccess';

// Slows down guessing without bothering someone who mistyped once
const FAILED_ATTEMPT_DELAY_MS = 800;

export async function POST(request) {
  const password = getAccessPassword();
  if (!password) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  let submitted = '';
  try {
    const body = await request.json();
    submitted = typeof body?.password === 'string' ? body.password : '';
  } catch {
    submitted = '';
  }

  const expected = await createAccessToken(password);
  const received = submitted ? await createAccessToken(submitted) : '';

  if (!safeEqual(received, expected)) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_ATTEMPT_DELAY_MS));
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, expected, {
    httpOnly: true,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    path: '/',
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });
  return response;
}
