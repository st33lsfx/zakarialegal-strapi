export default ({ env }) => ({
  email: {
    config: {
      provider: "strapi-provider-email-resend",
      providerOptions: {
        apiKey: env("RESEND_API_KEY"),
      },
      settings: {
        defaultFrom: "zakaria@zakarialegal.cz",
        defaultReplyTo: "zakaria@zakarialegal.cz",
      },
    },
  },
  /* "rest-cache": {
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
  }, */
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
