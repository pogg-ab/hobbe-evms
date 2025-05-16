import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
dotenv.config();

import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { kafkaConfig } from './infrastructure/kafka/kafka.config';
import { kafkaProducerConfig } from './infrastructure/kafka/kafka.producer.config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ credentials: true, origin: true, });
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
        in: 'Header'
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
