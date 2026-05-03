import { LabelGroup } from "../Plasma/types";

export type SplashLabelsArgs = {
  fontPx: number;
  onChooseCamera: () => void;
  onChooseUpload: () => void;
  onChoosePlasma: () => void;
  onChooseShapes: () => void;
};

export const getSplashLabels = ({
  fontPx,
  onChooseCamera,
  onChooseUpload,
  onChoosePlasma,
  onChooseShapes,
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
          label: "[UPLOAD]",
          onClick: onChooseUpload,
          style: { fontWeight: 700, fontSize },
        },
        {
          label: "[3D SHAPES]",
          onClick: onChooseShapes,
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
