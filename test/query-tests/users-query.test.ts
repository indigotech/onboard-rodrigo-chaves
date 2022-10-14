import { expect } from 'chai';
import { AxiosInstance } from 'axios';
import { queryUser } from '../queries';
import { UserInput } from '../inputs/user-input';

export function userQueryTest(connection: AxiosInstance) {
  describe('Users Query Test', () => {
    it('Should bring number of users from database if server is online', async () => {
      const result = (await queryUser(connection)).data.users as UserInput[];
      expect(result.length).to.be.gt(0);
    });
  });
}
