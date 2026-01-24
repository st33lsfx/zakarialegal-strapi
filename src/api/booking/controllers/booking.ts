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
        console.log(
          "Attempting to send booking email to ondra.nemec91@seznam.cz...",
        );
        await strapi.plugins["email"].services.email.send({
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
        });
        console.log("Booking admin email sent successfully.");

        if (email) {
          console.log(
            `Attempting to send booking confirmation to client ${email}...`,
          );
          await strapi.plugins["email"].services.email.send({
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
          });
          console.log("Booking client confirmation email sent successfully.");
        }
      } catch (err) {
        console.error("FAILED TO SEND BOOKING EMAIL:", err);
      }

      return response;
    },
  }),
);
