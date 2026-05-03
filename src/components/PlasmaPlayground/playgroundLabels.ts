import { Label, LabelGroup } from "../Plasma/types";
import { KnobId } from "./types";
import { RecorderStatus } from "./useCanvasRecorder";

export type PlaygroundLabelsArgs = {
  isPaused: boolean;
  copyStatus: "idle" | "copied";
  snapStatus: "idle" | "saved";
  recorderStatus: RecorderStatus;
  recorderElapsedSeconds: number;
  showUploadPrompt: boolean;
  onTogglePause: () => void;
  onKnobToggle: (id: KnobId) => void;
  onCopy: () => void;
  onSnap: () => void;
  onToggleRec: () => void;
  onUpload: () => void;
};

const PAUSE_ICON = "⏸";
const PLAY_ICON = "⏵";
const REC_DOT = "●";
const REC_COLOR = "#ff5050";

const formatRecLabel = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${REC_DOT} ${minutes}:${remainder.toString().padStart(2, "0")}`;
};

export const getPlaygroundLabels = ({
  isPaused,
  copyStatus,
  snapStatus,
  recorderStatus,
  recorderElapsedSeconds,
  showUploadPrompt,
  onTogglePause,
  onKnobToggle,
  onCopy,
  onSnap,
  onToggleRec,
  onUpload,
}: PlaygroundLabelsArgs): LabelGroup[] => {
  const bottomLabels: Label[] = [
    { label: "SOURCE", onClick: () => onKnobToggle("source") },
    { label: "SIZE", onClick: () => onKnobToggle("size") },
    { label: "CONTRAST", onClick: () => onKnobToggle("contrast") },
    {
      label: copyStatus === "copied" ? "COPIED" : "COPY",
      onClick: onCopy,
    },
    {
      label: snapStatus === "saved" ? "SAVED" : "SNAP",
      onClick: onSnap,
    },
  ];

  if (recorderStatus !== "unsupported" && recorderStatus !== "detecting") {
    bottomLabels.push({
      label:
        recorderStatus === "recording"
          ? formatRecLabel(recorderElapsedSeconds)
          : "REC",
      onClick: onToggleRec,
      style: recorderStatus === "recording" ? { color: REC_COLOR } : undefined,
    });
  }

  const groups: LabelGroup[] = [
    {
      labels: [{ label: "< FUERST.ONE", href: "/" }],
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
      labels: bottomLabels,
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
