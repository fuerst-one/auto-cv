"use client";

import { useId, useState } from "react";
import { Button } from "./Button";
import { addEmailToNotion } from "@/server/notion/addEmailToNotion";
import { FaHourglass } from "@react-icons/all-files/fa/FaHourglass";

export function SignUpForm() {
  const id = useId();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    // Collect email and add to Notion
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    await addEmailToNotion(email);

    // Download PDF
    const response = await fetch(`/api/generate-pdf${window.location.search}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setIsLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative isolate mt-8 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 print:hidden backdrop-blur"
    >
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <input
        required
        type="email"
        autoComplete="email"
        name="email"
        id={id}
        placeholder="Email address"
        className="peer w-0 flex-auto bg-transparent px-2 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
      />
      <Button type="submit" arrow={!isLoading}>
        {isLoading ? <FaHourglass className="inline" /> : "Get PDF CV"}
      </Button>
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl border border-white/10 transition peer-focus-within:border-emerald-400/60" />
      <div className="pointer-events-none absolute inset-0 -z-20 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-transparent to-sky-500/10 opacity-0 transition peer-focus-within:opacity-100" />
    </form>
  );
}
