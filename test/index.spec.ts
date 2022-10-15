import * as dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/.test.env` });

import { initApolloServer } from '../src/apollo-server';
import { AppDataSource } from '../src/data-source';

before(async () => {
  await AppDataSource.initialize();
  await initApolloServer();
});

require('./query-tests/user-query.test.ts');
require('./query-tests/users-query.test.ts');
require('./mutation-tests/create-user-mutation.test.ts');
require('./mutation-tests/login-mutation.test.ts');
