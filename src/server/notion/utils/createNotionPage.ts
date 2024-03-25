"use server";

import { Client } from "@notionhq/client";
import { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";

export const createNotionPage = async (
  databaseId: string,
  properties: CreatePageParameters["properties"],
) => {
  const notion = new Client({
    auth: process.env.NEXT_NOTION_TOKEN,
  });

  const response = await notion.pages.create({
    parent: {
      type: "database_id",
      database_id: databaseId,
    },
    properties,
  });

  return response;
};
