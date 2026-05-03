import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/server/api/baseUrl";
import {
  buildRateLimitedResponse,
  checkRateLimit,
  RATE_LIMIT_PER_MINUTE,
} from "@/server/api/rateLimit";

export const runtime = "nodejs";

export const GET = async (request: NextRequest) => {
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) return buildRateLimitedResponse(rateLimit);

  const body = `# Fuerst.one — CV Projects API

> Read-only public API for querying Alexander Fuerst's CV projects (Notion-backed, cached indefinitely). Rate-limited to ${RATE_LIMIT_PER_MINUTE} requests/minute per IP. No auth required.

The dataset is small (a few dozen projects). Start with /api/facets to discover valid filter values, then narrow with /api/projects, then zoom on a single record via /api/projects/{id}.

## Endpoints

- [OpenAPI 3.1 spec](${API_BASE_URL}/api/openapi.json) — complete machine-readable schema for all endpoints.
- [GET /api/projects](${API_BASE_URL}/api/projects) — slim list of projects with filters (tools, industries, experiences, languages, projectType, workplace, featured, clientId, from, to, q, sort).
- [GET /api/projects/{id}](${API_BASE_URL}/api/projects) — full project record including rich-text description, KPIs, screenshots, logos, and clients.
- [GET /api/facets](${API_BASE_URL}/api/facets) — counts of unique values per category, useful for discovering valid filter values.

## Examples

\`\`\`
# All projects, sorted by wow factor (default)
curl ${API_BASE_URL}/api/projects

# Projects using React or Next.js, scoped to e-commerce
curl '${API_BASE_URL}/api/projects?tools=react,nextjs&industries=ecommerce'

# Free-text search across name, description, KPIs, clients, tools, industries, experiences, languages
curl '${API_BASE_URL}/api/projects?q=visualization+dashboard'

# Recent work
curl '${API_BASE_URL}/api/projects?from=2024-01-01&sort=date'

# Discover what filter values exist
curl ${API_BASE_URL}/api/facets

# Full detail for one project (id from the list response)
curl ${API_BASE_URL}/api/projects/{id}
\`\`\`

## Filter semantics

- AND across categories. OR within a category. Case-insensitive exact match.
- Comma-separated values, or repeat the parameter: \`?tools=react,nextjs\` is equivalent to \`?tools=react&tools=nextjs\`.
- Unknown query params are ignored. Invalid date or sort values return 400 with the expected format.
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
      "X-RateLimit-Limit": String(rateLimit.limit),
      "X-RateLimit-Remaining": String(rateLimit.remaining),
      "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1000)),
    },
  });
};
