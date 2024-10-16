// src/infrastructure/persistence/app-data-source.ts
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
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
});
