/**
 * Frontend types - matching the backend API
 */

export const ERP_MODULES = [
  "AP",
  "AR",
  "GL",
  "Inventory",
  "HR",
  "Payroll",
] as const;

export const ENVIRONMENTS = ["Prod", "Test"] as const;

export const BUSINESS_UNITS = [
  "Finance",
  "Operations",
  "Human Resources",
  "Information Technology",
  "Sales",
  "Supply Chain",
] as const;

export const STATUSES = ["Open", "In Progress", "Resolved", "Closed"] as const;

export const SEVERITIES = ["P1", "P2", "P3"] as const;

export const CATEGORIES = [
  "Configuration Issue",
  "Data Issue",
  "Integration Failure",
  "Security/Access",
  "Unknown",
] as const;

export type ErpModule = (typeof ERP_MODULES)[number];
export type Environment = (typeof ENVIRONMENTS)[number];
export type BusinessUnit = (typeof BUSINESS_UNITS)[number];
export type Status = (typeof STATUSES)[number];
export type Severity = (typeof SEVERITIES)[number];
export type Category = (typeof CATEGORIES)[number];
export type EnrichmentSource = "ai" | "fallback";

export interface Incident {
  id: string;
  title: string;
  description: string;
  erpModule: ErpModule;
  environment: Environment;
  businessUnit: BusinessUnit;
  status: Status;
  severity: Severity;
  category: Category;
  summary: string;
  suggestedAction: string;
  enrichmentSource: EnrichmentSource;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentInput {
  title: string;
  description: string;
  erpModule: ErpModule;
  environment: Environment;
  businessUnit: BusinessUnit;
}

export interface UpdateIncidentInput {
  status?: Status;
}

export interface ListIncidentsResponse {
  items: Incident[];
  total: number;
  nextCursor?: string;
  hasMore: boolean;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
