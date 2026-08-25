import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(168).default(8),
  APP_URL: z.string().url().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  AI_PROVIDER: z.enum(['mock', 'openai']).default('mock'),
  AI_MODEL: z.string().min(1).default('gpt-5-mini'),
  OPENAI_API_KEY: z.string().min(1).optional(),
});

export type Environment = z.infer<typeof environmentSchema>;

let cached: Environment | undefined;

export function environment(): Environment {
  cached ??= environmentSchema.parse(process.env);
  return cached;
}
