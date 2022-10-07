import * as dotenv from 'dotenv';
dotenv.config({ path: `${__dirname}/../.env` });

import { AppDataSource } from './data-source';
import { initApolloServer } from './apollo-server';

AppDataSource.initialize()
  .then(initApolloServer)
  .catch((error) => console.log(error));
