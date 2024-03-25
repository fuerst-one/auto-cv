import { RichTextContent, RichTextField, TitleField } from "../types";

export const getPlainTextStringFromTextBlock = (
  textBlock: RichTextField | TitleField,
): string => {
  switch (textBlock.type) {
    case "title":
      return getPlainTextFromTextBlockContents(textBlock.title);
    case "rich_text":
      return getPlainTextFromTextBlockContents(textBlock.rich_text);
    default:
      return "";
  }
};

export const getPlainTextFromTextBlockContents = (
  textBlockContents: RichTextContent[],
): string => {
  return textBlockContents.map((content) => content.plain_text).join();
};
