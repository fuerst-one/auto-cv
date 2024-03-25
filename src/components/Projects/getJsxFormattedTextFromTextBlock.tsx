import { CSSProperties } from "react";
import {
  RichTextContent,
  RichTextField,
  TitleField,
} from "../../server/notion/types";
import clsx from "clsx";
import reactStringReplace from "react-string-replace";

export const getJsxFormattedTextFromTextBlock = (
  textBlock: RichTextField | TitleField,
): JSX.Element => {
  switch (textBlock.type) {
    case "title":
      return getJsxFormattedTextFromTextBlockContents(textBlock.title);
    case "rich_text":
      return getJsxFormattedTextFromTextBlockContents(textBlock.rich_text);
    default:
      return <></>;
  }
};

export const getJsxFormattedTextFromTextBlockContents = (
  textBlockContents: RichTextContent[],
): JSX.Element => {
  return <>{textBlockContents.map(getFormattedTextBlock)}</>;
};

const getFormattedTextBlock = (
  content: RichTextContent,
  idx: number,
): JSX.Element => {
  const classNames: string[] = [];
  const style: CSSProperties = {};

  if (content.annotations.bold) {
    classNames.push("font-medium");
  }
  if (content.annotations.italic) {
    classNames.push("italic");
  }
  if (content.annotations.strikethrough) {
    classNames.push("line-through");
  }
  if (content.annotations.underline) {
    classNames.push("underline");
  }
  if (content.annotations.code) {
    classNames.push("font-mono bg-gray-100 p-1 rounded");
  }
  if (content.annotations.color) {
    style.color = content.annotations.color;
  }

  const text = reactStringReplace(content.plain_text, "\n", (_, jdx) => (
    <br key={idx + "br" + jdx} />
  ));

  if (content.href) {
    return (
      <a
        key={idx}
        href={content.href}
        className={clsx(classNames)}
        style={style}
        target="_blank"
      >
        {text}
      </a>
    );
  }

  return (
    <span key={idx} className={clsx(classNames)} style={style}>
      {text}
    </span>
  );
};