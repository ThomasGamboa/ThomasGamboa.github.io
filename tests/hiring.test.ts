import { describe, expect, it, vi } from 'vitest';
import { handleHireRequest } from '../services/hire-request/src/worker.ts';
import { composeHireEmail } from '../src/shared/hiring/email.ts';
import { summarizePricing } from '../src/shared/hiring/pricing.ts';
import { type HireRequest, normalizeHireRequest } from '../src/shared/hiring/request.ts';
import { validateHireRequest } from '../src/shared/hiring/validation.ts';

const today = new Date('2026-10-14T12:00:00Z');

const valid: HireRequest = {
  locale: 'es',
  services: ['game-prototype'],
  addons: ['deployment'],
  projectType: 'new',
  description:
    'Un prototipo jugable de un juego de exploración nocturna con mecánicas de sigilo y luz, pensado para PC.',
  designStatus: '',
  platforms: [],
  headset: '',
  materials: '',
  requirements: '',
  budget: '2000-5000',
  timeline: '1-3-months',
  deadline: '',
  name: 'Estudio Prueba',
  email: 'hola@example.com',
  company: '',
  website: '',
  consent: true,
};

function codes(request: HireRequest) {
  return validateHireRequest(request, undefined, today).map(
    (error) => `${error.field}:${error.code}`,
  );
}

describe('hire request validation', () => {
  it('accepts a complete request', () => {
    expect(codes(valid)).toEqual([]);
  });

  it('requires at least one main service and core fields', () => {
    const empty = normalizeHireRequest({});
    expect(codes(empty)).toEqual(
      expect.arrayContaining([
        'services:service-required',
        'projectType:required',
        'description:required',
        'budget:required',
        'timeline:required',
        'name:required',
        'email:required',
        'consent:required',
      ]),
    );
  });

  it('asks for conditional fields only when their service is selected', () => {
    expect(codes({ ...valid, services: ['mobile-game'] })).toContain('platforms:required');
    expect(codes({ ...valid, services: ['meta-quest-vr'] })).toContain('headset:required');
    expect(codes(valid)).not.toContain('platforms:required');
  });

  it('requires a ready design or the design service for 3D web development', () => {
    const web = { ...valid, services: ['web-3d-experience'], designStatus: 'none' };
    expect(codes(web)).toContain('designStatus:design-required');
    expect(codes({ ...web, designStatus: 'ready' })).toEqual([]);
    expect(codes({ ...web, services: ['web-3d-experience', 'web-experience-design'] })).toEqual([]);
  });

  it('rejects malformed values and unknown options', () => {
    expect(codes({ ...valid, email: 'nope' })).toContain('email:invalid-email');
    expect(codes({ ...valid, website: 'ftp://x' })).toContain('website:invalid-url');
    expect(codes({ ...valid, deadline: '2020-01-01' })).toContain('deadline:invalid-date');
    expect(codes({ ...valid, budget: 'infinite' })).toContain('budget:invalid-option');
    expect(codes({ ...valid, services: ['deployment'] })).toContain('services:invalid-option');
    expect(codes({ ...valid, addons: ['game-prototype'] })).toContain('addons:invalid-option');
    expect(codes({ ...valid, description: 'Muy corto' })).toContain('description:too-short');
  });

  it('can validate a subset of fields for a single step', () => {
    const partial = normalizeHireRequest({ services: ['game-prototype'] });
    expect(validateHireRequest(partial, ['services', 'addons'], today)).toEqual([]);
  });
});

describe('hire request normalization', () => {
  it('drops fields that do not apply and sanitizes types', () => {
    const request = normalizeHireRequest({
      locale: 'fr',
      services: ['game-prototype', 'game-prototype', 7],
      platforms: ['ios'],
      headset: 'quest-3',
      name: '  Ana  ',
      consent: 'yes',
    });
    expect(request.locale).toBe('es');
    expect(request.services).toEqual(['game-prototype']);
    expect(request.platforms).toEqual([]);
    expect(request.headset).toBe('');
    expect(request.name).toBe('Ana');
    expect(request.consent).toBe(false);
  });
});

describe('pricing summary', () => {
  it('adds starting prices and flags budgets below them', () => {
    const summary = summarizePricing({
      services: ['game-prototype', 'mobile-game'],
      addons: ['deployment'],
      budget: '5000-10000',
    });
    expect(summary.startingTotal?.amount).toBe(10850);
    expect(summary.addons).toHaveLength(1);
    expect(summary.budgetBelowStart).toBe(true);
    expect(summarizePricing({ ...valid }).budgetBelowStart).toBe(false);
  });
});

describe('hire email', () => {
  it('contains every answer, escapes HTML and flags low budgets', () => {
    const email = composeHireEmail(
      {
        ...valid,
        name: '<b>Estudio</b>',
        budget: 'under-2000',
        services: ['meta-quest-vr'],
        headset: 'quest-3',
      },
      { receivedAt: today, origin: 'https://thomasgamboa.github.io' },
    );
    expect(email.subject).toContain('[presupuesto bajo]');
    expect(email.html).toContain('&lt;b&gt;Estudio&lt;/b&gt;');
    expect(email.html).not.toContain('<b>Estudio</b>');
    expect(email.text).toContain('Meta Quest 3');
    expect(email.text).toContain('Extra · Publicación');
    expect(email.text).toContain('desde 5.350 USD');
    expect(email.text).toContain('hola@example.com');
  });
});

describe('hire worker', () => {
  const env = {
    ALLOWED_ORIGINS: 'https://thomasgamboa.github.io',
    HIRE_FROM_EMAIL: 'Portafolio <onboarding@resend.dev>',
    HIRE_TO_EMAIL: 'owner@example.com',
    RESEND_API_KEY: 're_test',
    TURNSTILE_SECRET_KEY: 'secret',
  };
  const origin = 'https://thomasgamboa.github.io';
  const now = () => today.getTime();

  function post(body: unknown, headers: Record<string, string> = { Origin: origin }) {
    return new Request('https://worker.example/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
  }

  function submission(overrides: Record<string, unknown> = {}) {
    return {
      request: valid,
      verificationToken: 'token',
      startedAt: today.getTime() - 60_000,
      trap: '',
      ...overrides,
    };
  }

  function services(turnstile = true, delivery = true) {
    return vi.fn(async (url: string, _init?: RequestInit) => {
      if (url.includes('turnstile')) {
        return new Response(JSON.stringify({ success: turnstile }));
      }
      return new Response('{}', { status: delivery ? 200 : 500 });
    });
  }

  it('answers preflight only for allowed origins', async () => {
    const allowed = await handleHireRequest(
      new Request('https://worker.example/', { method: 'OPTIONS', headers: { Origin: origin } }),
      env,
    );
    expect(allowed.status).toBe(204);
    expect(allowed.headers.get('Access-Control-Allow-Origin')).toBe(origin);
    const denied = await handleHireRequest(
      new Request('https://worker.example/', {
        method: 'OPTIONS',
        headers: { Origin: 'https://evil.example' },
      }),
      env,
    );
    expect(denied.status).toBe(403);
  });

  it('rejects foreign origins, bots and rushed submissions', async () => {
    const fetcher = services();
    const foreign = await handleHireRequest(
      post(submission(), { Origin: 'https://evil.example' }),
      env,
      fetcher,
      now,
    );
    expect(foreign.status).toBe(403);
    const trapped = await handleHireRequest(post(submission({ trap: 'x' })), env, fetcher, now);
    expect(trapped.status).toBe(200);
    const rushed = await handleHireRequest(
      post(submission({ startedAt: today.getTime() - 500 })),
      env,
      fetcher,
      now,
    );
    expect(rushed.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('returns validation errors before calling any service', async () => {
    const fetcher = services();
    const response = await handleHireRequest(
      post(submission({ request: { ...valid, email: '' } })),
      env,
      fetcher,
      now,
    );
    expect(response.status).toBe(422);
    const body = (await response.json()) as { errors: { field: string }[] };
    expect(body.errors.map((error) => error.field)).toContain('email');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('enforces the rate limiter and the verification challenge', async () => {
    const limited = await handleHireRequest(
      post(submission()),
      { ...env, RATE_LIMITER: { limit: async () => ({ success: false }) } },
      services(),
      now,
    );
    expect(limited.status).toBe(429);
    const unverified = await handleHireRequest(post(submission()), env, services(false), now);
    expect(unverified.status).toBe(403);
  });

  it('delivers the email with the client as reply-to', async () => {
    const fetcher = services();
    const response = await handleHireRequest(post(submission()), env, fetcher, now);
    expect(response.status).toBe(200);
    const delivery = fetcher.mock.calls.find(([url]) => url.includes('resend'));
    const payload = JSON.parse(String(delivery?.[1]?.body)) as Record<string, unknown>;
    expect(payload.to).toEqual(['owner@example.com']);
    expect(payload.reply_to).toBe('hola@example.com');
    expect(String(payload.subject)).toContain('Estudio Prueba');
  });

  it('reports delivery failures', async () => {
    const response = await handleHireRequest(post(submission()), env, services(true, false), now);
    expect(response.status).toBe(502);
  });
});
