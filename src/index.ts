import { AppDataSource } from './data-source';
import { initApolloServer } from './apolloServer';

AppDataSource.initialize()
  .then(initApolloServer)
  .catch((error) => console.log(error));
