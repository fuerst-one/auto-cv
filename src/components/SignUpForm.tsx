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

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    await addEmailToNotion(email);

    const response = await fetch(`/cv.pdf${window.location.search}`);
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
      className="relative mt-8 flex items-center gap-2 border border-white/30 bg-black/60 px-3 py-2 transition focus-within:border-white print:hidden"
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
        placeholder="email@address"
        className="peer w-0 flex-auto bg-transparent px-2 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
      />
      <Button type="submit" arrow={!isLoading}>
        {isLoading ? <FaHourglass className="inline" /> : "Get PDF CV"}
      </Button>
    </form>
  );
}
