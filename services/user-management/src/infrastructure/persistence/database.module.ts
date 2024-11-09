// src/infrastructure/persistence/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/../../domain/entities/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/./migrations/*{.ts,.js}'],
      synchronize: true, // Be cautious with this in production
      logging: true, // Enable logging during development
    }),
    TypeOrmModule.forFeature([PersonalAccount]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
