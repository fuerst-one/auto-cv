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
      background: "bg-green-500/5",
      border: "border-green-500",
      text: "text-green-500",
      hex: "#10B981",
    },
    Hobby: {
      background: "bg-blue-500/5",
      border: "border-blue-500",
      text: "text-blue-500",
      hex: "#3B82F6",
    },
    Freelance: {
      background: "bg-yellow-500/5",
      border: "border-yellow-500",
      text: "text-yellow-500",
      hex: "#FBBF24",
    },
    Startup: {
      background: "bg-orange-500/5",
      border: "border-orange-500",
      text: "text-orange-500",
      hex: "#F97316",
    },
    Employed: {
      background: "bg-red-500/5",
      border: "border-red-500",
      text: "text-red-500",
      hex: "#EF4444",
    },
    Student: {
      background: "bg-purple-500/5",
      border: "border-purple-500",
      text: "text-purple-500",
      hex: "#a855f7",
    },
  },
};
