import { CvProject } from "@/server/notion/getCvProjects";

const getFallbackLogoFromUrl = (url: string | null): string | null => {
  if (!url) {
    return null;
  }

  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");

    if (!hostname) {
      return null;
    }

    return `https://logo.clearbit.com/${hostname}`;
  } catch {
    return null;
  }
};

export const getProjectLogoSources = (project: CvProject): string[] => {
  const explicitLogos = (project.logo ?? []).filter(Boolean);

  const uniqueLogos = Array.from(new Set(explicitLogos));

  if (uniqueLogos.length > 0) {
    return uniqueLogos;
  }

  const fallback =
    getFallbackLogoFromUrl(project.websiteUrl) ??
    getFallbackLogoFromUrl(project.githubUrl);

  return fallback ? [fallback] : [];
};
