"use client";

import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

export const Tag = ({
  searchParamKey,
  value,
  className,
  children,
}: {
  searchParamKey?: string;
  value?: string;
  className?: string;
  children: ReactNode;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const canChangeSearchParams = searchParamKey && value;

  const onClick = canChangeSearchParams
    ? () => {
        const currentSearchParams = Object.fromEntries(searchParams.entries());
        const currentValues = searchParams.getAll(searchParamKey);
        const newValues = [...currentValues, value];
        const newSearchParams = new URLSearchParams({
          ...currentSearchParams,
          [searchParamKey]: newValues.join(","),
        });
        const newPath = "?" + newSearchParams.toString();
        router.push(newPath);
      }
    : undefined;

  return (
    <span
      className={clsx(
        "rounded-sm border border-gray-300 px-1 py-0.5",
        { "cursor-pointer hover:bg-gray-200": canChangeSearchParams },
        className,
      )}
      onClick={onClick}
    >
      {children}
    </span>
  );
};
