export default {
  routes: [
    {
      method: "GET",
      path: "/bookings/availability/:date",
      handler: "booking.getAvailability",
      config: {
        auth: false, // Public endpoint
      },
    },
  ],
};
