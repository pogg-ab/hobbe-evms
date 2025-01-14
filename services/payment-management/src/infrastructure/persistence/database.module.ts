// src/infrastructure/persistence/database.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: +configService.get('DB_PORT') || 5432,
        username: configService.get('DB_USERNAME') || 'postgres',
        password: configService.get('DB_PASSWORD') || 'root',
        database: configService.get('DB_NAME') || 'hobbe_db',
        entities: [__dirname + '/../../domain/entities/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/./migrations/*{.ts,.js}'],
        synchronize: true, // Be cautious with this in production
        logging: true, // Enable logging during development
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Event]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
