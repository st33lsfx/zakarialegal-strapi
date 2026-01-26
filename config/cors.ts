export default {
  enabled: true,
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : [
        "https://zakarialegal.cz",
        "https://www.zakarialegal.cz",
        "http://localhost:3000",
        "http://localhost:5173",
      ],
  headers: [
    "Content-Type",
    "Authorization",
    "Origin",
    "Accept",
    "X-Requested-With",
    "X-File-Name",
    "Cache-Control",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
  credentials: true,
  keepHeaderOnError: true,
};
