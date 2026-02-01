/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "erp-incident-triage",
      removal: input?.stage === "prod" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    await import("dotenv/config");
    // DynamoDB Table for incidents
    const table = new sst.aws.Dynamo("Incidents", {
      fields: {
        id: "string",
      },
      primaryIndex: {
        hashKey: "id",
      },
    });

    // API Gateway with CORS
    const api = new sst.aws.ApiGatewayV2("Api", {
      cors: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    // Lambda configuration
    const lambdaConfig = {
      handler: "src/api.handler",
      link: [table],
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
        TABLE_NAME: table.name,
      },
      timeout: "30 seconds" as const,
    };

    // API Routes
    api.route("GET /incidents", lambdaConfig);
    api.route("GET /incidents/{id}", lambdaConfig);
    api.route("POST /incidents", lambdaConfig);
    api.route("PATCH /incidents/{id}", lambdaConfig);

    return {
      api: api.url,
      table: table.name,
    };
  },
});
