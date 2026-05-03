import { LabelGroup } from "./types";

const PLAY_PAUSE_FULL_LABEL = "play/pause";
const TOP_LEFT_LABEL = "code";
const TOP_OUTER_PADDING = 1;

export const CENTER_FONT_BOOST_PX = 2;

export const getLabelsGroups = (
  isPlaying: boolean,
  toggleIsPlaying: () => void,
  availableWidth: number,
  fontPx: number,
): LabelGroup[] => [
  getPlayPauseLabelGroup(isPlaying, toggleIsPlaying, availableWidth),
  topLeftLabelGroup,
  getCenterLabelGroup(fontPx),
  bottomLabelGroup,
];

const getPlayPauseLabelGroup = (
  isPlaying: boolean,
  onClick: () => void,
  availableWidth: number,
): LabelGroup => {
  const icon = isPlaying ? "⏸" : "⏵";
  const fullLabels = [
    { label: PLAY_PAUSE_FULL_LABEL, onClick },
    { label: icon, onClick },
  ];
  const compactLabels = [{ label: icon, onClick }];

  // Reserve space for top-left "code" + outer paddings + a 1-cell breathing gap
  const reservedForLeft = TOP_LEFT_LABEL.length + TOP_OUTER_PADDING * 2 + 1;
  const fullWidth = PLAY_PAUSE_FULL_LABEL.length + 1 + icon.length; // padding=1
  const fitsFull = fullWidth + reservedForLeft <= availableWidth;

  return {
    labels: fitsFull ? fullLabels : compactLabels,
    yAlign: "top",
    xAlign: "right",
    padding: 1,
  };
};

const topLeftLabelGroup: LabelGroup = {
  labels: [
    {
      label: TOP_LEFT_LABEL,
      href: "https://github.com/fuerst-one/fuerst-one-website",
    },
  ],
  yAlign: "top",
  xAlign: "left",
};

const getCenterLabelGroup = (fontPx: number): LabelGroup => ({
  labels: [
    {
      label: "FUERST.ONE",
      style: { fontWeight: 700, fontSize: fontPx + CENTER_FONT_BOOST_PX },
      href: "/cv",
    },
  ],
  yAlign: "center",
});

const bottomLabelGroup: LabelGroup = {
  labels: [
    { label: "contact", href: "/contact" },
    { label: "github", href: "https://github.com/fuerst-one" },
    { label: "legal", href: "/legal-notice" },
    { label: "privacy", href: "/privacy" },
  ],
  yAlign: "bottom",
  flex: true,
};
