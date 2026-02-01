import { Badge } from "@/components/ui/badge";
import { Sparkles, Wrench } from "lucide-react";
import type { EnrichmentSource } from "@/types";

interface EnrichmentBadgeProps {
  source: EnrichmentSource;
}

export function EnrichmentBadge({ source }: EnrichmentBadgeProps) {
  if (source === "ai") {
    return (
      <Badge variant="outline" className="text-xs gap-1">
        <Sparkles className="h-3 w-3" />
        AI
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="text-xs gap-1">
      <Wrench className="h-3 w-3" />
      Auto
    </Badge>
  );
}
