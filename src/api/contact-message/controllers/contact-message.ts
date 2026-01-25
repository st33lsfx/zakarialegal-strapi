/**
 * contact-message controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::contact-message.contact-message",
  ({ strapi }) => ({
    async create(ctx) {
      // Honeypot check for spam protection
      const { honeypot } = ctx.request.body.data;
      if (honeypot) {
        // Silently fail
        return ctx.send({ data: { id: 0, attributes: {} } });
      }

      // Remove honeypot from data so Strapi doesn't complain about invalid key
      delete ctx.request.body.data.honeypot;

      const { name, email, phone, message } = ctx.request.body.data;

      const response = await super.create(ctx);

      try {
        const emailPromises = [];

        // Send email to admin
        console.log("Queueing contact email to admin...");
        emailPromises.push(
          strapi.plugins["email"].services.email
            .send({
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
            })
            .then(() => console.log("Contact admin email sent successfully."))
            .catch((e) =>
              console.error("Failed to send contact admin email:", e),
            ),
        );

        // Send confirmation to user
        if (email) {
          console.log(`Queueing contact confirmation to client ${email}...`);
          emailPromises.push(
            strapi.plugins["email"].services.email
              .send({
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
              })
              .then(() =>
                console.log(
                  "Contact client confirmation email sent successfully.",
                ),
              )
              .catch((e) =>
                console.error("Failed to send contact client email:", e),
              ),
          );
        }

        await Promise.all(emailPromises);
      } catch (err) {
        console.error("FAILED TO SEND CONTACT EMAILS:", err);
      }

      return response;
    },
  }),
);
