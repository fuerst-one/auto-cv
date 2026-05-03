import { NextRequest, NextResponse } from "next/server";
import { getCachedCvProjects } from "@/server/notion/getCachedCvProjects";
import { filterCvProjectsForApi } from "@/server/api/filterCvProjects";
import { parseListParams } from "@/server/api/parseListParams";
import { toProjectListItem } from "@/server/api/projectListItem";
import {
  buildRateLimitedResponse,
  checkRateLimit,
} from "@/server/api/rateLimit";
import { buildApiHeaders } from "@/server/api/responseHeaders";

export const runtime = "nodejs";

export const GET = async (request: NextRequest) => {
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) return buildRateLimitedResponse(rateLimit);

  const parsed = parseListParams(request.nextUrl.searchParams);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, param: parsed.param, expected: parsed.expected },
      { status: 400, headers: buildApiHeaders(rateLimit) },
    );
  }

  const allProjects = await getCachedCvProjects();
  const matched = filterCvProjectsForApi(allProjects, parsed.params);
  const results = matched.map(toProjectListItem);

  return NextResponse.json(
    { count: results.length, total: allProjects.length, results },
    { headers: buildApiHeaders(rateLimit) },
  );
};
