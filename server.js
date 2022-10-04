import { buildSchema } from 'graphql';
import { graphqlHTTP } from 'express-graphql';
import express from 'express';

const schema = buildSchema(`type Query {
    hello: String
}`);

const rootValue = {
    hello: () => {
        return 'Hello World';
    }
};

const app = express();

app.use('/graphql', graphqlHTTP({
    schema,
    rootValue,
    graphiql: true
}));

app.listen(4000, () => console.log('Running a GraphQL API Server at http://localhost:4000/graphql'));
