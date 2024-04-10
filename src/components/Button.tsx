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
    <>
      <span className="absolute inset-0 rounded-md bg-gradient-to-b from-white/80 to-white opacity-10 transition-opacity group-hover:opacity-15" />
      <span className="opacity-7.5 absolute inset-0 rounded-md transition-opacity group-hover:opacity-10" />
      {children} {arrow ? <span aria-hidden="true">&rarr;</span> : null}
    </>
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
    className,
    "group relative isolate flex-none rounded-md py-1.5 text-[0.8125rem]/6 font-semibold text-white",
    arrow ? "pl-2.5 pr-[calc(9/16*1rem)]" : "px-2.5",
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
