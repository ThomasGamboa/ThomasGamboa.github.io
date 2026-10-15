import { composeHireEmail } from '../../../src/shared/hiring/email.ts';
import { normalizeSubmission } from '../../../src/shared/hiring/request.ts';
import { validateHireRequest } from '../../../src/shared/hiring/validation.ts';

export interface RateLimiter {
  limit(options: { readonly key: string }): Promise<{ readonly success: boolean }>;
}

export interface HireWorkerEnv {
  readonly ALLOWED_ORIGINS: string;
  readonly HIRE_FROM_EMAIL: string;
  readonly HIRE_TO_EMAIL: string;
  readonly RESEND_API_KEY: string;
  readonly TURNSTILE_SECRET_KEY: string;
  readonly RATE_LIMITER?: RateLimiter;
}

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

const maximumBodyLength = 24_000;
const minimumFillMilliseconds = 4_000;
const turnstileEndpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const resendEndpoint = 'https://api.resend.com/emails';

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function reply(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...(origin ? corsHeaders(origin) : {}),
    },
  });
}

async function verifyToken(
  token: string,
  secret: string,
  remoteAddress: string,
  fetcher: Fetcher,
): Promise<boolean> {
  if (!token) {
    return false;
  }
  const form = new FormData();
  form.set('secret', secret);
  form.set('response', token);
  if (remoteAddress) {
    form.set('remoteip', remoteAddress);
  }
  const response = await fetcher(turnstileEndpoint, { method: 'POST', body: form });
  if (!response.ok) {
    return false;
  }
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

export async function handleHireRequest(
  request: Request,
  env: HireWorkerEnv,
  fetcher: Fetcher = fetch,
  now: () => number = Date.now,
): Promise<Response> {
  const origin = request.headers.get('Origin') ?? '';
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((value) => value.trim());
  const corsOrigin = allowedOrigins.includes(origin) ? origin : null;

  if (request.method === 'OPTIONS') {
    return corsOrigin
      ? new Response(null, { status: 204, headers: corsHeaders(corsOrigin) })
      : new Response(null, { status: 403 });
  }
  if (request.method !== 'POST') {
    return reply({ ok: false, error: 'method' }, 405, corsOrigin);
  }
  if (!corsOrigin) {
    return reply({ ok: false, error: 'origin' }, 403, null);
  }

  const body = await request.text();
  if (body.length > maximumBodyLength) {
    return reply({ ok: false, error: 'size' }, 413, corsOrigin);
  }
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return reply({ ok: false, error: 'format' }, 400, corsOrigin);
  }

  const submission = normalizeSubmission(payload);
  if (submission.trap) {
    return reply({ ok: true }, 200, corsOrigin);
  }
  if (now() - submission.startedAt < minimumFillMilliseconds) {
    return reply({ ok: false, error: 'timing' }, 400, corsOrigin);
  }

  const remoteAddress = request.headers.get('CF-Connecting-IP') ?? '';
  if (env.RATE_LIMITER) {
    const { success } = await env.RATE_LIMITER.limit({ key: remoteAddress || 'anonymous' });
    if (!success) {
      return reply({ ok: false, error: 'rate' }, 429, corsOrigin);
    }
  }

  const errors = validateHireRequest(submission.request, undefined, new Date(now()));
  if (errors.length > 0) {
    return reply({ ok: false, error: 'validation', errors }, 422, corsOrigin);
  }

  const verified = await verifyToken(
    submission.verificationToken,
    env.TURNSTILE_SECRET_KEY,
    remoteAddress,
    fetcher,
  );
  if (!verified) {
    return reply({ ok: false, error: 'verification' }, 403, corsOrigin);
  }

  const email = composeHireEmail(submission.request, {
    receivedAt: new Date(now()),
    origin: corsOrigin,
  });
  const delivery = await fetcher(resendEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.HIRE_FROM_EMAIL,
      to: [env.HIRE_TO_EMAIL],
      reply_to: submission.request.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  });
  if (!delivery.ok) {
    return reply({ ok: false, error: 'delivery' }, 502, corsOrigin);
  }
  return reply({ ok: true }, 200, corsOrigin);
}

export default {
  fetch(request: Request, env: HireWorkerEnv): Promise<Response> {
    return handleHireRequest(request, env);
  },
};
