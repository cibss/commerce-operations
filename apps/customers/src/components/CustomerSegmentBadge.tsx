import { Badge, type BadgeVariant } from "@commerce/ui";

import type { CustomerSegment } from "@/lib/customer";

type CustomerSegmentBadgeProps = {
  segment: CustomerSegment;
};

const segmentVariants: Record<CustomerSegment, BadgeVariant> = {
  ENTERPRISE: "accent",
  MID_MARKET: "info",
  SMB: "neutral",
};

export function CustomerSegmentBadge({ segment }: CustomerSegmentBadgeProps) {
  return (
    <Badge variant={segmentVariants[segment]}>
      {segment.replace("_", " ")}
    </Badge>
  );
}
