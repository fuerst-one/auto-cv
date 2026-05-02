import { Glyph, Label, LabelGroup } from "./types";

const LABEL_PADDING_BETWEEN = 3;
const LABEL_PADDING_OUTER_X = 1;
const LABEL_PADDING_OUTER_Y = 1;

export const insertLabelGroup = (frame: Glyph[][], labelGroup: LabelGroup) => {
  const {
    labels,
    yAlign,
    xAlign,
    padding = LABEL_PADDING_BETWEEN,
  } = labelGroup;
  const y = getLabelStartY(frame.length, yAlign);
  let labelStartX = getLabelStartX(frame[0].length, labels, xAlign, padding);
  for (let i = 0; i < labels.length; i++) {
    const { label, ...props } = labels[i];
    frame[y].splice(
      labelStartX,
      label.length,
      ...label.split("").map((character) => ({
        character,
        ...props,
      })),
    );
    labelStartX += label.length + padding;
  }
};

const getLabelStartY = (
  height: number,
  yAlign: "top" | "center" | "bottom" = "center",
) => {
  if (yAlign === "top") {
    return LABEL_PADDING_OUTER_Y;
  } else if (yAlign === "bottom") {
    return height - 1 - LABEL_PADDING_OUTER_Y;
  }
  return Math.floor(height / 2) - LABEL_PADDING_OUTER_Y;
};

const getLabelStartX = (
  width: number,
  labels: Label[],
  align: "left" | "center" | "right" = "center",
  padding = LABEL_PADDING_BETWEEN,
) => {
  const totalLabelWidth =
    labels.map(({ label }) => label).join("").length +
    (labels.length - 1) * padding;
  let labelStart = Math.floor(width / 2) - Math.floor(totalLabelWidth / 2);
  if (align === "left") {
    labelStart = LABEL_PADDING_OUTER_X;
  } else if (align === "right") {
    labelStart = width - totalLabelWidth - LABEL_PADDING_OUTER_X;
  }
  return labelStart;
};
