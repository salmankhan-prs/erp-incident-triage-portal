import { z } from "zod";
import {
  ERP_MODULES,
  ENVIRONMENTS,
  BUSINESS_UNITS,
  STATUSES,
  SEVERITIES,
  CATEGORIES,
} from "./constants";

/**
 * Schema for creating a new incident
 */
export const createIncidentSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must be 5000 characters or less"),
  erpModule: z.enum(ERP_MODULES, {
    errorMap: () => ({ message: "Invalid ERP module" }),
  }),
  environment: z.enum(ENVIRONMENTS, {
    errorMap: () => ({ message: "Invalid environment" }),
  }),
  businessUnit: z.enum(BUSINESS_UNITS, {
    errorMap: () => ({ message: "Invalid business unit" }),
  }),
});

/**
 * Schema for updating an incident
 */
export const updateIncidentSchema = z.object({
  status: z
    .enum(STATUSES, {
      errorMap: () => ({ message: "Invalid status" }),
    })
    .optional(),
});

/**
 * Schema for query parameters when listing incidents
 */
export const listIncidentsQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
  severity: z.enum(SEVERITIES).optional(),
  module: z.enum(ERP_MODULES).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  cursor: z.string().optional(),
});

/**
 * Schema for enrichment response from OpenAI
 */
export const enrichmentResultSchema = z.object({
  severity: z.enum(SEVERITIES),
  category: z.enum(CATEGORIES),
  summary: z.string().max(500),
  suggestedAction: z.string().max(500),
});

/**
 * Inferred types from schemas
 */
export type CreateIncidentSchemaType = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentSchemaType = z.infer<typeof updateIncidentSchema>;
export type ListIncidentsQuerySchemaType = z.infer<typeof listIncidentsQuerySchema>;
export type EnrichmentResultSchemaType = z.infer<typeof enrichmentResultSchema>;
