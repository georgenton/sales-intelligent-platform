import { URL } from 'node:url';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/http/api-exception.filter';
import { hashToken } from '../src/modules/auth/auth.service';
import { InMemoryMailProvider } from '../src/modules/mail/in-memory-mail.provider';

const prisma = new PrismaClient();

describe('local password recovery', () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;
  let mail: InMemoryMailProvider;
  let userId = '';
  const email = `recovery-${Date.now()}@example.test`;
  const oldPassword = 'Recovery-Old-2026!';
  const newPassword = 'Recovery-New-2026!';

  beforeAll(async () => {
    const tenant = await prisma.tenant.findUniqueOrThrow({
      where: { slug: 'tech-distribution-demo' },
    });
    const user = await prisma.user.create({
      data: {
        name: 'Recovery Test User',
        email,
        localCredential: {
          create: {
            passwordHash: await argon2.hash(oldPassword, { type: argon2.argon2id }),
          },
        },
        memberships: {
          create: { tenantId: tenant.id, role: 'SELLER', status: 'ACTIVE' },
        },
      },
    });
    userId = user.id;
    app = await createTestApp();
    mail = app.get(InMemoryMailProvider);
    mail.clear();
  });

  afterAll(async () => {
    await app.close();
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('returns the same generic response for an unknown email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: 'unknown-recovery@example.test' })
      .expect(200);
    expect(response.body).toEqual({ accepted: true });
    expect(mail.passwordResetMessages).toHaveLength(0);
  });

  it('rejects an expired one-time token', async () => {
    await request(app.getHttpServer()).post('/auth/forgot-password').send({ email }).expect(200);
    const token = tokenFromLatestMessage(mail);
    await prisma.passwordResetToken.update({
      where: { tokenHash: hashToken(token) },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token, newPassword })
      .expect(400);
  });

  it('resets once, revokes sessions, rejects the old password and accepts the new password', async () => {
    const oldSession = request.agent(app.getHttpServer());
    await oldSession.post('/auth/login').send({ email, password: oldPassword }).expect(200);
    await request(app.getHttpServer()).post('/auth/forgot-password').send({ email }).expect(200);
    const token = tokenFromLatestMessage(mail);
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token, newPassword })
      .expect(200, { reset: true });
    await oldSession.get('/auth/me').expect(401);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: oldPassword })
      .expect(401);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: newPassword })
      .expect(200);
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token, newPassword: 'Another-New-2026!' })
      .expect(400);
  });

  it('rate limits repeated reset requests', async () => {
    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: 'rate-limit@example.test' })
      .expect(429);
  });
});

function tokenFromLatestMessage(mail: InMemoryMailProvider): string {
  const message = mail.passwordResetMessages.at(-1);
  if (!message) throw new Error('Expected a password reset message');
  const token = new URL(message.resetUrl).searchParams.get('token');
  if (!token) throw new Error('Expected a password reset token');
  return token;
}

async function createTestApp() {
  const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = module.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  await app.init();
  return app;
}
