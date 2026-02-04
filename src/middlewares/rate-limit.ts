/**
 * Rate limiting middleware pro ochranu před útoky
 * Používá jednoduchý in-memory store (vhodné pro Railway single-instance)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Čištění starých záznamů každých 5 minut
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Přeskočit OPTIONS requesty (preflight) - musí projít bez omezení
    if (ctx.request.method === 'OPTIONS') {
      return await next();
    }

    // Získání IP adresy (podporuje Railway proxy)
    const ip =
      ctx.request.ip ||
      ctx.request.headers['x-forwarded-for']?.split(',')[0] ||
      ctx.request.headers['x-real-ip'] ||
      'unknown';

    // Konfigurace limitů
    const windowMs = config.windowMs || 15 * 60 * 1000; // 15 minut
    const maxRequests = config.max || 100; // 100 požadavků za okno
    const adminMax = config.adminMax || 20;
    const skipSuccessfulRequests = config.skipSuccessfulRequests || false;
    const skipFailedRequests = config.skipFailedRequests || false;

    const isAdminPath =
      ctx.path.startsWith("/admin") ||
      ctx.path.startsWith("/api/admin") ||
      ctx.path.startsWith("/api/auth");
    const limit = isAdminPath ? adminMax : maxRequests;
    const key = `rate-limit:${ip}:${isAdminPath ? "admin" : "public"}`;
    const now = Date.now();

    // Inicializace nebo získání záznamu
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    const record = store[key];

    // Kontrola limitu
    if (record.count >= limit) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      ctx.set('Retry-After', String(retryAfter));
      ctx.set('X-RateLimit-Limit', String(limit));
      ctx.set('X-RateLimit-Remaining', '0');
      ctx.set('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));

      return ctx.tooManyRequests(
        'Too many requests, please try again later.',
        {
          retryAfter,
        }
      );
    }

    // Zvýšení počítadla
    record.count++;

    // Nastavení hlaviček
    ctx.set('X-RateLimit-Limit', String(limit));
    ctx.set('X-RateLimit-Remaining', String(Math.max(0, limit - record.count)));
    ctx.set('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));

    try {
      await next();

      // Pokud máme přeskočit úspěšné požadavky, snížíme počítadlo
      if (skipSuccessfulRequests && ctx.status < 400) {
        record.count = Math.max(0, record.count - 1);
      }
    } catch (err) {
      // Pokud máme přeskočit neúspěšné požadavky, snížíme počítadlo
      if (skipFailedRequests && ctx.status >= 400) {
        record.count = Math.max(0, record.count - 1);
      }
      throw err;
    }
  };
};
