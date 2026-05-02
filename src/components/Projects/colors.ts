import { CvProject } from "@/server/notion/getCvProjects";

type ColorConfig = {
  background: string;
  border: string;
  text: string;
  hex: string;
};

export const colors: Partial<
  Record<keyof CvProject, Record<string, ColorConfig>>
> = {
  projectType: {
    "Pro Bono": {
      background: "bg-white/5",
      border: "border-white/40",
      text: "text-neutral-200",
      hex: "#e5e5e5",
    },
    Hobby: {
      background: "bg-white/5",
      border: "border-white/40",
      text: "text-neutral-300",
      hex: "#cccccc",
    },
    Freelance: {
      background: "bg-white/5",
      border: "border-white/40",
      text: "text-neutral-100",
      hex: "#ffffff",
    },
    Startup: {
      background: "bg-white/5",
      border: "border-white/40",
      text: "text-neutral-200",
      hex: "#bdbdbd",
    },
    Employed: {
      background: "bg-white/5",
      border: "border-white/40",
      text: "text-neutral-300",
      hex: "#a0a0a0",
    },
    Student: {
      background: "bg-white/5",
      border: "border-white/40",
      text: "text-neutral-200",
      hex: "#888888",
    },
  },
};
