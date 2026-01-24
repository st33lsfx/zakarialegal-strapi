export default ({ env }) => ({
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "smtp.example.com"),
        port: env.int("SMTP_PORT", 587),
        auth: {
          user: env("SMTP_USERNAME"),
          pass: env("SMTP_PASSWORD"),
        },
        secure: env.bool("SMTP_SECURE", false), // true for 465, false for other ports
        tls: {
          rejectUnauthorized: false, // Helps with self-signed certs or stricter environments
        },
        connectionTimeout: 10000, // 10 seconds timeout
        pool: true, // Use pooled connections for better performance
        logger: false, // Log to console if needed for debugging
        debug: false,
        maxConnections: 5,
        maxMessages: 100,
        // ... any other options
      },
      settings: {
        defaultFrom: "no-reply@zakarialegal.com",
        defaultReplyTo: "ondra.nemec91@seznam.cz",
      },
    },
  },
  "rest-cache": {
    config: {
      provider: {
        name: "memory",
        options: {
          max: 32767,
          maxAge: 300, // 5 minutes cache by default
        },
      },
      strategy: {
        contentTypes: [
          // Single Types (Static content)
          "api::hero.hero",
          "api::about.about",
          "api::contact.contact", // The contact PAGE content, not the messages
          "api::footer.footer",
          "api::online-consultation.online-consultation",

          // Collection Types (Lists)
          "api::service.service",
          "api::faq.faq",
          "api::testimonial.testimonial",
          "api::blog-post.blog-post",
        ],
      },
    },
  },
  upload: {
    config: {
      provider: "cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
