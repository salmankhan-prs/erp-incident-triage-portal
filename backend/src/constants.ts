/**
 * ERP Module types - represents different Oracle ERP modules
 */
export const ERP_MODULES = [
  "AP", // Accounts Payable
  "AR", // Accounts Receivable
  "GL", // General Ledger
  "Inventory",
  "HR",
  "Payroll",
] as const;

/**
 * Environment types - Production vs Test
 */
export const ENVIRONMENTS = ["Prod", "Test"] as const;

/**
 * Business unit options
 */
export const BUSINESS_UNITS = [
  "Finance",
  "Operations",
  "Human Resources",
  "Information Technology",
  "Sales",
  "Supply Chain",
] as const;

/**
 * Incident status workflow
 */
export const STATUSES = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
] as const;

/**
 * Severity levels for incident prioritization
 * P1 - Production-blocking, immediate attention required
 * P2 - Major impact, needs attention soon
 * P3 - Minor issue, can be scheduled
 */
export const SEVERITIES = ["P1", "P2", "P3"] as const;

/**
 * Incident categories for classification
 */
export const CATEGORIES = [
  "Configuration Issue",
  "Data Issue",
  "Integration Failure",
  "Security/Access",
  "Unknown",
] as const;
