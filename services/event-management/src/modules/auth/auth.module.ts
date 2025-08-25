import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config'; // Import ConfigService for use in the factory
import { AdminJwtStrategy } from './admin-jwt.strategy';

@Module({
  imports: [
    PassportModule,
    // We use registerAsync to ensure ConfigService is ready before the JWT module is configured.
    JwtModule.registerAsync({
      // We don't need to import ConfigModule here anymore because it's global
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Use the correct variable name
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AdminJwtStrategy],
  exports: [PassportModule],
})
export class AuthModule {}