import jwt, { Secret } from 'jsonwebtoken';

export function generateToken(payload: string | object | Buffer) {
  return jwt.sign({ payload }, process.env.JWT_KEY as Secret, { expiresIn: 60 * 15 });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_KEY as Secret) as { payload: string };
  } catch (error: any) {
    //TODO
    // throw new UnauthorizedError('Token Invalid/Expired.');
  }
}
