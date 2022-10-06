import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from './data-source';
import { ApolloServer } from 'apollo-server';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { User } from './entity/User';

interface UserInput {
  id?: number;
  name: string;
  email: string;
  password: string;
  birthdate: string;
}

export async function initApolloServer() {
  const resolvers = {
    Query: {
      users: () => AppDataSource.manager.getRepository('user').createQueryBuilder('user').getMany(),
    },
    Mutation: {
      createUser: async (parent: any, args: UserInput) => {
        const newUser = new User();

        Object.assign(newUser, {
          name: args.name,
          email: args.email,
          password: args.password,
          birthdate: args.birthdate,
        });

        await AppDataSource.manager.save(newUser);

        return newUser;
      },
    },
  };

  const server = new ApolloServer({
    typeDefs: fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8'),
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
  });

  const serverInfo = await server.listen();
  console.log(`🚀  Server ready at ${serverInfo.url}`);
}
