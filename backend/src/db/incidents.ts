import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { db, getTableName } from "./connection";
import { generateIncidentId } from "../utils";
import { NotFoundError } from "../errors";
import type {
  Incident,
  CreateIncidentInput,
  UpdateIncidentInput,
  EnrichmentResult,
  ListIncidentsQuery,
  ListIncidentsResponse,
} from "../types";

export async function createIncident(
  input: CreateIncidentInput,
  enrichment: EnrichmentResult
): Promise<Incident> {
  const now = new Date().toISOString();
  const incident: Incident = {
    id: generateIncidentId(),
    ...input,
    status: "Open",
    severity: enrichment.severity,
    category: enrichment.category,
    summary: enrichment.summary,
    suggestedAction: enrichment.suggestedAction,
    enrichmentSource: enrichment.source,
    createdAt: now,
    updatedAt: now,
  };

  await db.send(
    new PutCommand({
      TableName: getTableName(),
      Item: incident,
    })
  );

  return incident;
}

export async function getIncidentById(id: string): Promise<Incident> {
  const result = await db.send(
    new GetCommand({
      TableName: getTableName(),
      Key: { id },
    })
  );

  if (!result.Item) {
    throw new NotFoundError("Incident", id);
  }

  return result.Item as Incident;
}

export async function listIncidents(
  query: ListIncidentsQuery
): Promise<ListIncidentsResponse> {
  const { status, severity, module, limit = 10, cursor } = query;

  const filterExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  if (status) {
    filterExpressions.push("#status = :status");
    expressionAttributeNames["#status"] = "status";
    expressionAttributeValues[":status"] = status;
  }

  if (severity) {
    filterExpressions.push("#severity = :severity");
    expressionAttributeNames["#severity"] = "severity";
    expressionAttributeValues[":severity"] = severity;
  }

  if (module) {
    filterExpressions.push("#erpModule = :erpModule");
    expressionAttributeNames["#erpModule"] = "erpModule";
    expressionAttributeValues[":erpModule"] = module;
  }

  let exclusiveStartKey: Record<string, unknown> | undefined;
  if (cursor) {
    try {
      exclusiveStartKey = JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
    } catch {
      // Invalid cursor, ignore
    }
  }

  const scanParams: {
    TableName: string;
    Limit: number;
    FilterExpression?: string;
    ExpressionAttributeNames?: Record<string, string>;
    ExpressionAttributeValues?: Record<string, unknown>;
    ExclusiveStartKey?: Record<string, unknown>;
  } = {
    TableName: getTableName(),
    Limit: limit + 1,
  };

  if (filterExpressions.length > 0) {
    scanParams.FilterExpression = filterExpressions.join(" AND ");
    scanParams.ExpressionAttributeNames = expressionAttributeNames;
    scanParams.ExpressionAttributeValues = expressionAttributeValues;
  }

  if (exclusiveStartKey) {
    scanParams.ExclusiveStartKey = exclusiveStartKey;
  }

  const result = await db.send(new ScanCommand(scanParams));

  let items = (result.Items || []) as Incident[];

  // Sort by createdAt descending (newest first)
  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const hasMore = items.length > limit;
  if (hasMore) {
    items = items.slice(0, limit);
  }

  let nextCursor: string | undefined;
  if (hasMore && result.LastEvaluatedKey) {
    nextCursor = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64");
  }

  const countResult = await db.send(
    new ScanCommand({
      TableName: getTableName(),
      Select: "COUNT",
      ...(filterExpressions.length > 0 && {
        FilterExpression: filterExpressions.join(" AND "),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      }),
    })
  );

  return {
    items,
    total: countResult.Count || 0,
    nextCursor,
    hasMore,
  };
}

export async function updateIncident(
  id: string,
  input: UpdateIncidentInput
): Promise<Incident> {
  await getIncidentById(id);

  const now = new Date().toISOString();
  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": now,
  };

  if (input.status !== undefined) {
    updateExpressions.push("#status = :status");
    expressionAttributeNames["#status"] = "status";
    expressionAttributeValues[":status"] = input.status;
  }

  const result = await db.send(
    new UpdateCommand({
      TableName: getTableName(),
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as Incident;
}
