import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getPlainTextStringFromTextBlock } from "./getPlainTextStringFromTextBlock";
import { TODO } from "@/types/TODO";
import {
  DateField,
  FormulaField,
  MultiSelectField,
  NotionField,
  RichTextField,
  RollupField,
  SelectField,
  TitleField,
} from "../types";
import { assertUnreachable } from "@/utils/assert";
import uniq from "lodash/uniq";

export const flattenNotionObject = (object: PageObjectResponse) => {
  const result: TODO = {
    id: object.id,
  };

  if (!("properties" in object)) {
    return result;
  }

  for (const [key, value] of Object.entries(object.properties)) {
    result[key] = flattenNotionProperty(value);
  }

  return result;
};

export const flattenNotionProperty = (
  property: PageObjectResponse["properties"][string] | NotionField,
): string | string[] | number | null => {
  switch (property.type) {
    case "rich_text":
      return getPlainTextStringFromTextBlock(property as RichTextField);
    case "title":
      return getPlainTextStringFromTextBlock(property as TitleField);
    case "files":
      if (!property.files?.length) {
        return null;
      }
      return property.files
        .map((file) => {
          if (file.type === "external") {
            return file.external.url;
          } else if (file.type === "file") {
            return file.file.url;
          }
          assertUnreachable(file);
        })
        .filter(Boolean) as string[];
    case "rollup":
      return (property as RollupField).rollup.array
        .map(flattenNotionProperty)
        .flat()
        .filter(Boolean) as string[];
    case "formula":
      return (property as FormulaField).formula.string;
    case "select":
      return (property as SelectField).select?.name ?? null;
    case "multi_select":
      return uniq(
        (property as MultiSelectField).multi_select.map((item) => item.name),
      );
    case "date":
      return (
        (property as DateField).date?.start ||
        (property as DateField).date?.end ||
        null
      );
    default:
      return property[property.type as keyof typeof property];
  }
};
