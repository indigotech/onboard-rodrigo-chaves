import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Address } from './entity/Address';
import { User } from './entity/User';

const env = process.env;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: Number(env.POSTGRES_PORT),
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
  synchronize: true,
  logging: false,
  entities: [User, Address],
  migrations: [],
  subscribers: [],
});
