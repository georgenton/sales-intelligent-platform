import 'dotenv/config';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ImportsService } from './imports.service';

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const fileArgument = argument('--file');
  const mappingArgument = argument('--mapping');
  const tenantSlug = argument('--tenant');
  const asOfDate = argument('--as-of');
  const dryRun = process.argv.includes('--dry-run');
  if (!fileArgument || !tenantSlug) {
    throw new Error(
      'Usage: import:excel -- --file <path> --tenant <slug> [--mapping <json-path>] [--as-of YYYY-MM-DD] [--dry-run]',
    );
  }
  const filePath = path.resolve(process.env.INIT_CWD ?? process.cwd(), fileArgument);
  const [buffer, fileStats] = await Promise.all([readFile(filePath), stat(filePath)]);
  const file = {
    originalname: path.basename(filePath),
    mimetype:
      path.extname(filePath).toLowerCase() === '.csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: fileStats.size,
    buffer,
  };
  const prisma = new PrismaService();
  await prisma.$connect();
  try {
    const imports = new ImportsService(prisma);
    const mapping = mappingArgument
      ? await readFile(path.resolve(process.env.INIT_CWD ?? process.cwd(), mappingArgument), 'utf8')
      : undefined;
    if (dryRun && !mapping) {
      console.log(JSON.stringify(await imports.analyze(file)));
      return;
    }
    if (dryRun) {
      console.log(JSON.stringify(await imports.validate(file, { mapping, asOfDate })));
      return;
    }
    if (!mapping) throw new Error('--mapping is required before an import can execute');
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new Error('Tenant not found');
    const operator = await prisma.tenantMembership.findFirst({
      where: {
        tenantId: tenant.id,
        status: 'ACTIVE',
        role: { in: ['TENANT_ADMIN', 'PLATFORM_ADMIN'] },
      },
    });
    if (!operator) throw new Error('Tenant import operator not found');
    const result = await imports.execute(
      file,
      { mapping, asOfDate },
      {
        userId: operator.userId,
        activeTenantId: tenant.id,
        membershipId: operator.id,
        role: operator.role,
        permissions: new Set(['imports.manage']),
        sessionId: '00000000-0000-4000-8000-000000000000',
        csrfTokenHash: '',
      },
      'operator-cli',
    );
    console.log(JSON.stringify(result));
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Import failed');
  process.exitCode = 1;
});
