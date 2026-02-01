import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "./severity-badge";
import { StatusBadge } from "./status-badge";
import { CategoryBadge } from "./category-badge";
import { EnrichmentBadge } from "./enrichment-badge";
import type { Incident } from "@/types";

interface IncidentCardProps {
  incident: Incident;
}

export function IncidentCard({ incident }: IncidentCardProps) {
  return (
    <Link to={`/incidents/${incident.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem]">
              {incident.title}
            </CardTitle>
            <div className="flex-shrink-0">
              <SeverityBadge severity={incident.severity} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 min-h-[4.5rem]">
            {incident.summary}
          </p>
          <div className="mt-auto space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={incident.status} />
              <CategoryBadge category={incident.category} />
              <EnrichmentBadge source={incident.enrichmentSource} />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{incident.erpModule} | {incident.environment}</span>
              <span>{new Date(incident.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
