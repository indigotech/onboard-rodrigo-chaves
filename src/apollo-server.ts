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

function getUsers() {
  return AppDataSource.manager.getRepository('user').find();
}

async function validateInputs(args: { input: UserInput }) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  if (!passwordRegex.test(args.input.password)) {
    throw new Error('Password must be at least 6 characters long, have at least 1 letter and 1 digit.');
  }

  const existentUserWithEmail = await AppDataSource.manager
    .getRepository('user')
    .findOneBy({ email: args.input.email });

  if (existentUserWithEmail) {
    throw new Error(`There is already a user registered with this email: ${args.input.email}.`);
  }
}

async function createUser(parent: any, args: { input: UserInput }) {
  await validateInputs(args);

  const newUser = new User();

  Object.assign(newUser, {
    name: args.input.name,
    email: args.input.email,
    password: args.input.password,
    birthdate: args.input.birthdate,
  });

  await AppDataSource.manager.save(newUser);

  return newUser;
}

export async function initApolloServer() {
  const resolvers = {
    Query: {
      users: getUsers,
    },
    Mutation: {
      createUser,
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
