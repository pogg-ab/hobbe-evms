import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UserValidationService } from 'src/application/services/live-stream/user-validation.service';
import { kafkaProducerConfig } from 'src/infrastructure/kafka/kafka.config';
import { ClientsModule } from '@nestjs/microservices';

@Module({
  imports: [
    PassportModule,
    ClientsModule.register([
      {
        name: 'KAFKA_VALIDATE_USER_SERVICE',
        transport: kafkaProducerConfig.transport,
        options: kafkaProducerConfig.options,
      },
    ]),
    // We register the JwtModule so the JwtStrategy has access to the secret
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    UserValidationService,
    JwtStrategy, // Provide the strategy
  ],
  exports: [PassportModule],
})
export class AuthModule {}
