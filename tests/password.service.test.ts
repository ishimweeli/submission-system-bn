import { hashPassword } from '../src/services/password.services'; // replace with your file path
import bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('Password hashing', () => {
  it('should hash a password', async () => {
    const password = 'password123';
    const hashedPassword = 'hashedPassword123';
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

    const result = await hashPassword(password);
    expect(result).toEqual(hashedPassword);
    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
  });

  it('should throw an error when hashing fails', async () => {
    const password = 'password123';
    const errorMessage = 'Password hashing failed';
    (bcrypt.hash as jest.Mock).mockRejectedValue(new Error());

    try {
      await hashPassword(password);
    } catch (err) {
      const error = err as Error;
      expect(error.message).toEqual(errorMessage);
    }

    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
  });
});
