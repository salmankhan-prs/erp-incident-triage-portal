import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";

/**
 * Script to create the DynamoDB table for local development
 */
async function setupLocalDatabase() {
  const client = new DynamoDBClient({
    endpoint: "http://localhost:8000",
    region: "local",
    credentials: {
      accessKeyId: "local",
      secretAccessKey: "local",
    },
  });

  const tableName = "incidents";

  // Check if table already exists
  try {
    await client.send(
      new DescribeTableCommand({
        TableName: tableName,
      })
    );
    console.log(`✓ Table '${tableName}' already exists`);
    return;
  } catch (error) {
    const err = error as Error;
    if (err.name !== "ResourceNotFoundException") {
      throw error;
    }
  }

  // Create the table
  console.log(`Creating table '${tableName}'...`);

  await client.send(
    new CreateTableCommand({
      TableName: tableName,
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
      ],
      BillingMode: "PAY_PER_REQUEST",
    })
  );

  console.log(`✓ Table '${tableName}' created successfully`);
}

setupLocalDatabase()
  .then(() => {
    console.log("\n✓ Database setup complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Database setup failed:", error);
    process.exit(1);
  });
