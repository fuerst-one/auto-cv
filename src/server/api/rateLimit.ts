import { NextRequest, NextResponse } from "next/server";

export const RATE_LIMIT_PER_MINUTE = 30;
const WINDOW_MS = 60_000;

type Bucket = { count: number; resetAt: number };

// Per-instance token bucket. Vercel runs N warm lambdas, so the effective
// global limit is RATE_LIMIT_PER_MINUTE * N. Sufficient for accidental loops;
// not a defense against adversarial load (use Vercel WAF for that).
const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

const getClientIp = (request: NextRequest): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
};

const evaluate = (ip: string): RateLimitResult => {
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: now + WINDOW_MS };
    buckets.set(ip, fresh);
    pruneIfNeeded(now);
    return {
      allowed: true,
      limit: RATE_LIMIT_PER_MINUTE,
      remaining: RATE_LIMIT_PER_MINUTE - 1,
      resetAt: fresh.resetAt,
      retryAfterSeconds: 0,
    };
  }

  if (bucket.count >= RATE_LIMIT_PER_MINUTE) {
    return {
      allowed: false,
      limit: RATE_LIMIT_PER_MINUTE,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    limit: RATE_LIMIT_PER_MINUTE,
    remaining: RATE_LIMIT_PER_MINUTE - bucket.count,
    resetAt: bucket.resetAt,
    retryAfterSeconds: 0,
  };
};

let lastPruneAt = 0;
const PRUNE_INTERVAL_MS = 5 * 60_000;

const pruneIfNeeded = (now: number) => {
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) return;
  lastPruneAt = now;
  for (const [ip, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(ip);
  }
};

export const checkRateLimit = (request: NextRequest): RateLimitResult => {
  return evaluate(getClientIp(request));
};

export const buildRateLimitedResponse = (
  result: RateLimitResult,
): NextResponse => {
  const body = {
    error: "rate_limit",
    message: `Rate limit exceeded (${RATE_LIMIT_PER_MINUTE} requests/minute). Retry in ${result.retryAfterSeconds}s.`,
    retryAfter: result.retryAfterSeconds,
  };
  return NextResponse.json(body, {
    status: 429,
    headers: {
      "Retry-After": String(result.retryAfterSeconds),
      "X-RateLimit-Limit": String(result.limit),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    },
  });
};
