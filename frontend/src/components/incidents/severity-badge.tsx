import { Badge } from "@/components/ui/badge";
import type { Severity } from "@/types";

interface SeverityBadgeProps {
  severity: Severity;
}

const severityConfig: Record<
  Severity,
  { label: string; variant: "destructive" | "warning" | "success" }
> = {
  P1: { label: "P1 - Critical", variant: "destructive" },
  P2: { label: "P2 - High", variant: "warning" },
  P3: { label: "P3 - Low", variant: "success" },
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
