import { z } from 'zod';

const environmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    APP_ENV: z.enum(['local', 'staging', 'production']).default('local'),
    PORT: z.coerce.number().int().positive().max(65535).default(4000),
    DATABASE_URL: z.string().url().startsWith('postgresql://'),
    MIGRATION_DATABASE_URL: z.string().url().startsWith('postgresql://').optional(),
    RUNTIME_DATABASE_USER: z
      .string()
      .regex(/^[a-z][a-z0-9_]{2,62}$/)
      .optional(),
    SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(168).default(8),
    APP_URL: z.string().url().default('http://localhost:3000'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    AI_PROVIDER: z.enum(['mock', 'openai']).default('mock'),
    AI_MODEL: z.string().min(1).default('gpt-5-mini'),
    OPENAI_API_KEY: z.string().min(1).optional(),
  })
  .superRefine((value, context) => {
    if (value.APP_ENV === 'local') return;

    if (new URL(value.APP_URL).protocol !== 'https:') {
      context.addIssue({
        code: 'custom',
        path: ['APP_URL'],
        message: 'Hosted APP_URL must use HTTPS',
      });
    }
    const runtimeUsername = decodeURIComponent(new URL(value.DATABASE_URL).username);
    if (!value.RUNTIME_DATABASE_USER || runtimeUsername !== value.RUNTIME_DATABASE_USER) {
      context.addIssue({
        code: 'custom',
        path: ['DATABASE_URL'],
        message: 'Hosted DATABASE_URL must use RUNTIME_DATABASE_USER',
      });
    }
    if (value.MIGRATION_DATABASE_URL) {
      const migrationUsername = decodeURIComponent(new URL(value.MIGRATION_DATABASE_URL).username);
      if (
        value.DATABASE_URL === value.MIGRATION_DATABASE_URL ||
        migrationUsername === runtimeUsername
      ) {
        context.addIssue({
          code: 'custom',
          path: ['MIGRATION_DATABASE_URL'],
          message: 'Migration and runtime database credentials must be separate',
        });
      }
    }
  });

export type Environment = z.infer<typeof environmentSchema>;

let cached: Environment | undefined;

export function environment(): Environment {
  cached ??= environmentSchema.parse(process.env);
  return cached;
}
