import { APIGatewayProxyHandler } from 'aws-lambda';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Client } from 'pg';

// Retrieve DB credentials from AWS Secrets Manager
const secretsClient = new SecretsManagerClient({
  region: 'us-east-2',
});
const secretArn = process.env.DB_SECRET_ARN || 'DemoDBCredentials'
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

async function getDbCredentials() {

  // Fetch from Secrets Manager only if any env var is missing
  if (!dbHost || !dbName || !dbUser || !dbPassword ) {
    console.log('Fetching DB credentials from Secrets Manager using ARN:', secretArn);
    const data = await secretsClient.send(new GetSecretValueCommand({ SecretId: secretArn }));
    if (!data.SecretString) throw new Error('No DB credentials found');
    return JSON.parse(data.SecretString);
  }

  return {
    host: dbHost,
    database: dbName,
    port: dbPort,
    username: dbUser,
    password: dbPassword,
  };
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { total } = JSON.parse(event.body || '{}');

  const dbCredentials = await getDbCredentials();

  const client = new Client({
    host: dbCredentials.host,
    database: dbCredentials.database,
    user: dbCredentials.username,
    password: dbCredentials.password,
    port: dbCredentials.port,
    ssl: { rejectUnauthorized: false }, // needed if using public access
  });


  try {
    await client.connect();
    const res = await client.query(
      'INSERT INTO orders (total, created_at) VALUES ($1, NOW()) RETURNING id',
      [total]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Order created', orderId: res.rows[0].id }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Database errors' };
  } finally {
    await client.end();
  }
};

