import { unstable_cache } from "next/cache";
import { getCvProjects } from "./getCvProjects";

export const CV_PROJECTS_CACHE_TAG = "cv-projects";

export const getCachedCvProjects = unstable_cache(
  () => getCvProjects(),
  ["cv-projects-merged-v2"],
  { tags: [CV_PROJECTS_CACHE_TAG], revalidate: false },
);
