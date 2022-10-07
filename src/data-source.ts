import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import * as dotenv from 'dotenv';

<<<<<<< HEAD
dotenv.config({ path: `${process.cwd()}/.env` });

const env = process.env;
=======
dotenv.config({ path: `${__dirname}/../.env` });

const env = process.env;
const isLocalEnv = env.TEST;
>>>>>>> 4bd879e (Added axios testing to see if server and database are online.)

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
<<<<<<< HEAD
  port: Number(env.POSTGRES_PORT),
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
=======
  port: isLocalEnv ? Number(env.POSTGRES_PORT_LOCAL) : Number(env.POSTGRES_PORT_TEST),
  username: isLocalEnv ? env.POSTGRES_USER_LOCAL : env.POSTGRES_USER_TEST,
  password: isLocalEnv ? env.POSTGRES_PASSWORD_LOCAL : env.POSTGRES_PASSWORD_TEST,
  database: isLocalEnv ? env.POSTGRES_DB_LOCAL : env.POSTGRES_DB_TEST,
>>>>>>> 4bd879e (Added axios testing to see if server and database are online.)
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
