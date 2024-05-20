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
      className="relative isolate mt-8 flex items-center pr-1 print:hidden"
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
        className="peer w-0 flex-auto bg-transparent px-4 py-2.5 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-[0.8125rem]/6"
      />
      <Button type="submit" arrow={!isLoading}>
        {isLoading ? <FaHourglass className="inline" /> : "Get PDF CV"}
      </Button>
      <div className="absolute inset-0 -z-10 rounded-lg transition peer-focus:ring-4 peer-focus:ring-sky-300/15" />
      <div className="bg-white/2.5 absolute inset-0 -z-10 rounded-lg ring-1 ring-white/15 transition peer-focus:ring-sky-300" />
    </form>
  );
}
