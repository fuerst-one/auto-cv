import { RichTextField } from "@/server/notion/types";

export const flattenRichText = (field: RichTextField | undefined): string => {
  if (!field?.rich_text) {
    return "";
  }
  return field.rich_text
    .map((rt) => rt.plain_text)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
};

export const truncateAtSentence = (text: string, maxChars: number): string => {
  if (text.length <= maxChars) {
    return text;
  }
  const slice = text.slice(0, maxChars);
  const lastSentenceEnd = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("? "),
    slice.lastIndexOf("! "),
  );
  if (lastSentenceEnd > maxChars * 0.5) {
    return slice.slice(0, lastSentenceEnd + 1);
  }
  const lastSpace = slice.lastIndexOf(" ");
  return slice.slice(0, lastSpace > 0 ? lastSpace : maxChars) + "…";
};
