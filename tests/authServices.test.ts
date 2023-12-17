import loginUser from '../src/services/auth.services';
import userService from '../src/services/user.service';
import { isPasswordMatch } from '../src/utils/passworUtils';
import { AppError } from '../src/utils/errorhandler';

jest.mock('../src/services/user.service');
jest.mock('../src/utils/passworUtils');

describe('loginUser', () => {
  it('should throw an error if the user is not found or the password does not match', async () => {
    userService.findUserByEmailOrUserId = jest.fn().mockResolvedValue(null);
    (isPasswordMatch as jest.Mock).mockResolvedValue(false);

    await expect(loginUser.loginUser('test@test.com', 'password')).rejects.toThrow(AppError);
  });
});

describe('loginUser', () => {
  it('should return user without password', async () => {
    const user = {
      id: 1,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      staff_id: '123',
      password: 'password',
      role: 'UserRole',
      invited: true
    };

    userService.findUserByEmailOrUserId = jest.fn().mockResolvedValue(user);
    (isPasswordMatch as jest.Mock).mockResolvedValue(true);

    const result = await loginUser.loginUser('test@test.com', 'password');

    expect(result).toEqual({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      staff_id: user.staff_id,
      role: user.role,
      invited: user.invited
    });
  });
});
