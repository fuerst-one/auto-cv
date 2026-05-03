import { LabelGroup } from "../types";
import { KnobId } from "./types";

export type PlaygroundLabelsArgs = {
  isPaused: boolean;
  copyStatus: "idle" | "copied";
  onTogglePause: () => void;
  onKnobToggle: (id: KnobId) => void;
  onCopy: () => void;
};

const PAUSE_ICON = "⏸";
const PLAY_ICON = "⏵";

export const getPlaygroundLabels = ({
  isPaused,
  copyStatus,
  onTogglePause,
  onKnobToggle,
  onCopy,
}: PlaygroundLabelsArgs): LabelGroup[] => {
  return [
    {
      labels: [{ label: "FUERST.ONE", href: "/" }],
      yAlign: "top",
      xAlign: "left",
    },
    {
      labels: [
        {
          label: isPaused ? PLAY_ICON : PAUSE_ICON,
          onClick: onTogglePause,
        },
      ],
      yAlign: "top",
      xAlign: "right",
    },
    {
      labels: [
        { label: "MODE", onClick: () => onKnobToggle("mode") },
        { label: "SIZE", onClick: () => onKnobToggle("size") },
        { label: "CONTRAST", onClick: () => onKnobToggle("contrast") },
        {
          label: copyStatus === "copied" ? "COPIED" : "COPY",
          onClick: onCopy,
        },
      ],
      yAlign: "bottom",
      xAlign: "left",
      padding: 2,
    },
  ];
};
