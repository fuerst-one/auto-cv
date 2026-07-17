"use client";

import { CSSProperties, ReactNode, useEffect, useRef } from "react";
import Link from "next/link";
import { LabelPlacement } from "./getLabelGroupPlacements";

type LabelOverlayProps = {
  placements: LabelPlacement[];
  cellSize: number;
  cellWidth?: number;
  fontPx: number;
  /**
   * Live glitch-burst amplitude (0 = calm). When provided, labels flagged
   * with `glitch` mirror the canvas tear as a red/cyan text split in sync.
   */
  getGlitchIntensity?: () => number;
};

// How strongly the split holds while hovered/focused, and how fast it eases
// toward that hold each frame.
const HOVER_HOLD = 0.6;
const HOVER_EASE = 0.18;

// Red one way, cyan the other — the same anaglyph tear the canvas uses. Both
// the offset and the opacity scale with the live `--glitch` value, so at rest
// (0) the shadow is invisible and no layout box changes.
const glitchShadowStyle = {
  "--glitch": 0,
  textShadow:
    "calc(var(--glitch, 0) * 0.16em) 0 rgba(255, 0, 0, calc(var(--glitch, 0))), " +
    "calc(var(--glitch, 0) * -0.16em) 0 rgba(0, 255, 255, calc(var(--glitch, 0)))",
} as CSSProperties;

type GlitchLinkProps = {
  href: string;
  ariaLabel: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  getIntensity: () => number;
  children: ReactNode;
};

const GlitchLink = ({
  href,
  ariaLabel,
  className,
  style,
  onClick,
  getIntensity,
  children,
}: GlitchLinkProps) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const hoverRef = useRef(false);
  const easeRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const target = hoverRef.current ? HOVER_HOLD : 0;
      easeRef.current += (target - easeRef.current) * HOVER_EASE;
      const value = Math.max(getIntensity(), easeRef.current);
      ref.current?.style.setProperty("--glitch", value.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [getIntensity]);

  return (
    <Link
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      className={className}
      style={{ ...style, ...glitchShadowStyle }}
      onClick={onClick}
      onPointerEnter={() => (hoverRef.current = true)}
      onPointerLeave={() => (hoverRef.current = false)}
      onFocus={() => (hoverRef.current = true)}
      onBlur={() => (hoverRef.current = false)}
    >
      {children}
    </Link>
  );
};

export const LabelOverlay = ({
  placements,
  cellSize,
  cellWidth,
  fontPx,
  getGlitchIntensity,
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

        if (label.href && label.glitch && getGlitchIntensity) {
          return (
            <GlitchLink
              key={idx}
              href={label.href}
              ariaLabel={label.label}
              className={className}
              style={containerStyle}
              onClick={label.onClick}
              getIntensity={getGlitchIntensity}
            >
              {content}
            </GlitchLink>
          );
        }

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
