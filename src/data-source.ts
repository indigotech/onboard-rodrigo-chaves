import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/../.env` });

const env = process.env;
const isLocalEnv = env.TEST;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: isLocalEnv ? Number(env.POSTGRES_PORT_LOCAL) : Number(env.POSTGRES_PORT_TEST),
  username: isLocalEnv ? env.POSTGRES_USER_LOCAL : env.POSTGRES_USER_TEST,
  password: isLocalEnv ? env.POSTGRES_PASSWORD_LOCAL : env.POSTGRES_PASSWORD_TEST,
  database: isLocalEnv ? env.POSTGRES_DB_LOCAL : env.POSTGRES_DB_TEST,
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
