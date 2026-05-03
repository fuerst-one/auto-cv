"use client";

import { CSSProperties } from "react";
import Link from "next/link";
import { LabelPlacement } from "./getLabelGroupPlacements";

type LabelOverlayProps = {
  placements: LabelPlacement[];
  cellSize: number;
  cellWidth?: number;
  fontPx: number;
};

export const LabelOverlay = ({
  placements,
  cellSize,
  cellWidth,
  fontPx,
}: LabelOverlayProps) => {
  const cw = cellWidth ?? cellSize;
  const ch = cellSize;
  return (
    <div className="pointer-events-none absolute inset-0">
      {placements.map(({ label, row, startCol }, idx) => {
        const containerStyle: CSSProperties = {
          position: "absolute",
          left: startCol * cw,
          top: row * ch,
          width: label.label.length * cw,
          height: ch,
          display: "flex",
          fontSize: label.style?.fontSize ?? fontPx,
          fontWeight: label.style?.fontWeight,
          color: label.style?.color,
          backgroundColor: "black",
        };
        const cellStyle: CSSProperties = {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: cw,
          height: ch,
          lineHeight: 1,
          transform: `translate(${0.8 + 0.01 * cw}px, ${-0.4 - 0.01 * ch}px)`,
        };
        const className =
          "pointer-events-auto cursor-pointer text-foreground hover:underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current";
        const content = label.label.split("").map((character, i) => (
          <span key={i} style={cellStyle}>
            {character}
          </span>
        ));

        if (label.href) {
          return (
            <Link
              key={idx}
              href={label.href}
              aria-label={label.label}
              className={className}
              style={containerStyle}
              onClick={label.onClick}
            >
              {content}
            </Link>
          );
        }
        return (
          <button
            key={idx}
            type="button"
            aria-label={label.label}
            className={className}
            style={containerStyle}
            onClick={label.onClick}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
};
