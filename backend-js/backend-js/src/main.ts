import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase body size limits (for files / payloads)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // --------------------------------------------------
  console.log('Allowed Origins:', [
    'https://medblock-app-provider.web.app',
    'https://medblock-app-patient.web.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
  ]);

  const allowedOrigins = [
    'https://medblock-app-provider.web.app',
    'https://medblock-app-patient.web.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
  ];

  if (process.env.CORS_ORIGIN) {
    const envOrigins = process.env.CORS_ORIGIN.split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);
    allowedOrigins.push(...envOrigins);
  }

  app.enableCors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        console.log(`Blocked CORS for origin: ${requestOrigin}`);
        callback(null, false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    optionsSuccessStatus: 200,
  });

  // --------------------------------------------------
  // GLOBAL VALIDATION
  // --------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // --------------------------------------------------
  // GLOBAL API PREFIX
  // --------------------------------------------------
  app.setGlobalPrefix('api');

  // --------------------------------------------------
  // SWAGGER
  // --------------------------------------------------
  const config = new DocumentBuilder()
    .setTitle('MEDBLOCK API')
    .setDescription("Nigeria's Blockchain-Secured National EMR Infrastructure")
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // --------------------------------------------------
  // SERVER
  // --------------------------------------------------
  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 MEDBLOCK API running on port ${port}`);
  console.log(`📘 Swagger → /api/docs`);
}

bootstrap();
