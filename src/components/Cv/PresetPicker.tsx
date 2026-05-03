"use client";

import { useId, useState } from "react";
import clsx from "clsx";
import { Button } from "../Button";
import { addEmailToNotion } from "@/server/notion/addEmailToNotion";
import { FaHourglass } from "@react-icons/all-files/fa/FaHourglass";
import {
  CV_PRESET_ORDER,
  CvPreset,
  CvPresetId,
  DEFAULT_PRESET_ID,
} from "./cvPresets";

export type PresetOption = CvPreset & { matchedCount: number };

export function PresetPicker({ presets }: { presets: PresetOption[] }) {
  const emailId = useId();
  const [selectedId, setSelectedId] = useState<CvPresetId>(DEFAULT_PRESET_ID);
  const [isLoading, setIsLoading] = useState(false);

  const orderedPresets = CV_PRESET_ORDER.map(
    (id) => presets.find((preset) => preset.id === id)!,
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      await addEmailToNotion(email);

      const response = await fetch(`/cv.pdf?preset=${selectedId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `alexander-fuerst-cv-${selectedId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Pick a CV preset
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {orderedPresets.map((preset) => {
            const isSelected = preset.id === selectedId;
            return (
              <label
                key={preset.id}
                className={clsx(
                  "flex cursor-pointer flex-col gap-2 border bg-black/60 p-4 transition",
                  isSelected
                    ? "border-white text-white"
                    : "border-white/30 text-neutral-200 hover:border-white/60",
                )}
              >
                <input
                  type="radio"
                  name="preset"
                  value={preset.id}
                  checked={isSelected}
                  onChange={() => setSelectedId(preset.id)}
                  className="sr-only"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold uppercase tracking-[0.15em]">
                    {preset.label}
                  </span>
                  <span className="border border-white/30 bg-black px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.2em] text-neutral-300">
                    {preset.matchedCount} project
                    {preset.matchedCount === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-neutral-400">
                  {preset.description}
                </p>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="relative flex items-center gap-2 border border-white/30 bg-black/60 px-3 py-2 transition focus-within:border-white">
        <label htmlFor={emailId} className="sr-only">
          Email address
        </label>
        <input
          required
          type="email"
          autoComplete="email"
          name="email"
          id={emailId}
          placeholder="email@address"
          className="peer w-0 flex-auto bg-transparent px-2 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
        />
        <Button type="submit" arrow={!isLoading}>
          {isLoading ? <FaHourglass className="inline" /> : "Get PDF CV"}
        </Button>
      </div>
    </form>
  );
}
