/**
 * booking controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::booking.booking",
  ({ strapi }) => ({
    async getAvailability(ctx) {
      const { date } = ctx.params;

      if (!date) {
        return ctx.badRequest("Date is required");
      }

      try {
        // Find all bookings for the given date
        const bookings = await strapi.db
          .query("api::booking.booking")
          .findMany({
            where: {
              date: date,
              status: {
                $ne: "cancelled", // Don't count cancelled bookings
              },
            },
            select: ["time"],
          });

        // Extract booked times
        const bookedTimes = bookings.map((b: any) => b.time);

        // Define all possible time slots (standard business hours)
        const allTimeSlots = [
          "09:00",
          "10:00",
          "11:00",
          "12:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00",
          "18:00",
        ];

        // Filter available slots
        const availableSlots = allTimeSlots.filter(
          (slot) => !bookedTimes.includes(slot),
        );

        ctx.send({ availableSlots });
      } catch (error) {
        console.error("Availability Check Error:", error);
        ctx.internalServerError("Failed to check availability");
      }
    },

    // Override create to add custom logic if needed (e.g. sending emails)
    // For now, core create is fine, but we might want to sanitize the input or check double bookings race condition
    async create(ctx) {
      // Honeypot check for spam protection
      const { honeypot } = ctx.request.body.data;
      if (honeypot) {
        // Silently fail - looks like success to bot, but saves nothing
        return ctx.send({ data: { id: 0, attributes: {} } });
      }

      // Simple double booking check
      const { date, time, name, email } = ctx.request.body.data;

      if (date && time) {
        const existing = await strapi.db.query("api::booking.booking").findOne({
          where: {
            date,
            time,
            status: {
              $ne: "cancelled",
            },
          },
        });

        if (existing) {
          return ctx.conflict("This slot is already booked");
        }
      }

      const response = await super.create(ctx);

      // Send email notification
      // Send email notification
      try {
        const emailPromises = [];

        console.log("Queueing booking email to admin...");
        emailPromises.push(
          strapi.plugins["email"].services.email
            .send({
              to: "ondra.nemec91@seznam.cz",
              from: "no-reply@zakarialegal.com",
              subject: "Nová rezervace konzultace",
              text: `
Noví rezervace:
Jméno: ${name}
Email: ${email}
Datum: ${date}
Čas: ${time}

Zkontrolujte v Strapi Admin panelu.
            `,
            })
            .then(() => console.log("Booking admin email sent successfully."))
            .catch((e) =>
              console.error("Failed to send booking admin email:", e),
            ),
        );

        if (email) {
          console.log(`Queueing booking confirmation to client ${email}...`);
          emailPromises.push(
            strapi.plugins["email"].services.email
              .send({
                to: email,
                from: "no-reply@zakarialegal.com",
                subject: "Potvrzení rezervace - Zakarialegal",
                text: `
Vážený kliente,

potvrzujeme Vaši rezervaci konzultace na ${date} v ${time}.

Budeme se těšit.

S pozdravem,
Tým Zakarialegal
              `,
              })
              .then(() =>
                console.log(
                  "Booking client confirmation email sent successfully.",
                ),
              )
              .catch((e) =>
                console.error("Failed to send booking client email:", e),
              ),
          );
        }

        // Run all email tasks in parallel without blocking response too long
        // Note: If you want to return response immediately without waiting for emails, remove 'await'
        // But waiting with Promise.all is safer to ensure they are sent (or logged) before context closes
        await Promise.all(emailPromises);
      } catch (err) {
        console.error("FAILED TO SEND BOOKING EMAILS:", err);
      }

      return response;
    },
  }),
);
