import Link from "next/link";
import { cn } from "@/lib/utils";

export function IconLink({
  children,
  className,
  compact = false,
  icon: Icon,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link> & {
  compact?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      {...props}
      className={cn(
        "group relative flex items-center gap-3 border border-white/30 bg-black/60 py-1.5 text-[0.75rem] font-medium text-neutral-200 transition hover:border-white hover:text-white",
        compact ? "px-3" : "px-4",
        className,
      )}
    >
      {Icon && <Icon className="h-4 w-4 flex-none text-neutral-200" />}
      <span className="self-baseline">{children}</span>
    </Link>
  );
}
