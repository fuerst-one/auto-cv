import { ReactNode } from "react";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl rounded-lg bg-foreground p-6 shadow-lg">
        {children}
      </div>
    </div>
  );
};
