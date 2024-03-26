"use server";

import { isDev } from "@/utils/env";
import { Client } from "@notionhq/client";

export const fetchNotionPage = async (pageId: string) => {
  const notion = new Client({
    auth: process.env.NEXT_NOTION_TOKEN,
    fetch: (url, options) =>
      fetch(url, {
        ...options,
        next: {
          revalidate: isDev() ? 120 : 3600,
        },
      }),
  });

  const page = await notion.pages.retrieve({
    page_id: pageId,
  });

  return page;
};
