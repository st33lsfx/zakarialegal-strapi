/**
 * Vlastní CORS middleware pro spolehlivé zpracování preflight requestů
 * Zajišťuje správné hlavičky pro všechny CORS požadavky
 */

export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Získání povolených originů
    const allowedOrigins = config.origin || [
      "https://zakarialegal.cz",
      "https://www.zakarialegal.cz",
      "http://localhost:3000",
      "http://localhost:5173",
    ];

    // Získání originu z requestu
    const origin = ctx.request.headers.origin;

    // Kontrola, zda je origin povolen
    const isAllowedOrigin =
      !origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*");

    // Pokud je origin povolen, nastav hlavičky
    if (isAllowedOrigin && origin) {
      ctx.set("Access-Control-Allow-Origin", origin);
    } else if (allowedOrigins.includes("*")) {
      ctx.set("Access-Control-Allow-Origin", "*");
    } else if (allowedOrigins.length > 0) {
      // Pokud origin není povolen, použij první povolený (fallback)
      ctx.set("Access-Control-Allow-Origin", allowedOrigins[0]);
    }

    // Povolené hlavičky
    const allowedHeaders = config.headers || [
      "Content-Type",
      "Authorization",
      "Origin",
      "Accept",
      "X-Requested-With",
      "X-File-Name",
      "Cache-Control",
    ];
    ctx.set("Access-Control-Allow-Headers", allowedHeaders.join(", "));

    // Povolené metody
    const allowedMethods = config.methods || [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "HEAD",
      "OPTIONS",
    ];
    ctx.set("Access-Control-Allow-Methods", allowedMethods.join(", "));

    // Credentials
    if (config.credentials !== false) {
      ctx.set("Access-Control-Allow-Credentials", "true");
    }

    // Max age pro preflight cache
    if (config.maxAge) {
      ctx.set("Access-Control-Max-Age", String(config.maxAge));
    } else {
      ctx.set("Access-Control-Max-Age", "86400"); // 24 hodin
    }

    // Exposed headers
    if (config.exposedHeaders) {
      ctx.set("Access-Control-Expose-Headers", config.exposedHeaders.join(", "));
    }

    // Pokud je to OPTIONS request (preflight), vrať odpověď okamžitě
    if (ctx.request.method === "OPTIONS") {
      ctx.status = 204; // No Content
      ctx.body = null;
      return;
    }

    // Pokračuj v dalším middleware
    await next();
  };
};
