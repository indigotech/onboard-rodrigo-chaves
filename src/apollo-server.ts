import * as fs from 'fs';
import * as path from 'path';
import { ApolloServer } from 'apollo-server';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { resolvers } from './resolvers';
import { GraphQLError } from 'graphql';

function formatError(error: GraphQLError) {
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
