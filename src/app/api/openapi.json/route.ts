import { NextRequest, NextResponse } from "next/server";
import { buildOpenApiSpec } from "@/server/api/openapiSpec";
import {
  buildRateLimitedResponse,
  checkRateLimit,
} from "@/server/api/rateLimit";
import { buildApiHeaders } from "@/server/api/responseHeaders";

export const runtime = "nodejs";

export const GET = async (request: NextRequest) => {
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) return buildRateLimitedResponse(rateLimit);

  return NextResponse.json(buildOpenApiSpec(), {
    headers: buildApiHeaders(rateLimit),
  });
};
