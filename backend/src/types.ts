import type {
  ERP_MODULES,
  ENVIRONMENTS,
  BUSINESS_UNITS,
  STATUSES,
  SEVERITIES,
  CATEGORIES,
} from "./constants";

/**
 * Derived types from const arrays
 */
export type ErpModule = (typeof ERP_MODULES)[number];
export type Environment = (typeof ENVIRONMENTS)[number];
export type BusinessUnit = (typeof BUSINESS_UNITS)[number];
export type Status = (typeof STATUSES)[number];
export type Severity = (typeof SEVERITIES)[number];
export type Category = (typeof CATEGORIES)[number];

/**
 * Enrichment source - indicates how the incident was enriched
 */
export type EnrichmentSource = "ai" | "fallback";

/**
 * Main Incident entity
 */
export interface Incident {
  id: string;
  title: string;
  description: string;
  erpModule: ErpModule;
  environment: Environment;
  businessUnit: BusinessUnit;
  status: Status;

  // AI-enriched fields
  severity: Severity;
  category: Category;
  summary: string;
  suggestedAction: string;
  
  // Indicates if AI or fallback was used
  enrichmentSource: EnrichmentSource;

  // Timestamps (ISO 8601)
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a new incident (before enrichment)
 */
export interface CreateIncidentInput {
  title: string;
  description: string;
  erpModule: ErpModule;
  environment: Environment;
  businessUnit: BusinessUnit;
}

/**
 * Input for updating an incident
 */
export interface UpdateIncidentInput {
  status?: Status;
}

/**
 * Enrichment result from OpenAI or fallback
 */
export interface EnrichmentResult {
  severity: Severity;
  category: Category;
  summary: string;
  suggestedAction: string;
  source: EnrichmentSource;
}

/**
 * Query parameters for listing incidents
 */
export interface ListIncidentsQuery {
  status?: Status;
  severity?: Severity;
  module?: ErpModule;
  limit?: number;
  cursor?: string;
}

/**
 * API response for listing incidents with pagination
 */
export interface ListIncidentsResponse {
  items: Incident[];
  total: number;
  nextCursor?: string;
  hasMore: boolean;
}

/**
 * API error response
 */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
