import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "ap-south-1" }); // Mumbai!

export async function getSecrets() {
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: "codesikho/production" })
  );
  return JSON.parse(response.SecretString);
}