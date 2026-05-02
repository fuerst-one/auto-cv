import { FC, ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
}

export const Badge: FC<BadgeProps> = ({ children }) => {
  return (
    <div className="inline-block border border-white/30 bg-black px-2 py-0 font-semibold text-neutral-100">
      {children}
    </div>
  );
};
