import { LabelGroup } from "../types";
import { KnobId } from "./types";

export type PlaygroundLabelsArgs = {
  isPaused: boolean;
  copyStatus: "idle" | "copied";
  showUploadPrompt: boolean;
  onTogglePause: () => void;
  onKnobToggle: (id: KnobId) => void;
  onCopy: () => void;
  onUpload: () => void;
};

const PAUSE_ICON = "⏸";
const PLAY_ICON = "⏵";

export const getPlaygroundLabels = ({
  isPaused,
  copyStatus,
  showUploadPrompt,
  onTogglePause,
  onKnobToggle,
  onCopy,
  onUpload,
}: PlaygroundLabelsArgs): LabelGroup[] => {
  const groups: LabelGroup[] = [
    {
      labels: [{ label: "← FUERST.ONE", href: "/" }],
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
        { label: "SOURCE", onClick: () => onKnobToggle("source") },
        { label: "SIZE", onClick: () => onKnobToggle("size") },
        { label: "CONTRAST", onClick: () => onKnobToggle("contrast") },
        {
          label: copyStatus === "copied" ? "COPIED" : "COPY",
          onClick: onCopy,
        },
      ],
      yAlign: "bottom",
      xAlign: "center",
      padding: 2,
    },
  ];

  if (showUploadPrompt) {
    groups.push({
      labels: [
        {
          label: "[UPLOAD]",
          onClick: onUpload,
          style: { fontWeight: 700 },
        },
      ],
      yAlign: "center",
      xAlign: "center",
    });
  }

  return groups;
};
