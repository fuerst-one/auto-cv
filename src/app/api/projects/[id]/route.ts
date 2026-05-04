import { NextRequest, NextResponse } from "next/server";
import { getCachedCvProjects } from "@/server/notion/getCachedCvProjects";
import {
  buildRateLimitedResponse,
  checkRateLimit,
} from "@/server/api/rateLimit";
import { buildApiHeaders } from "@/server/api/responseHeaders";
import { API_BASE_URL } from "@/server/api/baseUrl";

export const runtime = "nodejs";

const absolutizeImagePaths = (paths: string[] | null): string[] | null => {
  if (!paths) return paths;
  return paths.map((path) =>
    path.startsWith("/") ? `${API_BASE_URL}${path}` : path,
  );
};

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

  const absoluteProject = {
    ...project,
    logo: absolutizeImagePaths(project.logo),
    screenshots: absolutizeImagePaths(project.screenshots),
  };

  return NextResponse.json(absoluteProject, {
    headers: buildApiHeaders(rateLimit),
  });
};
