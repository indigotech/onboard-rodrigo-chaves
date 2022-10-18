import * as dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/.test.env` });

import { AppDataSource } from '../src/data-source';
import { populateDatabase } from './populate-database';

async function initServer() {
  await AppDataSource.initialize();
  await populateDatabase();
}

initServer();
