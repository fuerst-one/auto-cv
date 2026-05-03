export type Source = "plasma" | "camera" | "upload" | "shapes";

export type SizeKey = "small" | "medium" | "large";
export type ContrastKey = "low" | "medium" | "high";

export type KnobId = "source" | "size" | "contrast";

export type KnobState = {
  source: Source;
  size: SizeKey;
  contrast: ContrastKey;
};

export type SplashChoice = "camera" | "upload" | "plasma" | "shapes" | null;

export type PermissionState = "idle" | "requesting" | "granted" | "denied";
