"use client";

import { useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DevLog = (props: any) => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    console.log(props);
  }, [props]);
  return null;
};
