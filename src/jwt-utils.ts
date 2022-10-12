import jwt, { Secret } from 'jsonwebtoken';
import { User } from './entity/User';

export function generateToken(payload: string | object | Buffer, extendDuration: boolean) {
  const expirationTimeInSeconds = 60 * 15;
  const extendedExpirationInSeconds = 60 * 60 * 24 * 7;
  const expiresIn = extendDuration ? extendedExpirationInSeconds : expirationTimeInSeconds;

  return jwt.sign({ payload }, process.env.JWT_KEY as Secret, { expiresIn });
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_KEY as Secret) as { payload: User };
}
