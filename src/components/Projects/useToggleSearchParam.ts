import { useRouter, useSearchParams } from "next/navigation";

export const useToggleSearchParam = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  return (key?: string, value?: string) => {
    if (!key || !value) {
      return;
    }
    const currentSearchParams = Object.fromEntries(searchParams.entries());
    const currentValues = searchParams.getAll(key);
    const newValues = [...currentValues, value];
    const newSearchParams = new URLSearchParams({
      ...currentSearchParams,
      [key]: newValues.join(","),
    });
    const newPath = "?" + newSearchParams.toString();
    router.push(newPath);
  };
};
