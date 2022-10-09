import * as fs from 'fs';
import { ApolloServer } from 'apollo-server';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { resolvers } from './resolvers';
import { GraphQLError } from 'graphql';
import { ConflictError } from './errors/conflict.error';
import { BadRequestError } from './errors/bad-request.error';
import { NotFoundError } from './errors/not-found.error';
import { UnauthorizedError } from './errors/unauthorized.error';

function formatError(error: GraphQLError) {
  const errorObj = {
    message: '',
    code: 0,
    details: '',
  };

  if (
    error.originalError instanceof ConflictError ||
    error.originalError instanceof BadRequestError ||
    error.originalError instanceof NotFoundError ||
    error.originalError instanceof UnauthorizedError
  ) {
    errorObj.message = error.message;
    errorObj.code = error.originalError.code;

    return errorObj;
  }

  errorObj.message = 'Internal server error, please try again';
  errorObj.code = 500;
  errorObj.details = error.message;

  return errorObj;
}

export async function initApolloServer() {
  const server = new ApolloServer({
    typeDefs: fs.readFileSync(`${process.cwd()}/src/schema.graphql`, 'utf8'),
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    formatError,
  });

  const serverInfo = await server.listen({ port: process.env.APOLLO_SERVER_PORT || 4000 });
  console.log(`🚀  Server ready at ${serverInfo.url}`);
}
