import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const isLocal = process.env.LOCAL === "true";

const client = new DynamoDBClient(
  isLocal
    ? {
        endpoint: "http://localhost:8000",
        region: "local",
        credentials: {
          accessKeyId: "local",
          secretAccessKey: "local",
        },
      }
    : {}
);

export const db = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const getTableName = (): string => {
  return isLocal ? "incidents" : (process.env.TABLE_NAME || "incidents");
};
