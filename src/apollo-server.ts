import * as fs from 'fs';
import { ApolloServer } from 'apollo-server';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { resolvers } from './resolvers';
import { GraphQLError } from 'graphql';
import { BackEndError } from './errors/backed-end.error';
import { verifyToken } from './jwt-utils';

function context({ req }) {
  const token = req.headers.authorization || '';
  const user = verifyToken(token);

  return { user: user?.payload };
}

function formatError(error: GraphQLError) {
  const errorObj = {
    message: '',
    code: 0,
    details: '',
  };

  if (error.originalError instanceof BackEndError) {
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
    context,
  });

  const serverInfo = await server.listen({ port: process.env.APOLLO_SERVER_PORT || 4000 });
  console.log(`🚀  Server ready at ${serverInfo.url}`);
}
