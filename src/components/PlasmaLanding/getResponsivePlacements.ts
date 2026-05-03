import { FrameBounds, Label, LabelGroup } from "../Plasma/types";
import {
  getLabelGroupPlacements,
  LabelPlacement,
  LABEL_PADDING_BETWEEN,
  LABEL_PADDING_OUTER_X,
  LABEL_PADDING_OUTER_Y,
} from "../Plasma/getLabelGroupPlacements";

export const getResponsivePlacements = (
  bounds: FrameBounds,
  groups: LabelGroup[],
): LabelPlacement[] => {
  const bottomFlexGroup = groups.find(
    (g) => g.yAlign === "bottom" && g.flex && g.labels.length > 0,
  );
  const bottomLayout = bottomFlexGroup
    ? getFlexBottomLayout(bottomFlexGroup, bounds)
    : null;
  const bottomRows = bottomLayout?.rows.length ?? 1;

  const placements: LabelPlacement[] = [];
  for (const group of groups) {
    if (group === bottomFlexGroup && bottomLayout) {
      placements.push(...bottomLayout.placements);
    } else if (group.yAlign === "center") {
      placements.push(...placeCenterGroup(group, bounds, bottomRows));
    } else {
      placements.push(...getLabelGroupPlacements(bounds, group));
    }
  }
  return placements;
};

type FlexBottomLayout = {
  rows: Label[][];
  placements: LabelPlacement[];
};

const getFlexBottomLayout = (
  group: LabelGroup,
  bounds: FrameBounds,
): FlexBottomLayout => {
  const { labels, padding = LABEL_PADDING_BETWEEN } = group;
  const rowCounts = halvingRowCounts(labels.length);
  const availableInnerWidth = bounds.width - LABEL_PADDING_OUTER_X * 2;

  let chosenRows: Label[][] = sliceIntoRows(labels, labels.length);
  for (const rowCount of rowCounts) {
    const candidate = sliceIntoRows(labels, rowCount);
    const fits = candidate.every(
      (row) => rowWidth(row, padding) <= availableInnerWidth,
    );
    if (fits) {
      chosenRows = candidate;
      break;
    }
  }

  const placements: LabelPlacement[] = [];
  for (let r = 0; r < chosenRows.length; r++) {
    const rowLabels = chosenRows[r];
    const rowY =
      bounds.height - 1 - LABEL_PADDING_OUTER_Y - (chosenRows.length - 1 - r);
    const totalWidth = rowWidth(rowLabels, padding);
    let startCol = Math.floor(bounds.width / 2) - Math.floor(totalWidth / 2);
    for (const label of rowLabels) {
      placements.push({ label, row: rowY, startCol });
      startCol += label.label.length + padding;
    }
  }

  return { rows: chosenRows, placements };
};

const placeCenterGroup = (
  group: LabelGroup,
  bounds: FrameBounds,
  bottomRows: number,
): LabelPlacement[] => {
  const topY = LABEL_PADDING_OUTER_Y;
  const bottomTopY =
    bounds.height - 1 - LABEL_PADDING_OUTER_Y - (bottomRows - 1);
  const centerY = Math.floor((topY + bottomTopY) / 2);
  const { labels, padding = LABEL_PADDING_BETWEEN } = group;
  const totalWidth = rowWidth(labels, padding);
  let startCol = Math.floor(bounds.width / 2) - Math.floor(totalWidth / 2);
  return labels.map((label) => {
    const placement: LabelPlacement = { label, row: centerY, startCol };
    startCol += label.label.length + padding;
    return placement;
  });
};

const halvingRowCounts = (n: number): number[] => {
  const counts: number[] = [];
  for (let r = 1; r <= n; r *= 2) {
    counts.push(r);
  }
  if (counts[counts.length - 1] !== n) {
    counts.push(n);
  }
  return counts;
};

const sliceIntoRows = (labels: Label[], rowCount: number): Label[][] => {
  const perRow = Math.ceil(labels.length / rowCount);
  const rows: Label[][] = [];
  for (let i = 0; i < labels.length; i += perRow) {
    rows.push(labels.slice(i, i + perRow));
  }
  return rows;
};

const rowWidth = (labels: Label[], padding: number): number =>
  labels.reduce((sum, l) => sum + l.label.length, 0) +
  Math.max(0, labels.length - 1) * padding;
