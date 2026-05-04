import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";
import { flattenNotionProperty } from "@/server/notion/utils/flattenNotionObject";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

const URL_CACHE_TTL_SECONDS = 50 * 60;
const BYTES_CACHE_MAX_AGE_SECONDS = 60 * 60;
const BYTES_STALE_WHILE_REVALIDATE_SECONDS = 24 * 60 * 60;
const MAX_INDEX = 50;

const isPageObjectResponse = (
  page: Awaited<ReturnType<Client["pages"]["retrieve"]>>,
): page is PageObjectResponse => "properties" in page;

const fetchNotionFileUrl = async (
  pageId: string,
  propertyName: string,
  index: number,
): Promise<string | null> => {
  const notion = new Client({ auth: process.env.NEXT_NOTION_TOKEN });
  const page = await notion.pages.retrieve({ page_id: pageId });
  if (!isPageObjectResponse(page)) return null;
  const property = page.properties[propertyName];
  if (!property) return null;
  const value = flattenNotionProperty(property);
  const url = Array.isArray(value) ? value[index] : value;
  return typeof url === "string" ? url : null;
};

const resolveNotionFileUrlCached = unstable_cache(
  fetchNotionFileUrl,
  ["notion-image-url-v1"],
  { revalidate: URL_CACHE_TTL_SECONDS },
);

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ pageId: string; property: string }> },
) => {
  const { pageId, property } = await params;
  const indexParam = _request.nextUrl.searchParams.get("i");
  const index = indexParam === null ? 0 : Number(indexParam);
  if (!Number.isInteger(index) || index < 0 || index > MAX_INDEX) {
    return NextResponse.json(
      { error: "Invalid index parameter" },
      { status: 400 },
    );
  }

  type FetchImageResult =
    | { url: null; response: null }
    | { url: string; response: Response };

  const fetchImage = async (
    resolver: (
      pageId: string,
      property: string,
      index: number,
    ) => Promise<string | null>,
  ): Promise<FetchImageResult> => {
    const url = await resolver(pageId, property, index);
    if (!url) return { url: null, response: null };
    const response = await fetch(url, { cache: "no-store" });
    return { url, response };
  };

  let attempt;
  try {
    attempt = await fetchImage(resolveNotionFileUrlCached);
  } catch {
    return NextResponse.json(
      { error: "Notion lookup failed" },
      { status: 502 },
    );
  }
  if (attempt.url === null) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const isExpired =
    attempt.response.status === 403 || attempt.response.status === 410;
  if (isExpired) {
    try {
      attempt = await fetchImage(fetchNotionFileUrl);
    } catch {
      return NextResponse.json(
        { error: "Notion lookup failed" },
        { status: 502 },
      );
    }
  }

  const upstream = attempt.response;
  if (!upstream || !upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "Upstream image fetch failed" },
      { status: 502 },
    );
  }

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": `public, max-age=${BYTES_CACHE_MAX_AGE_SECONDS}, stale-while-revalidate=${BYTES_STALE_WHILE_REVALIDATE_SECONDS}`,
    },
  });
};
