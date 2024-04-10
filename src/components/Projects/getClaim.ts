import { FilterParams } from "./Filter/utils";

export const getClaim = (filterParams: FilterParams) => {
  const { projectType, experiences } = filterParams;
  if (
    experiences?.includes("UI-Design") ||
    experiences?.includes("UX-Design")
  ) {
    return "Usability first, then conversion, aesthetics after. Dare I can do all at the same time?";
  }
  if (experiences?.includes("Conversion Rate Optimization")) {
    return "I like nudging users and social proof, but how about we test it?";
  }
  if (experiences?.includes("Fronted-Development")) {
    return "Having a design is one thing, making it work is another. Let's make it work, shall we?";
  }
  if (
    experiences?.includes("Backend-Development") ||
    experiences?.includes("Fullstack-Development")
  ) {
    return "I like to make things work, but have you ever used something that works and makes you happy?";
  }
  if (projectType?.includes("Startup")) {
    return "Let's get some data, build something beautiful and sell it, shall we?";
  }
  if (projectType?.includes("Freelance")) {
    return "I'm a freelancer, so I am a master of my trades. Want proof?";
  }
  if (projectType?.includes("Pro Bono")) {
    return "I like to share and build things together. Want to join me?";
  }
  return "I like to explore and invent things. Want me to support you?";
};
