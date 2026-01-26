export default [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "res.cloudinary.com",
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "res.cloudinary.com",
          ],
          upgradeInsecureRequests: null,
        },
      },
      // Dodatečné bezpečnostní hlavičky
      crossOriginEmbedderPolicy: false, // Potřebné pro některé pluginy
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      // X-Frame-Options: SAMEORIGIN - ochrana před clickjacking
      // X-Content-Type-Options: nosniff - ochrana před MIME sniffing
      // X-XSS-Protection: 1; mode=block - XSS ochrana
      // Referrer-Policy: strict-origin-when-cross-origin
      // Permissions-Policy: geolocation=(), microphone=(), camera=()
    },
  },
  "strapi::cors",
  // Rate limiting middleware - ochrana před útoky (po CORS, aby neblokoval OPTIONS)
  {
    name: "global::rate-limit",
    config: {
      windowMs: 15 * 60 * 1000, // 15 minut
      max: 100, // 100 požadavků za okno
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  {
    name: "strapi::body",
    config: {
      // Omezení velikosti těla požadavku pro ochranu před DoS útoky
      formLimit: "10mb",
      jsonLimit: "10mb",
      textLimit: "10mb",
      formidable: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
      },
    },
  },
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
