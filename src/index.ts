import * as dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/.env` });

import { AppDataSource } from './data-source';
import { initApolloServer } from './apollo-server';

AppDataSource.initialize()
  .then(initApolloServer)
  .catch((error) => console.log(error));
