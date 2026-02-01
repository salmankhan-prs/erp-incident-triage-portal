import { serve } from "@hono/node-server";
import { app } from "./api";

// Ensure we're in local mode
process.env.LOCAL = "true";

const port = parseInt(process.env.PORT || "3001", 10);

console.log(`
╔═══════════════════════════════════════════════════════╗
║     ERP Incident Triage API - Local Development       ║
╠═══════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${port}              ║
║  DynamoDB Local:    http://localhost:8000             ║
║                                                       ║
║  Endpoints:                                           ║
║    GET    /              Health check                 ║
║    POST   /incidents     Create incident              ║
║    GET    /incidents     List incidents               ║
║    GET    /incidents/:id Get incident                 ║
║    PATCH  /incidents/:id Update incident              ║
╚═══════════════════════════════════════════════════════╝
`);

serve({
  fetch: app.fetch,
  port,
});
