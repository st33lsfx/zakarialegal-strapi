/**
 * contact-message controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::contact-message.contact-message",
  ({ strapi }) => ({
    async create(ctx) {
      const { name, email, phone, message } = ctx.request.body.data;

      const response = await super.create(ctx);

      try {
        // Send email to admin
        await strapi.plugins["email"].services.email.send({
          to: "ondrej@zakarialegal.com",
          from: "no-reply@zakarialegal.com",
          subject: "Nová zpráva z webu",
          text: `
Nová zpráva z kontaktního formuláře:

Jméno: ${name}
Email: ${email}
Telefon: ${phone || "-"}
Zpráva:
${message}
        `,
        });

        // Send confirmation to user
        if (email) {
          await strapi.plugins["email"].services.email.send({
            to: email,
            from: "no-reply@zakarialegal.com",
            subject: "Potvrzení přijetí zprávy - Zakarialegal",
            text: `
Vážený kliente,

děkujeme za Vaši zprávu. Budeme Vás brzy kontaktovat.

Vaše zpráva:
"${message}"

S pozdravem,
Tým Zakarialegal
            `,
          });
        }
      } catch (err) {
        console.error("Failed to send contact email", err);
      }

      return response;
    },
  }),
);
