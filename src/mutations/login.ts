import { User } from '../entity/User';

export function login(parent: any, args: { input: { email: string; password: string } }) {
  const loggedUser = new User();

  Object.assign(loggedUser, {
    id: 12,
    name: 'Rodrigo',
    email: 'rodrigo@email.com',
    birthdate: '01-01-1980',
  });

  return { user: loggedUser, token: 'the_token' };
}
