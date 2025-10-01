import { useRouter, useSearchParams } from "next/navigation";

export const useToggleSearchParam = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  return (key?: string, value?: string) => {
    if (!key || !value) {
      return;
    }

    // Clone current params so we preserve unrelated keys
    const nextParams = new URLSearchParams(searchParams.toString());

    // Toggle the target value (CSV within a single key)
    const existingCsv = nextParams.get(key) ?? "";
    const existingValues = existingCsv
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const hasValue = existingValues.includes(value);
    const toggledValues = hasValue
      ? existingValues.filter((v) => v !== value)
      : Array.from(new Set([...existingValues, value])).sort((a, b) =>
          a.localeCompare(b),
        );

    if (toggledValues.length > 0) {
      nextParams.set(key, toggledValues.join(","));
    } else {
      nextParams.delete(key);
    }

    // If user is setting any filter other than the default "featured",
    // drop the default flag so results expand as expected
    if (key !== "featured") {
      nextParams.delete("featured");
    }

    const search = nextParams.toString();
    router.push(search ? `?${search}` : "/", { scroll: false });
  };
};
