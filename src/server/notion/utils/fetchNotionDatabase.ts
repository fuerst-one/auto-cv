"use server";

import { isDev } from "@/utils/env";
import { Client } from "@notionhq/client";

export const fetchNotionDatabase = async (databaseId: string) => {
  const notion = new Client({
    auth: process.env.NEXT_NOTION_TOKEN,
    fetch: (url, options) =>
      fetch(url, {
        ...options,
        next: {
          revalidate: isDev() ? 0 : 3600,
        },
      }),
  });

  const database = await notion.databases.query({
    database_id: databaseId,
  });

  return database;
};
