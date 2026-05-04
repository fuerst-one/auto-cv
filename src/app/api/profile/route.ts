import { NextRequest, NextResponse } from "next/server";
import { getCachedCvOwnerPublic } from "@/server/notion/getCachedCvOwner";
import {
  buildRateLimitedResponse,
  checkRateLimit,
} from "@/server/api/rateLimit";
import { buildApiHeaders } from "@/server/api/responseHeaders";
import { API_BASE_URL } from "@/server/api/baseUrl";

export const runtime = "nodejs";

export const GET = async (request: NextRequest) => {
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) return buildRateLimitedResponse(rateLimit);

  const profile = await getCachedCvOwnerPublic();
  const absoluteProfile = {
    ...profile,
    avatarUrl: profile.avatarUrl ? `${API_BASE_URL}${profile.avatarUrl}` : null,
  };

  return NextResponse.json(absoluteProfile, {
    headers: buildApiHeaders(rateLimit),
  });
};
