import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions } from '@nestjs/microservices';
import { kafkaProducerConfig } from './infrastructure/kafka/kafka.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Communication Microservice API Documentation')
    .setDescription('API documentation for paymeny microservice')
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
