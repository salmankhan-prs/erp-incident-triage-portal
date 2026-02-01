import type { ApiError } from "./types";

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "AppError";
  }

  toResponse(): ApiError {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super("NOT_FOUND", `${resource} with id '${id}' not found`, 404);
  }
}

/**
 * Validation error with field-level details
 */
export class ValidationError extends AppError {
  constructor(details: Array<{ field: string; message: string }>) {
    super("VALIDATION_ERROR", "Validation failed", 400, details);
  }
}

/**
 * Internal server error
 */
export class InternalError extends AppError {
  constructor(message: string = "Internal server error") {
    super("INTERNAL_ERROR", message, 500);
  }
}

/**
 * Format Zod validation errors into our standard format
 */
export function formatZodErrors(
  errors: Array<{ path: (string | number)[]; message: string }>
): Array<{ field: string; message: string }> {
  return errors.map((err) => ({
    field: err.path.join(".") || "body",
    message: err.message,
  }));
}
