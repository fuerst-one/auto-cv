import dayjs from "dayjs";

export function FormattedDate({
  date,
  ...props
}: React.ComponentPropsWithoutRef<"time"> & { date: string | Date | null }) {
  if (!date) {
    return null;
  }

  date = typeof date === "string" ? new Date(date) : date;

  return (
    <time dateTime={date.toISOString()} {...props}>
      {dayjs(date).format("YYYY/MM")}
    </time>
  );
}
