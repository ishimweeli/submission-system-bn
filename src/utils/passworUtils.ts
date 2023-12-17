import bcrypt from 'bcrypt';

/**
 * Encrypt password
 * @param { string } password
 * @return { string }
 **/
export const encryptPassword = async (password: string): Promise<string> => {
  const encryptedPassword = await bcrypt.hash(password, 8);
  return encryptedPassword;
};

/**
 * Verify password
 * @param {string} claimedPassword
 * @param {string} userPassword
 * @returns {string}
 */
export const isPasswordMatch = async (
  claimedPassword: string,
  userPassword: string
): Promise<boolean> => {
  return bcrypt.compare(claimedPassword, userPassword);
};
