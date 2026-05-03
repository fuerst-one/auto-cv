import { LabelGroup } from "../types";

export type SplashLabelsArgs = {
  fontPx: number;
  onChooseCamera: () => void;
  onChoosePlasma: () => void;
};

export const getSplashLabels = ({
  fontPx,
  onChooseCamera,
  onChoosePlasma,
}: SplashLabelsArgs): LabelGroup[] => {
  const fontSize = fontPx + 2;
  return [
    {
      labels: [
        {
          label: "[USE CAMERA]",
          onClick: onChooseCamera,
          style: { fontWeight: 700, fontSize },
        },
        {
          label: "[JUST PLASMA]",
          onClick: onChoosePlasma,
          style: { fontWeight: 700, fontSize },
        },
      ],
      yAlign: "center",
      padding: 4,
    },
  ];
};
