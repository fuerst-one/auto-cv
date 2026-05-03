import { NextRequest, NextResponse } from "next/server";
import { getCachedCvOwnerPublic } from "@/server/notion/getCachedCvOwner";
import {
  buildRateLimitedResponse,
  checkRateLimit,
} from "@/server/api/rateLimit";
import { buildApiHeaders } from "@/server/api/responseHeaders";

export const runtime = "nodejs";

export const GET = async (request: NextRequest) => {
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) return buildRateLimitedResponse(rateLimit);

  const profile = await getCachedCvOwnerPublic();

  return NextResponse.json(profile, { headers: buildApiHeaders(rateLimit) });
};
