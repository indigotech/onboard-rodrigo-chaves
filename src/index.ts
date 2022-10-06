import { AppDataSource } from './data-source';
import { initApolloServer } from './apollo-server';

AppDataSource.initialize()
  .then(initApolloServer)
  .catch((error) => console.log(error));
