export type Mode = "plasma" | "ascii" | "blend";

export type SizeKey = "small" | "medium" | "large";
export type ContrastKey = "low" | "medium" | "high";

export type KnobId = "mode" | "size" | "contrast" | "blend";

export type KnobState = {
  mode: Mode;
  size: SizeKey;
  contrast: ContrastKey;
  blendStrength: number;
};

export type SplashChoice = "camera" | "plasma-only" | null;

export type PermissionState = "idle" | "requesting" | "granted" | "denied";
