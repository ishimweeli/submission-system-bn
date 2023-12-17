/**
 * Login with username and password
 * @param {string} emailOrId
 * @param {string} passwordParm
 * @returns {Promise<Omit<User, 'password'>>}
 */

import { UnauthorizedError } from '../utils/errorhandler';
import userService from './user.service';
import { User } from '@prisma/client';
import { isPasswordMatch } from '../utils/passworUtils';

const loginUser = async (
  emailOrId: string,
  passwordParm: string
): Promise<Omit<User, 'password'>> => {
  const user = await userService.findUserByEmailOrUserId(emailOrId);

  if (!user || !(await isPasswordMatch(passwordParm, user.password))) {
    throw new UnauthorizedError('incorrect email or password!!');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export default { loginUser };
