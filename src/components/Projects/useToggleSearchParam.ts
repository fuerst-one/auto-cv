import { useFiltersStore } from "./filtersStore";

export const useToggleSearchParam = () => {
  const toggle = useFiltersStore((s) => s.toggle);
  return (key?: string, value?: string) => {
    if (!key || !value) return;
    toggle(key, value);
  };
};
