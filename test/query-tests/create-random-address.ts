import { faker } from '@faker-js/faker';
import { Address } from '../../src/entity/Address';
import { User } from '../../src/entity/User';

export function createRandomAddress(user: User) {
  const address = new Address();
  address.cep = faker.address.zipCode();
  address.street = faker.address.street();
  address.streetNumber = faker.address.buildingNumber();
  address.complement = faker.address.secondaryAddress();
  address.neighborhood = faker.address.county();
  address.city = faker.address.cityName();
  address.state = faker.address.state();
  address.user = user;

  return address;
}
