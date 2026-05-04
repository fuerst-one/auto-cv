import { LabelGroup } from "../Plasma/types";

const PLAY_PAUSE_FULL_LABEL = "play/pause";
const TOP_LEFT_LABEL = "tinker";
const CENTER_LABEL = "FUERST.ONE";
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
      href: "/plasma",
    },
  ],
  yAlign: "top",
  xAlign: "left",
};

const getCenterLabelGroup = (fontPx: number): LabelGroup => ({
  labels: [
    {
      label: CENTER_LABEL,
      style: {
        fontWeight: 700,
        fontSize: fontPx + CENTER_FONT_BOOST_PX,
      },
      href: "/cv",
    },
  ],
  yAlign: "center",
});

const bottomLabelGroup: LabelGroup = {
  labels: [
    { label: "contact", href: "/contact" },
    { label: "github", href: "https://github.com/fuerst-one" },
    { label: "linkedin", href: "https://www.linkedin.com/in/fuerst-one" },
  ],
  yAlign: "bottom",
  flex: true,
};
