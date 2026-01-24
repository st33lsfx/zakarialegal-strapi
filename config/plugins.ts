export default ({ env }) => ({
  email: {
    config: {
      provider: "sendmail",
      providerOptions: {},
      settings: {
        defaultFrom: "no-reply@zakarialegal.com",
        defaultReplyTo: "ondra.nemec91@seznam.cz",
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
