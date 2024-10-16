import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

const configService = new ConfigService();

const dbHost = configService.get('DB_HOST') || 'localhost';
const dbPort = +configService.get('DB_PORT') || 5432;
const dbUsername = configService.get('DB_USERNAME') || 'postgres';
const dbPassword = String(configService.get('DB_PASSWORD') || '669357');
const dbName = configService.get('DB_NAME') || 'hobbe_evms_db';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbHost,
  port: dbPort,
  username: dbUsername,
  password: dbPassword,
  database: dbName,
  entities: [__dirname + '/../../domain/entities/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/./migrations/*{.ts,.js}'],
  synchronize: true, // Be cautious with this in production
  logging: true, // Enable logging during development
});
