import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  STATUSES,
  SEVERITIES,
  ERP_MODULES,
  type Status,
  type Severity,
  type ErpModule,
} from "@/types";
import { X } from "lucide-react";

interface IncidentFiltersProps {
  filters: {
    status?: Status;
    severity?: Severity;
    module?: ErpModule;
  };
  onFilterChange: (filters: {
    status?: Status;
    severity?: Severity;
    module?: ErpModule;
  }) => void;
}

export function IncidentFilters({
  filters,
  onFilterChange,
}: IncidentFiltersProps) {
  const hasFilters = filters.status || filters.severity || filters.module;

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select
        value={filters.status || "all"}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            status: value === "all" ? undefined : (value as Status),
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.severity || "all"}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            severity: value === "all" ? undefined : (value as Severity),
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Severities</SelectItem>
          {SEVERITIES.map((severity) => (
            <SelectItem key={severity} value={severity}>
              {severity}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.module || "all"}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            module: value === "all" ? undefined : (value as ErpModule),
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by module" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Modules</SelectItem>
          {ERP_MODULES.map((module) => (
            <SelectItem key={module} value={module}>
              {module}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
