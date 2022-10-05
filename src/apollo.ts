import { ApolloServer, gql } from 'apollo-server';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

interface UserInput {
  id?: number;
  name: string;
  email: string;
  password: string;
  birthdate: string;
}

const typeDefs = gql`
  type Query {
    users: [User]
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!, birthdate: String!): User!
  }

  type User {
    id: String!
    name: String!
    email: String!
    password: String!
    birthdate: String!
  }
`;

const users: UserInput[] = [
  { id: 0, name: 'Rodrigo', email: 'rodrigo.chaves@email.com', password: 'MinhaSenha', birthdate: '01-01-1980' },
];

const resolvers = {
  Query: {
    users: () => users,
  },
  Mutation: {
    createUser: (parent: any, args: UserInput) => {
      const newUser = {
        id: users.length++,
        name: args.name,
        email: args.email,
        password: args.password,
        birthdate: args.birthdate,
      };

      users.push(newUser);

      return newUser;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: 'bounded',
  plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
