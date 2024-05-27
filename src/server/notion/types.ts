export type NotionField =
  | TitleField
  | RichTextField
  | EmailField
  | UrlField
  | NumberField
  | CheckBoxField
  | SelectField
  | MultiSelectField
  | FilesField
  | DateField
  | RelationField
  | RollupField
  | FormulaField;

export type TitleField = {
  id: string;
  type: "title";
  title: RichTextContent[];
};

export type RichTextField = {
  id: string;
  type: "rich_text";
  rich_text: RichTextContent[];
};

export type RichTextContent = {
  type: "text";
  text: {
    content: string;
    link: { url: string } | null;
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href: string | null;
};

export type EmailField = {
  id: string;
  type: "email";
  email: string | null;
};

export type UrlField = {
  id: string;
  type: "url";
  url: string | null;
};

export type NumberField = {
  id: string;
  type: "number";
  number: number;
};

export type CheckBoxField = {
  id: string;
  type: "checkbox";
  checkbox: boolean;
};

export type SelectField = {
  id: string;
  type: "select";
  select: SelectContent | null;
};

export type SelectContent = {
  id: string;
  name: string;
  color: string;
};

export type MultiSelectField = {
  id: string;
  type: "multi_select";
  multi_select: MultiSelectContent[];
};

export type MultiSelectContent = {
  id: string;
  name: string;
  color: string;
};

export type FilesField = {
  id: string;
  type: "files";
  files: (FileContentFile | FileContentExternal)[];
};

export type FileContentFile = {
  name: string;
  type: "file";
  file: {
    url: string;
    expiry_time: string;
  };
};

export type FileContentExternal = {
  name: string;
  type?: "external";
  external: {
    url: string;
  };
};

export type DateField = {
  id: string;
  type: "date";
  date: DateContent | null;
};

export type DateContent = {
  start: string | null;
  end: string | null;
  time_zone: string | null;
};

export type RelationField = {
  id: string;
  type: "relation";
  relation: RelationContent[];
  has_more: false;
};

export type RelationContent = {
  id: string;
};

export type RollupField = {
  id: string;
  type: "rollup";
  rollup: RollupContent;
  has_more: false;
};

export type RollupContent = {
  type: "array";
  array: NotionField[];
  function: "show_original" | "show_unique";
};

export type FormulaField = {
  id: string;
  type: "formula";
  formula: FormulaContent;
};

export type FormulaContent = {
  type: "string";
  string: string;
};
