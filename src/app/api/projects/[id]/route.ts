import { NextRequest, NextResponse } from "next/server";
import { getCachedCvProjects } from "@/server/notion/getCachedCvProjects";
import {
  buildRateLimitedResponse,
  checkRateLimit,
} from "@/server/api/rateLimit";
import { buildApiHeaders } from "@/server/api/responseHeaders";

export const runtime = "nodejs";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) return buildRateLimitedResponse(rateLimit);

  const { id } = await params;
  const projects = await getCachedCvProjects();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return NextResponse.json(
      { error: "not_found", message: `No project with id "${id}"` },
      { status: 404, headers: buildApiHeaders(rateLimit) },
    );
  }

  return NextResponse.json(project, { headers: buildApiHeaders(rateLimit) });
};
