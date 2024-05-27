import { FC, ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
}

export const Badge: FC<BadgeProps> = ({ children }) => {
  return (
    <div className="inline-block rounded-full bg-gray-200 px-2 py-0 font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
      {children}
    </div>
  );
};
