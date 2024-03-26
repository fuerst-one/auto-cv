"use server";

import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { fetchNotionDatabase } from "./utils/fetchNotionDatabase";
import {
  CheckBoxField,
  DateField,
  FilesField,
  FormulaField,
  MultiSelectField,
  RelationField,
  RichTextField,
  RollupField,
  SelectField,
  TitleField,
  UrlField,
} from "./types";
import { flattenNotionProperty } from "./utils/flattenNotionObject";

export type NotionProjectRaw = PageObjectResponse & {
  id: string;
  name: string;
  properties: NotionProjectPropertiesRaw;
};

export type NotionProjectPropertiesRaw = {
  Featured: CheckBoxField;
  Name: TitleField;
  Logo: FilesField;
  Description: RichTextField;
  KPIs: RichTextField;
  "Project Type": SelectField;
  "Start Date": DateField;
  "End Date": DateField;
  Duration: FormulaField;
  Status: SelectField;
  "Website-URL": UrlField;
  "Github-URL": UrlField;
  Industries: RollupField;
  Experiences: MultiSelectField;
  Tools: MultiSelectField;
  Languages: MultiSelectField;
  Workplace: SelectField;
  Clients: RelationField;
  References: RollupField;
};

export type NotionProject = {
  id: string;
  Name: string;
  Logo: string[];
  "Project Description": RichTextField;
  KPIs: RichTextField;
  Status: string;
  Featured: boolean;
  "Project Type": string;
  "Start Date": string;
  "End Date": string;
  Duration: string;
  "Website-URL": string;
  "Github-URL": string;
  Industries: string[];
  Experiences: string[];
  Tools: string[];
  Languages: string[];
  Workplace: string;
  Clients: { id: string }[];
  References: { id: string }[];
};

export const fetchNotionProjectsDatabase = async () => {
  if (!process.env.NEXT_NOTION_PROJECT_DB_ID) {
    throw new Error("Missing NEXT_NOTION_PROJECT_DB_ID environment variable");
  }

  const projectsRaw = (await fetchNotionDatabase(
    process.env.NEXT_NOTION_PROJECT_DB_ID,
  )) as unknown as Omit<QueryDatabaseResponse, "results"> & {
    results: NotionProjectRaw[];
  };

  const projects = projectsRaw.results.map((projectRaw) => {
    // We keep the Description field separate from the other properties to keep the rich text annotations
    const {
      "Project Description": projectDescription,
      KPIs,
      ...propertiesRaw
    } = projectRaw.properties;

    // Flatten the other properties to get the actual values
    const properties = Object.fromEntries(
      Object.entries(propertiesRaw).map(([key, value]) => [
        key,
        flattenNotionProperty(value),
      ]),
    );

    return {
      id: projectRaw.id,
      ...properties,
      KPIs,
      "Project Description": projectDescription,
    } as unknown as NotionProject;
  });

  return projects;
};
