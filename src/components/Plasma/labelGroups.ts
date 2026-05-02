import { LabelGroup } from "./types";

export const getLabelsGroups = (
  isPlaying: boolean,
  toggleIsPlaying: () => void,
): LabelGroup[] => [
  getPlayPauseLabelGroup(isPlaying, toggleIsPlaying),
  topLeftLabelGroup,
  centerLabelGroup,
  bottomLabelGroup,
];

const getPlayPauseLabelGroup = (
  isPlaying: boolean,
  onClick?: () => void,
): LabelGroup => ({
  labels: [
    { label: "play/pause", onClick },
    { label: isPlaying ? "⏸" : "⏵", onClick },
  ],
  yAlign: "top",
  xAlign: "right",
  padding: 1,
});

const topLeftLabelGroup: LabelGroup = {
  labels: [
    {
      label: "code",
      href: "https://github.com/fuerst-one/fuerst-one-website",
    },
  ],
  yAlign: "top",
  xAlign: "left",
};

const centerLabelGroup: LabelGroup = {
  labels: [
    {
      label: "FUERST.ONE",
      className: "font-bold",
      href: "/cv",
    },
  ],
  yAlign: "center",
};

const bottomLabelGroup: LabelGroup = {
  labels: [
    { label: "contact", href: "mailto:alexander@fuerst.one" },
    { label: "github", href: "https://github.com/fuerst-one" },
    { label: "legal", href: "/legal-notice" },
    { label: "privacy", href: "/privacy" },
  ],
  yAlign: "bottom",
};
