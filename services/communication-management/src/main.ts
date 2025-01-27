import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { kafkaProducerConfig } from './infrastructure/kafka/kafka.config';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Communication Management API')
    .setDescription('API for managing communication')
    .setVersion('1.0')
    .addTag('Communications')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.connectMicroservice<MicroserviceOptions>(kafkaProducerConfig);
  await app.startAllMicroservices();
  app.enableCors();

  await app.listen(4003);
}
bootstrap();
