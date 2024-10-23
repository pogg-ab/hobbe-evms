// src/infrastructure/persistence/app-data-source.ts
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '669357',
  database: process.env.DB_NAME || 'hobbe_evms_db',
  entities: [__dirname + '/../../domain/entities/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/./migrations/*{.ts,.js}'],
  synchronize: true, // Be cautious with this in production
  logging: true, // Enable logging during development
});
