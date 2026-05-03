import { LabelGroup } from "../types";
import { KnobId, KnobState } from "./types";

export type PlaygroundLabelsArgs = {
  knobs: KnobState;
  isPaused: boolean;
  onTogglePause: () => void;
  onKnobToggle: (id: KnobId) => void;
};

const PAUSE_ICON = "⏸";
const PLAY_ICON = "⏵";

export const getPlaygroundLabels = ({
  knobs,
  isPaused,
  onTogglePause,
  onKnobToggle,
}: PlaygroundLabelsArgs): LabelGroup[] => {
  const blendDisabled = knobs.mode !== "blend";
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
          label: "BLEND",
          onClick: blendDisabled ? undefined : () => onKnobToggle("blend"),
          style: blendDisabled ? { opacity: 0.4 } : undefined,
        },
      ],
      yAlign: "bottom",
      xAlign: "left",
      padding: 2,
    },
  ];
};
