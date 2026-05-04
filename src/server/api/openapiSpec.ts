import { API_BASE_URL } from "./baseUrl";
import { RATE_LIMIT_PER_MINUTE } from "./rateLimit";

export const buildOpenApiSpec = () => ({
  openapi: "3.1.0",
  info: {
    title: "Fuerst.one CV Projects API",
    version: "1.0.0",
    description:
      "Read-only public API for querying Alexander Fuerst's CV projects. " +
      "Backed by a Notion database, cached indefinitely in production. " +
      `Rate-limited to ${RATE_LIMIT_PER_MINUTE} requests/minute per IP.`,
    contact: { name: "Alexander Fuerst", email: "alexander@fuerst.one" },
  },
  servers: [{ url: API_BASE_URL }],
  paths: {
    "/api/projects": {
      get: {
        summary: "List projects with optional filters",
        description:
          "Returns a slim list of projects. Categorical filters use AND across categories, OR within a category, case-insensitive exact match.",
        parameters: [
          listParam(
            "tools",
            "string",
            "Filter by tool name (comma-separated, repeatable).",
          ),
          listParam("industries", "string", "Filter by industry."),
          listParam("experiences", "string", "Filter by experience tag."),
          listParam("languages", "string", "Filter by language."),
          listParam("projectType", "string", "Filter by project type."),
          listParam("workplace", "string", "Filter by workplace."),
          listParam("clientId", "string", "Filter by client id."),
          {
            name: "featured",
            in: "query",
            schema: { type: "string", enum: ["true", "false"] },
            description: "Only featured (true) or non-featured (false).",
          },
          {
            name: "from",
            in: "query",
            schema: { type: "string", format: "date" },
            description:
              "Only projects whose date range overlaps from this date.",
          },
          {
            name: "to",
            in: "query",
            schema: { type: "string", format: "date" },
            description:
              "Only projects whose date range overlaps up to this date.",
          },
          {
            name: "q",
            in: "query",
            schema: { type: "string" },
            description:
              "Free-text search. Whitespace-tokenized; every term must appear in name, description, KPIs, client names, tools, industries, experiences, languages, project type, or workplace.",
          },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: ["wow", "date", "name"],
              default: "wow",
            },
            description: "Sort order. Default 'wow'.",
          },
        ],
        responses: {
          "200": {
            description: "Matching projects",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    count: {
                      type: "integer",
                      description: "Number of matched projects.",
                    },
                    total: {
                      type: "integer",
                      description: "Total projects in the dataset.",
                    },
                    results: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ProjectListItem" },
                    },
                  },
                  required: ["count", "total", "results"],
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "429": { $ref: "#/components/responses/RateLimited" },
        },
      },
    },
    "/api/projects/{id}": {
      get: {
        summary: "Fetch full project detail",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Notion page id.",
          },
        ],
        responses: {
          "200": {
            description: "Full project record",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CvProject" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "429": { $ref: "#/components/responses/RateLimited" },
        },
      },
    },
    "/api/profile": {
      get: {
        summary: "Public CV profile (owner)",
        description:
          "Returns Alexander Fuerst's public CV profile facts. Sensitive fields (daily rate, full address, phone) are deliberately not exposed via this endpoint.",
        responses: {
          "200": {
            description: "Public profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CvOwnerPublic" },
              },
            },
          },
          "429": { $ref: "#/components/responses/RateLimited" },
        },
      },
    },
    "/api/facets": {
      get: {
        summary: "Discover available filter values",
        description:
          "Returns the unique values (with counts) for every categorical filter. Use this to discover what values can be passed to /api/projects.",
        responses: {
          "200": {
            description: "Facet counts",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Facets" },
              },
            },
          },
          "429": { $ref: "#/components/responses/RateLimited" },
        },
      },
    },
  },
  components: {
    schemas: {
      ProjectListItem: {
        type: "object",
        required: [
          "id",
          "name",
          "oneLineSummary",
          "tools",
          "industries",
          "experiences",
          "languages",
          "projectType",
          "workplace",
          "startDate",
          "endDate",
          "wowFactor",
          "featured",
          "clientNames",
          "url",
        ],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          oneLineSummary: { type: "string" },
          tools: { type: "array", items: { type: "string" } },
          industries: { type: "array", items: { type: "string" } },
          experiences: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } },
          projectType: { type: "string" },
          workplace: { type: "string" },
          startDate: { type: "string", format: "date" },
          endDate: { type: ["string", "null"], format: "date" },
          wowFactor: { type: "number" },
          featured: { type: "boolean" },
          clientNames: { type: "array", items: { type: "string" } },
          url: { type: "string", format: "uri" },
        },
      },
      CvProject: {
        type: "object",
        description:
          "Full project record. description and kpis are Notion rich-text objects; use rich_text[].plain_text for plain text.",
        additionalProperties: true,
      },
      CvOwnerPublic: {
        type: "object",
        required: [
          "name",
          "position",
          "status",
          "languages",
          "education",
          "city",
          "available",
          "avatarUrl",
        ],
        properties: {
          name: { type: "string", description: "Full name." },
          position: {
            type: "string",
            description: "Current employment status (e.g. 'Self-Employed').",
          },
          status: {
            type: "string",
            description: "Role classification (e.g. 'Entrepreneur').",
          },
          languages: {
            type: "string",
            description:
              "CV-formatted language list, including proficiency (e.g. 'German (native), English (business-fluent)').",
          },
          education: {
            type: "string",
            description: "Highest formal education entry.",
          },
          city: {
            type: "string",
            description: "City and country (e.g. 'Würzburg, Germany').",
          },
          available: {
            type: "boolean",
            description: "Whether currently available for new engagements.",
          },
          avatarUrl: {
            type: ["string", "null"],
            format: "uri",
            description:
              "Stable public avatar image URL served via this site's image proxy. Bytes are streamed from Notion server-side; the upstream URL is never exposed.",
          },
        },
      },
      Facets: {
        type: "object",
        properties: {
          tools: {
            type: "array",
            items: { $ref: "#/components/schemas/FacetCount" },
          },
          industries: {
            type: "array",
            items: { $ref: "#/components/schemas/FacetCount" },
          },
          experiences: {
            type: "array",
            items: { $ref: "#/components/schemas/FacetCount" },
          },
          languages: {
            type: "array",
            items: { $ref: "#/components/schemas/FacetCount" },
          },
          projectTypes: {
            type: "array",
            items: { $ref: "#/components/schemas/FacetCount" },
          },
          workplaces: {
            type: "array",
            items: { $ref: "#/components/schemas/FacetCount" },
          },
          clients: {
            type: "array",
            items: {
              allOf: [
                { $ref: "#/components/schemas/FacetCount" },
                {
                  type: "object",
                  properties: { id: { type: "string" } },
                  required: ["id"],
                },
              ],
            },
          },
          totalProjects: { type: "integer" },
        },
      },
      FacetCount: {
        type: "object",
        required: ["value", "count"],
        properties: {
          value: { type: "string" },
          count: { type: "integer" },
        },
      },
    },
    responses: {
      BadRequest: {
        description: "Invalid query parameter",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["error", "param", "expected"],
              properties: {
                error: { type: "string" },
                param: { type: "string" },
                expected: { type: "string" },
              },
            },
          },
        },
      },
      NotFound: {
        description: "Project not found",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["error", "message"],
              properties: {
                error: { type: "string", const: "not_found" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      RateLimited: {
        description: "Too many requests",
        headers: {
          "Retry-After": {
            schema: { type: "integer" },
            description: "Seconds until rate limit resets.",
          },
        },
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["error", "message", "retryAfter"],
              properties: {
                error: { type: "string", const: "rate_limit" },
                message: { type: "string" },
                retryAfter: { type: "integer" },
              },
            },
          },
        },
      },
    },
  },
});

const listParam = (name: string, type: string, description: string) => ({
  name,
  in: "query" as const,
  description,
  schema: {
    type: "array",
    items: { type },
    description: "Comma-separated values, or repeat the parameter.",
  },
  style: "form",
  explode: true,
});
