import type { CustomerSegment } from "@/lib/customer";

type CustomerSegmentBadgeProps = {
  segment: CustomerSegment;
};

const styles: Record<CustomerSegment, string> = {
  ENTERPRISE: "border-violet-200 bg-violet-50 text-violet-700",
  MID_MARKET: "border-blue-200 bg-blue-50 text-blue-700",
  SMB: "border-slate-200 bg-slate-100 text-slate-700",
};

export function CustomerSegmentBadge({ segment }: CustomerSegmentBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[segment]}`}
    >
      {segment.replace("_", " ")}
    </span>
  );
}
