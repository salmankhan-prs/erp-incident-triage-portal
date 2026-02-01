import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/aws-lambda";
import {
  createIncidentSchema,
  updateIncidentSchema,
  listIncidentsQuerySchema,
} from "./schemas";
import {
  createIncident,
  getIncidentById,
  listIncidents,
  updateIncident,
} from "./db";
import { enrichIncident } from "./enrichment";
import { AppError, ValidationError, formatZodErrors } from "./errors";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.onError((err, c) => {
  console.error("Error:", err);

  if (err instanceof AppError) {
    return c.json(err.toResponse(), err.statusCode as 400 | 404 | 500);
  }

  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
    },
    500
  );
});

app.get("/", (c) => {
  return c.json({ status: "ok", service: "ERP Incident Triage API" });
});

app.post("/incidents", async (c) => {
  const body = await c.req.json();
  const validation = createIncidentSchema.safeParse(body);

  if (!validation.success) {
    throw new ValidationError(formatZodErrors(validation.error.errors));
  }

  const enrichment = await enrichIncident(validation.data);
  const incident = await createIncident(validation.data, enrichment);

  return c.json(incident, 201);
});

app.get("/incidents", async (c) => {
  const query = {
    status: c.req.query("status"),
    severity: c.req.query("severity"),
    module: c.req.query("module"),
    limit: c.req.query("limit"),
    cursor: c.req.query("cursor"),
  };

  const cleanQuery = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined)
  );

  const validation = listIncidentsQuerySchema.safeParse(cleanQuery);

  if (!validation.success) {
    throw new ValidationError(formatZodErrors(validation.error.errors));
  }

  const result = await listIncidents(validation.data);
  return c.json(result);
});

app.get("/incidents/:id", async (c) => {
  const id = c.req.param("id");
  const incident = await getIncidentById(id);
  return c.json(incident);
});

app.patch("/incidents/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const validation = updateIncidentSchema.safeParse(body);

  if (!validation.success) {
    throw new ValidationError(formatZodErrors(validation.error.errors));
  }

  const incident = await updateIncident(id, validation.data);
  return c.json(incident);
});

export { app };
export const handler = handle(app);
