import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { fetchNotionPage } from "./utils/fetchNotionPage";
import { flattenNotionObject } from "./utils/flattenNotionObject";

export type CvAddress = {
  street: string;
  zip: string;
  city: string;
  country: string;
};

export type CvOwnerPublic = {
  name: string;
  position: string;
  status: string;
  languages: string;
  education: string;
  city: string;
  available: boolean;
};

export type CvOwner = CvOwnerPublic & {
  email: string;
  phone: string;
  address: CvAddress;
  dailyRate: number;
};

type NotionOwnerRow = {
  id: string;
  "Name 1"?: string;
  Vorname?: string;
  Nachname?: string;
  Position?: string;
  Status?: string | null;
  Languages?: string;
  Education?: string;
  Available?: boolean;
  Email?: string | null;
  Phone?: string | null;
  "Daily Rate"?: number | null;
  "Address Street"?: string;
  "Address ZIP"?: string;
  "Address City"?: string;
  "Address Country"?: string;
};

export const getCvOwner = async (): Promise<CvOwner> => {
  const ownerId = process.env.NEXT_NOTION_OWNER_CONTACT_ID;
  if (!ownerId) {
    throw new Error(
      "Missing NEXT_NOTION_OWNER_CONTACT_ID environment variable",
    );
  }

  const page = (await fetchNotionPage(ownerId)) as PageObjectResponse;
  const row = flattenNotionObject(page) as NotionOwnerRow;

  const address: CvAddress = {
    street: row["Address Street"] ?? "",
    zip: row["Address ZIP"] ?? "",
    city: row["Address City"] ?? "",
    country: row["Address Country"] ?? "",
  };

  const cityLine = [address.city, address.country].filter(Boolean).join(", ");

  return {
    name:
      row["Name 1"] ||
      [row.Vorname, row.Nachname].filter(Boolean).join(" ") ||
      "",
    position: row.Position ?? "",
    status: row.Status ?? "",
    languages: row.Languages ?? "",
    education: row.Education ?? "",
    city: cityLine,
    available: row.Available === true,
    email: row.Email ?? "",
    phone: row.Phone ?? "",
    address,
    dailyRate: row["Daily Rate"] ?? 0,
  };
};

export const toPublicOwner = (owner: CvOwner): CvOwnerPublic => ({
  name: owner.name,
  position: owner.position,
  status: owner.status,
  languages: owner.languages,
  education: owner.education,
  city: owner.city,
  available: owner.available,
});
