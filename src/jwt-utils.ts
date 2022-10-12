import jwt, { Secret } from 'jsonwebtoken';

export function generateToken(payload: string | object | Buffer, extendDuration: boolean) {
  //1 week in seconds
  const week = 60 * 60 * 24 * 7;
  const fifteenMinutes = 60 * 15;
  const expiresIn = extendDuration ? week : fifteenMinutes;

  return jwt.sign({ payload }, process.env.JWT_KEY as Secret, { expiresIn });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_KEY as Secret) as { payload: string };
  } catch (error: any) {
    //TODO
    // throw new UnauthorizedError('Token Invalid/Expired.');
  }
}
