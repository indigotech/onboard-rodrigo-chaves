import * as fs from 'fs';
import * as path from 'path';
import { ApolloServer } from 'apollo-server';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { resolvers } from './resolvers';
import { GraphQLError } from 'graphql';
import { PasswordInvalidError } from './errors/PasswordInvalidError';
import { ExistentEmailError } from './errors/ExistentEmailError';

function formatError(error: GraphQLError) {
  const errorMsg = error.originalError.message;

  if (errorMsg.startsWith('Password')) {
    return new PasswordInvalidError(errorMsg);
  }

  if (errorMsg.startsWith('There is already')) {
    return new ExistentEmailError(errorMsg);
  }

  return error;
}

export async function initApolloServer() {
  const server = new ApolloServer({
    typeDefs: fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8'),
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    formatError,
  });

  const serverInfo = await server.listen({ port: process.env.APOLLO_SERVER_PORT || 4000 });
  console.log(`🚀  Server ready at ${serverInfo.url}`);
}
