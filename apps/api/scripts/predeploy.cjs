'use strict';

const { spawnSync } = require('node:child_process');

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function run(command, args, env) {
  const result = spawnSync(command, args, { env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const migrationUrl = required('MIGRATION_DATABASE_URL');
const migrationEnvironment = { ...process.env, DATABASE_URL: migrationUrl };

run(
  process.execPath,
  [
    '/app/node_modules/prisma/build/index.js',
    'migrate',
    'deploy',
    '--schema',
    '/app/prisma/schema.prisma',
  ],
  migrationEnvironment,
);
run(process.execPath, ['/app/dist/scripts/provision-runtime-role.js'], migrationEnvironment);
