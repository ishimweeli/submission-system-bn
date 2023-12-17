import { generateToken, decodeToken } from '../src/utils/token.utils'; // replace with your file path
import jwt from 'jsonwebtoken';
import initialVariables from '../src/config/initialVariables';
import httpStatus from 'http-status';

jest.mock('jsonwebtoken');

describe('Token functions', () => {
  const mockPayload = {
    id: 1,
    role: 'admin',
    invited: true,
    firstName: 'John',
    email: 'a@a.com'
  };

  it('should generate a token', () => {
    const token = '12345';
    (jwt.sign as jest.Mock).mockReturnValue(token);

    const result = generateToken(mockPayload);
    expect(result).toEqual(token);
    expect(jwt.sign).toHaveBeenCalledWith(mockPayload, initialVariables.jwt.secret_key, {
      expiresIn: '1h'
    });
  });

  it('should decode a token', () => {
    (jwt.verify as jest.Mock).mockImplementation((token, secretKey, callback) => {
      callback(null, mockPayload);
    });

    const result = decodeToken('12345');
    expect(jwt.verify).toHaveBeenCalledWith(
      '12345',
      initialVariables.jwt.secret_key,
      expect.any(Function)
    );
  });

  it('should throw an error when decoding a token', () => {
    const errorMessage = 'Invalid token';
    (jwt.verify as jest.Mock).mockImplementation((token, secretKey, callback) => {
      callback(new Error(errorMessage), null);
    });

    try {
      decodeToken('12345');
    } catch (err) {
      const error = err as Error;
      expect(error.message).toEqual(errorMessage);
    }

    expect(jwt.verify).toHaveBeenCalledWith(
      '12345',
      initialVariables.jwt.secret_key,
      expect.any(Function)
    );
  });
});
