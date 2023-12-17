import passwordValidator from '../src/utils/validations/customValidations';

describe('passwordValidator', () => {
  it('should validate a correct password', () => {
    const password = 'Password123!';
    const result = passwordValidator(password);
    expect(result).toBe(true);
  });

  it('should invalidate an incorrect password', () => {
    const password = 'password';
    const result = passwordValidator(password);
    expect(result).toBe(false);
  });
});
