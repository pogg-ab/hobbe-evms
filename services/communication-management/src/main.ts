import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { kafkaConsumerConfig } from './infrastructure/kafka/kafka.consumer.config';


import { IoAdapter } from '@nestjs/platform-socket.io';


export class CustomSocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });
    return server;
  }
}

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Communication Management API')
    .setDescription('API for managing communication')
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

  app.connectMicroservice<MicroserviceOptions>(kafkaConsumerConfig);
  await app.startAllMicroservices();
  app.enableCors();

  
  app.useWebSocketAdapter(new CustomSocketIoAdapter(app));

  await app.listen(4003);
}
bootstrap();