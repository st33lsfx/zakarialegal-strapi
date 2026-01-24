export default ({ env }) => ({
  email: {
    config: {
      provider: "sendmail",
      providerOptions: {},
      settings: {
        defaultFrom: "no-reply@zakarialegal.com",
        defaultReplyTo: "info@zakarialegal.com",
      },
    },
  },
});
