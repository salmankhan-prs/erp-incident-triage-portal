import { Badge } from "@/components/ui/badge";
import type { Status } from "@/types";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<
  Status,
  { variant: "default" | "secondary" | "success" | "outline" }
> = {
  Open: { variant: "default" },
  "In Progress": { variant: "secondary" },
  Resolved: { variant: "success" },
  Closed: { variant: "outline" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{status}</Badge>;
}
