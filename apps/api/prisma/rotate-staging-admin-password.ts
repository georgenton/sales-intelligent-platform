import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import {
  assertStagingRotationTarget,
  rotationDatabaseUrl,
  rotateStagingAdminPassword,
  validateNewPassword,
} from './staging-password-rotation';

async function readStandardInput(): Promise<string> {
  process.stdin.setEncoding('utf8');
  let value = '';
  for await (const chunk of process.stdin) value += chunk;
  return value.replace(/\r?\n$/u, '');
}

async function passwordInput(): Promise<string> {
  const fromStandardInput = process.argv.includes('--password-stdin');
  const fromEnvironment = process.argv.includes('--password-env');
  if (fromStandardInput === fromEnvironment) {
    throw new Error('Select exactly one password source: --password-stdin or --password-env');
  }

  const password = fromStandardInput
    ? await readStandardInput()
    : process.env.STAGING_ADMIN_PASSWORD;
  if (!password) throw new Error('The new staging password was not provided');
  validateNewPassword(password);
  return password;
}

async function main(): Promise<void> {
  assertStagingRotationTarget(process.env, process.argv.slice(2));
  const password = await passwordInput();
  const prisma = new PrismaClient({
    datasources: { db: { url: rotationDatabaseUrl(process.env) } },
  });

  try {
    const result = await rotateStagingAdminPassword(prisma, password);
    console.log(JSON.stringify({ status: 'rotated', revokedSessions: result.revokedSessions }));
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Staging password rotation failed');
  process.exitCode = 1;
});
