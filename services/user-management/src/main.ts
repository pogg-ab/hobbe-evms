import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as path from 'path';

// This is your existing, correct dotenv configuration.
dotenv.config({
  path: path.resolve(
    __dirname,
    '..',
    `.env.${process.env.NODE_ENV || 'development'}`,
  ),
});

// --- THIS IS THE DIAGNOSTIC TEST ---
// We are adding these console logs to see what the value of KAFKA_BROKER is
// at the exact moment it should be loaded.
console.log('--- STARTING DIAGNOSTIC LOG ---');
console.log(
  `Attempting to load .env file from: ${path.resolve(__dirname, '..', `.env.${process.env.NODE_ENV || 'development'}`)}`,
);
console.log(
  `Value of KAFKA_BROKER from process.env: ${process.env.KAFKA_BROKER}`,
);
console.log('--- ENDING DIAGNOSTIC LOG ---');
// --- END OF TEST ---

import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { kafkaConfig } from './infrastructure/kafka/kafka.config';
import { kafkaProducerConfig } from './infrastructure/kafka/kafka.producer.config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { corsConfig } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors(corsConfig);
  const config = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription('API for managing users')
    .setVersion('1.0')
    .addBearerAuth(
      {
        description: `Please enter the token`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe());

  app.connectMicroservice<MicroserviceOptions>(kafkaConfig);
  app.connectMicroservice<MicroserviceOptions>(kafkaProducerConfig);
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.startAllMicroservices();

  await app.listen(4000);
}

bootstrap();
