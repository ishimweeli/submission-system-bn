import jwt from 'jsonwebtoken';
import initialVariables from '../config/initialVariables';
import { AppError } from './errorhandler';
import httpStatus from 'http-status';

type definedPayload = {
  id: number;
  role: string;
  invited: boolean;
  firstName: string;
  email: string;
};
export function generateToken(data: definedPayload): string {
  return jwt.sign(data, initialVariables.jwt.secret_key, { expiresIn: '1h' });
}

export function decodeToken(token) {
  const decodedToken = jwt.verify(token, initialVariables.jwt.secret_key, (err, result) => {
    if (err) {
      throw new AppError(httpStatus.BAD_REQUEST, err.message);
    }
    return result;
  });
  return decodedToken;
}
