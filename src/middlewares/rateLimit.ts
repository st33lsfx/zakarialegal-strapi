import { RateLimit } from "koa2-ratelimit";

export default (config, { strapi }) => {
  const limiter = RateLimit.middleware({
    interval: { min: 1 },
    max: 5, // limit each IP to 5 requests per interval
    message: "Too many requests from this IP, please try again after a minute",
    ...config,
  });

  return async (ctx, next) => {
    // Determine if this request should be rate-limited
    if (
      (ctx.request.path.startsWith("/api/bookings") ||
        ctx.request.path.startsWith("/api/contact-messages")) &&
      ctx.request.method === "POST"
    ) {
      return limiter(ctx, next);
    }

    return next();
  };
};
