import * as bcrypt from 'bcrypt';

function encryptPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

function comparePassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export { encryptPassword, comparePassword };
