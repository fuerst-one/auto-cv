import { FrameBounds, Label, LabelGroup } from "./types";

export const LABEL_PADDING_BETWEEN = 3;
export const LABEL_PADDING_OUTER_X = 1;
export const LABEL_PADDING_OUTER_Y = 1;

export type LabelPlacement = {
  label: Label;
  row: number;
  startCol: number;
};

export const getLabelGroupPlacements = (
  bounds: FrameBounds,
  group: LabelGroup,
): LabelPlacement[] => {
  const { labels, yAlign, xAlign, padding = LABEL_PADDING_BETWEEN } = group;
  const row = getLabelStartY(bounds.height, yAlign);
  let startCol = getLabelStartX(bounds.width, labels, xAlign, padding);
  const placements: LabelPlacement[] = [];
  for (const label of labels) {
    placements.push({ label, row, startCol });
    startCol += label.label.length + padding;
  }
  return placements;
};

const getLabelStartY = (
  height: number,
  yAlign: "top" | "center" | "bottom" = "center",
) => {
  if (yAlign === "top") {
    return LABEL_PADDING_OUTER_Y;
  }
  if (yAlign === "bottom") {
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
  if (align === "left") {
    return LABEL_PADDING_OUTER_X;
  }
  if (align === "right") {
    return width - totalLabelWidth - LABEL_PADDING_OUTER_X;
  }
  return Math.floor(width / 2) - Math.floor(totalLabelWidth / 2);
};
