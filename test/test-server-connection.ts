import axios from 'axios';

export const connection = axios.create({ baseURL: `http://localhost:${process.env.APOLLO_SERVER_PORT}` });
