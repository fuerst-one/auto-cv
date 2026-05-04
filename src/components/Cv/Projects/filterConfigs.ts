import { FilterConfig } from "./Filter/types";

export const filterConfigs: FilterConfig[] = [
  {
    label: "Fields",
    projectKey: "experiences",
    displayType: "treemap",
  },
  {
    label: "Industries",
    projectKey: "industries",
    displayType: "treemap",
  },
  {
    label: "Types",
    projectKey: "projectType",
    displayType: "pie",
  },
  {
    label: "Tools",
    projectKey: "tools",
    displayType: "bar",
  },
];
