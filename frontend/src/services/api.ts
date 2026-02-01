import type {
  Incident,
  CreateIncidentInput,
  UpdateIncidentInput,
  ListIncidentsResponse,
  ApiError,
  Status,
  Severity,
  ErpModule,
} from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Custom error class for API errors
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string = "UNKNOWN_ERROR",
    public details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Unable to connect to the server. Please check if the backend is running and try again.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}

/**
 * Make an API request with error handling
 */
async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        throw new ApiRequestError(
          `Server error (${response.status})`,
          response.status,
          "SERVER_ERROR"
        );
      }
      throw new ApiRequestError(
        errorData.error.message,
        response.status,
        errorData.error.code,
        errorData.error.details
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    throw new ApiRequestError(
      getErrorMessage(error),
      0,
      "NETWORK_ERROR"
    );
  }
}

/**
 * List incidents with pagination and filters
 */
export async function listIncidents(params?: {
  status?: Status;
  severity?: Severity;
  module?: ErpModule;
  limit?: number;
  cursor?: string;
}): Promise<ListIncidentsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.severity) searchParams.set("severity", params.severity);
  if (params?.module) searchParams.set("module", params.module);
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.cursor) searchParams.set("cursor", params.cursor);

  const query = searchParams.toString();
  return request<ListIncidentsResponse>(
    `/incidents${query ? `?${query}` : ""}`
  );
}

/**
 * Get a single incident by ID
 */
export async function getIncident(id: string): Promise<Incident> {
  return request<Incident>(`/incidents/${id}`);
}

/**
 * Create a new incident
 */
export async function createIncident(
  input: CreateIncidentInput
): Promise<Incident> {
  return request<Incident>("/incidents", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Update an incident
 */
export async function updateIncident(
  id: string,
  input: UpdateIncidentInput
): Promise<Incident> {
  return request<Incident>(`/incidents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
