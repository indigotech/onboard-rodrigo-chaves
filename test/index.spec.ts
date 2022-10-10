import axios from 'axios';
import { expect } from 'chai';
import { initApolloServer } from '../src/apollo-server';
import { AppDataSource } from '../src/data-source';

before(async () => {
  await AppDataSource.initialize();
  await initApolloServer();
});

describe('Axios Test', () => {
  it('Should bring users from database if server is online', async () => {
    const query = `query User{
      users{id, name, email, birthdate}
    }`;

    const connection = axios.create({ baseURL: `http://localhost:${process.env.APOLLO_SERVER_PORT}` });

    const result = await connection.post('/graphql', { query });
    expect(result.data.data.users.length).to.be.eq(5);
  });
});
