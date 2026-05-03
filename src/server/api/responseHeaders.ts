import { RateLimitResult } from "./rateLimit";

export const buildApiHeaders = (
  rateLimit: RateLimitResult,
): Record<string, string> => ({
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  Vary: "Accept-Encoding",
  "X-RateLimit-Limit": String(rateLimit.limit),
  "X-RateLimit-Remaining": String(rateLimit.remaining),
  "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1000)),
});
