/**
 * Incident Enrichment Service
 * 
 * Provides AI-powered classification of incidents using OpenAI.
 * Falls back to rule-based heuristics when OpenAI is unavailable.
 * 
 * TODO: For production, convert to async processing:
 * - Push enrichment jobs to SQS queue
 * - Process in separate Lambda with ReAct agent pattern
 * - Agent can search knowledge base, correlate with past incidents
 * - Notify user via WebSocket when analysis completes
 */

import OpenAI from "openai";
import type { CreateIncidentInput, EnrichmentResult, Severity, Category } from "./types";
import { enrichmentResultSchema } from "./schemas";
import "dotenv/config";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "" || apiKey === "sk-your-openai-api-key-here") {
      console.warn("OPENAI_API_KEY not configured, using fallback enrichment");
      return null;
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

const ENRICHMENT_PROMPT = `You are an ERP incident triage assistant for Oracle ERP systems. Analyze the incident and provide triage information.

Severity Guidelines:
- P1: Production system down, critical business impact, requires immediate attention
- P2: Major functionality impaired, significant business impact, needs attention soon  
- P3: Minor issue, limited impact, can be scheduled for resolution

Categories:
- Configuration Issue: Settings, parameters, or setup problems
- Data Issue: Incorrect, missing, or corrupted data
- Integration Failure: Problems with external system connections
- Security/Access: Permission, authentication, or authorization problems
- Unknown: Cannot be determined from the information provided

Respond with ONLY valid JSON in this exact format:
{
  "severity": "P1" | "P2" | "P3",
  "category": "Configuration Issue" | "Data Issue" | "Integration Failure" | "Security/Access" | "Unknown",
  "summary": "1-2 sentence summary of the issue",
  "suggestedAction": "Recommended next step to resolve"
}`;

function buildUserMessage(input: CreateIncidentInput): string {
  return `Analyze this ERP incident:

Title: ${input.title}
Description: ${input.description}
ERP Module: ${input.erpModule}
Environment: ${input.environment}
Business Unit: ${input.businessUnit}`;
}

export async function enrichIncident(
  input: CreateIncidentInput
): Promise<EnrichmentResult> {
  const client = getOpenAIClient();
  
  if (!client) {
    console.log("Using fallback enrichment (OpenAI not configured)");
    return getFallbackEnrichment(input);
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ENRICHMENT_PROMPT },
        { role: "user", content: buildUserMessage(input) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error("No content in OpenAI response, using fallback");
      return getFallbackEnrichment(input);
    }

    const parsed = JSON.parse(content);
    const validated = enrichmentResultSchema.safeParse(parsed);

    if (!validated.success) {
      console.error("OpenAI response validation failed:", validated.error);
      return getFallbackEnrichment(input);
    }

    return {
      ...validated.data,
      source: "ai",
    };
  } catch (error) {
    console.error("OpenAI enrichment failed:", error);
    return getFallbackEnrichment(input);
  }
}

/**
 * Rule-based fallback when OpenAI is unavailable.
 * Uses keyword matching to determine severity and category.
 */
export function getFallbackEnrichment(
  input: CreateIncidentInput
): EnrichmentResult {
  const text = `${input.title} ${input.description}`.toLowerCase();

  let severity: Severity = "P2";
  
  if (input.environment === "Test") {
    severity = "P3";
  } else if (
    /urgent|critical|down|blocked|emergency|outage|production.*down|system.*down/i.test(text)
  ) {
    severity = "P1";
  } else if (
    /error|failed|failing|issue|problem|broken/i.test(text)
  ) {
    severity = "P2";
  } else if (
    /minor|low|question|inquiry|enhancement/i.test(text)
  ) {
    severity = "P3";
  }

  let category: Category = "Unknown";
  
  if (/config|setting|parameter|setup|enable|disable/i.test(text)) {
    category = "Configuration Issue";
  } else if (/data|record|duplicate|missing|incorrect|invalid/i.test(text)) {
    category = "Data Issue";
  } else if (/integrat|api|connect|sync|interface|feed/i.test(text)) {
    category = "Integration Failure";
  } else if (/access|permission|login|auth|role|security|password/i.test(text)) {
    category = "Security/Access";
  }

  const summary =
    input.description.length > 100
      ? input.description.substring(0, 100) + "..."
      : input.description;

  return {
    severity,
    category,
    summary,
    suggestedAction:
      "Review incident details and assign to appropriate team for investigation.",
    source: "fallback",
  };
}
