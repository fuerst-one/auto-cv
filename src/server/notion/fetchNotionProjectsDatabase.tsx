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
  NumberField,
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
  Hidden: CheckBoxField;
  Featured: CheckBoxField;
  Name: TitleField;
  Logo: FilesField;
  Screenshots: FilesField;
  "Project Description": RichTextField;
  "Wow-Factor 1-10": NumberField;
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
  name: string;
  logo: string[];
  screenshots: string[];
  description: RichTextField;
  kpis: RichTextField;
  wowFactor: number;
  status: string;
  hidden: boolean;
  featured: boolean;
  projectType: string;
  startDate: string;
  endDate: string;
  duration: string;
  websiteUrl: string;
  githubUrl: string;
  industries: string[];
  experiences: string[];
  tools: string[];
  languages: string[];
  workplace: string;
  clients: { id: string }[];
  references: { id: string }[];
};

const rawToInternalPropertiesMap: Record<
  keyof NotionProjectPropertiesRaw,
  keyof NotionProject
> = {
  Name: "name",
  Logo: "logo",
  Screenshots: "screenshots",
  "Project Description": "description",
  "Wow-Factor 1-10": "wowFactor",
  KPIs: "kpis",
  Status: "status",
  Hidden: "hidden",
  Featured: "featured",
  "Project Type": "projectType",
  "Start Date": "startDate",
  "End Date": "endDate",
  Duration: "duration",
  "Website-URL": "websiteUrl",
  "Github-URL": "githubUrl",
  Industries: "industries",
  Experiences: "experiences",
  Tools: "tools",
  Languages: "languages",
  Workplace: "workplace",
  Clients: "clients",
  References: "references",
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
      "Project Description": description,
      KPIs: kpis,
      ...propertiesRaw
    } = projectRaw.properties;

    const notionProject = {
      id: projectRaw.id,
      name: projectRaw.name,
      description,
      kpis,
    } as NotionProject;

    // Flatten the other properties to get the actual values
    objectKeys(propertiesRaw as NotionProjectPropertiesRaw).forEach(
      <K extends keyof NotionProjectPropertiesRaw>(keyRaw: K) => {
        const key = rawToInternalPropertiesMap[keyRaw];
        const value = flattenNotionProperty(propertiesRaw[keyRaw]);
        notionProject[key] = value as NotionProject[typeof key];
      },
    );
    return notionProject;
  });

  return projects;
};

const objectKeys = <T extends object>(object: T) => {
  return Object.keys(object) as (keyof T)[];
};
