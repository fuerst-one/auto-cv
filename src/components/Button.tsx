import { cn } from "@/lib/utils";
import Link from "next/link";

function ButtonInner({
  arrow = false,
  children,
}: {
  arrow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className="relative flex items-center gap-3 px-5 py-2">
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em]">
        {children}
      </span>
      {arrow ? <span aria-hidden="true">↗</span> : null}
    </span>
  );
}

export function Button({
  className,
  arrow,
  children,
  ...props
}: { arrow?: boolean } & (
  | React.ComponentPropsWithoutRef<typeof Link>
  | ({ href?: undefined } & React.ComponentPropsWithoutRef<"button">)
)) {
  className = cn(
    "inline-flex flex-none items-center justify-center overflow-hidden border border-white bg-white text-black transition hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black",
    className,
  );

  return typeof props.href === "undefined" ? (
    <button className={className} {...props}>
      <ButtonInner arrow={arrow}>{children}</ButtonInner>
    </button>
  ) : (
    <Link className={className} {...props}>
      <ButtonInner arrow={arrow}>{children}</ButtonInner>
    </Link>
  );
}
