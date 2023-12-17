import { encryptPassword, isPasswordMatch } from '../src/utils/passworUtils'; // replace with your file path
import bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

describe('Password Utils', () => {
  const password = 'password123';
  const hashedPassword = 'hashedPassword123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should encrypt password', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
    const result = await encryptPassword(password);
    expect(result).toEqual(hashedPassword);
    expect(bcrypt.hash).toHaveBeenCalledWith(password, 8);
  });

  it('should verify password', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const result = await isPasswordMatch(password, hashedPassword);
    expect(result).toEqual(true);
    expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
  });
});
