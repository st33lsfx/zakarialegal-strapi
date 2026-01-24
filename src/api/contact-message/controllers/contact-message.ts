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
        console.log(
          "Attempting to send contact email to ondra.nemec91@seznam.cz...",
        );
        await strapi.plugins["email"].services.email.send({
          to: "ondra.nemec91@seznam.cz",
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
        console.log("Contact admin email sent successfully.");

        // Send confirmation to user
        if (email) {
          console.log(
            `Attempting to send contact confirmation to client ${email}...`,
          );
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
          console.log("Contact client confirmation email sent successfully.");
        }
      } catch (err) {
        console.error("FAILED TO SEND CONTACT EMAIL:", err);
      }

      return response;
    },
  }),
);
