import { NextRequest, NextResponse } from "next/server";
import { getCachedCvProjects } from "@/server/notion/getCachedCvProjects";
import { computeFacets } from "@/server/api/facets";
import {
  buildRateLimitedResponse,
  checkRateLimit,
} from "@/server/api/rateLimit";
import { buildApiHeaders } from "@/server/api/responseHeaders";

export const runtime = "nodejs";

export const GET = async (request: NextRequest) => {
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) return buildRateLimitedResponse(rateLimit);

  const projects = await getCachedCvProjects();
  const facets = computeFacets(projects);

  return NextResponse.json(facets, { headers: buildApiHeaders(rateLimit) });
};
