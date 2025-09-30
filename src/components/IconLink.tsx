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
        className,
        "group relative isolate flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[0.75rem] font-medium text-slate-200 transition hover:border-emerald-400/50 hover:text-white",
        compact ? "px-3" : "px-4",
      )}
    >
      <span className="absolute inset-0 -z-10 scale-95 rounded-full border border-white/10 bg-white/5 opacity-0 transition group-hover:scale-100 group-hover:opacity-100" />
      {Icon && <Icon className="h-4 w-4 flex-none text-emerald-300" />}
      <span className="self-baseline text-slate-100">
        {children}
      </span>
    </Link>
  );
}
