"use client";

import { CSSProperties, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { LabelPlacement } from "../Plasma/getLabelGroupPlacements";
import { ContrastKey, KnobId, KnobState, SizeKey, Source } from "./types";

type KnobDropdownProps = {
  openKnob: KnobId | null;
  placement: LabelPlacement | null;
  cellSize: number;
  cellWidth?: number;
  knobs: KnobState;
  cameraSourceEnabled: boolean;
  onChange: <K extends keyof KnobState>(key: K, value: KnobState[K]) => void;
  onClose: () => void;
};

const SOURCES: ReadonlyArray<{ value: Source; label: string }> = [
  { value: "plasma", label: "PLASMA" },
  { value: "camera", label: "CAMERA" },
  { value: "upload", label: "UPLOAD" },
  { value: "shapes", label: "SHAPES" },
];

const SIZES: ReadonlyArray<{ value: SizeKey; label: string }> = [
  { value: "small", label: "SMALL" },
  { value: "medium", label: "MEDIUM" },
  { value: "large", label: "LARGE" },
];

const CONTRASTS: ReadonlyArray<{ value: ContrastKey; label: string }> = [
  { value: "low", label: "LOW" },
  { value: "medium", label: "MEDIUM" },
  { value: "high", label: "HIGH" },
];

export const KnobDropdown = ({
  openKnob,
  placement,
  cellSize,
  cellWidth,
  knobs,
  cameraSourceEnabled,
  onChange,
  onClose,
}: KnobDropdownProps) => {
  const cw = cellWidth ?? cellSize;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openKnob) {
      return;
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current) {
        return;
      }
      if (panelRef.current.contains(event.target as Node)) {
        return;
      }
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openKnob, onClose]);

  if (!openKnob || !placement) {
    return null;
  }

  const panelStyle: CSSProperties = {
    position: "absolute",
    left: placement.startCol * cw,
    bottom: cellSize * 2,
    minWidth: cw * 14,
  };

  return (
    <div
      ref={panelRef}
      className="z-20 border border-border bg-popover/95 p-3 text-popover-foreground backdrop-blur-sm"
      style={panelStyle}
      role="menu"
    >
      {openKnob === "source" && (
        <RadioList
          name="source"
          value={knobs.source}
          options={SOURCES}
          isDisabled={(option) =>
            option.value === "camera" && !cameraSourceEnabled
          }
          onChange={(value) => onChange("source", value)}
        />
      )}
      {openKnob === "size" && (
        <RadioList
          name="size"
          value={knobs.size}
          options={SIZES}
          onChange={(value) => onChange("size", value)}
        />
      )}
      {openKnob === "contrast" && (
        <RadioList
          name="contrast"
          value={knobs.contrast}
          options={CONTRASTS}
          onChange={(value) => onChange("contrast", value)}
        />
      )}
    </div>
  );
};

type RadioListProps<TValue extends string> = {
  name: string;
  value: TValue;
  options: ReadonlyArray<{ value: TValue; label: string }>;
  isDisabled?: (option: { value: TValue; label: string }) => boolean;
  onChange: (value: TValue) => void;
};

const RadioList = <TValue extends string>({
  name,
  value,
  options,
  isDisabled,
  onChange,
}: RadioListProps<TValue>) => {
  return (
    <div className="flex flex-col gap-1 text-sm">
      {options.map((option) => {
        const disabled = isDisabled?.(option) ?? false;
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-2 px-1 py-0.5 text-left",
              disabled
                ? "cursor-not-allowed text-muted-foreground/50"
                : "hover:underline",
            )}
            aria-pressed={selected}
            data-name={name}
          >
            <span aria-hidden className="w-3 text-foreground">
              {selected ? "·" : " "}
            </span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
