import { FilterConfig } from "./Filter/types";

export const filterConfigs: FilterConfig[] = [
  {
    label: "Areas of expertise",
    projectKey: "experiences",
    displayType: "treemap",
  },
  {
    label: "Clients' industries",
    projectKey: "industries",
    displayType: "treemap",
  },
  {
    label: "Tools used in projects",
    projectKey: "tools",
    displayType: "bar",
  },
  {
    label: "Project types",
    projectKey: "projectType",
    displayType: "pie",
  },
];
