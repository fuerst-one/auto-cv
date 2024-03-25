import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { fetchNotionPage } from "./utils/fetchNotionPage";
import { flattenNotionObject } from "./utils/flattenNotionObject";

export type NotionContact = {
  id: string;
  Name: string;
  "Name 1": string;
  Position: string;
  Email: string;
  Phone: string;
  Industry: string[];
  Address: string;
  Knowledge: string[];
  URL: string;
  Contacts: [
    {
      id: string;
    },
  ];
  "Related to Projects (Clients)": [
    {
      id: string;
    },
  ];
};

export const fetchNotionContact = async (clientId: string) => {
  const page = (await fetchNotionPage(clientId)) as PageObjectResponse;
  return flattenNotionObject(page) as NotionContact;
};
