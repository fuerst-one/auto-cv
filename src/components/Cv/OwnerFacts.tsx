import { CvOwnerPublic } from "@/server/notion/getCvOwner";

const FactRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[0.6rem] uppercase tracking-[0.3em] text-neutral-400">
      {label}
    </span>
    <span className="text-xs text-neutral-200">{children}</span>
  </div>
);

export const OwnerFacts = ({ owner }: { owner: CvOwnerPublic }) => {
  const statusLine = [owner.position, owner.status].filter(Boolean).join(" · ");

  return (
    <div className="space-y-3 print:hidden">
      <span className="text-[0.65rem] uppercase tracking-[0.3em] text-neutral-400">
        Profile
      </span>
      <div className="space-y-3 rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-3">
        {statusLine && <FactRow label="Status">{statusLine}</FactRow>}
        {owner.languages && (
          <FactRow label="Languages">{owner.languages}</FactRow>
        )}
        {owner.education && (
          <FactRow label="Education">{owner.education}</FactRow>
        )}
        {owner.city && <FactRow label="Location">{owner.city}</FactRow>}
      </div>
    </div>
  );
};
