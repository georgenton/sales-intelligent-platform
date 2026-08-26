import 'reflect-metadata';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/http/api-exception.filter';
import { environment } from './config/environment';

async function bootstrap(): Promise<void> {
  const config = environment();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: true });
  // Railway is the only network hop directly in front of this process. Trusting
  // exactly one proxy makes Express use Railway's client IP for audit logs and
  // throttling without trusting an arbitrary left-most X-Forwarded-For value.
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: config.NODE_ENV === 'production' }));
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: false,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableCors({
    origin: config.APP_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  const swagger = new DocumentBuilder()
    .setTitle('Sales Intelligence Platform API')
    .setDescription('Multitenant sales intelligence REST API')
    .setVersion('0.1.0')
    .addCookieAuth('sip_session')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));

  await app.listen(config.PORT, '0.0.0.0');
}

void bootstrap();
