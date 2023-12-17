import generatePassword from '../src/utils/generatePassword';

describe('generatePassword', () => {
  it('should generate a password of 8 characters', () => {
    const password = generatePassword();
    expect(password.length).toBe(8);
  });

  it('should contain at least one uppercase letter, one lowercase letter, one digit, and one symbol', () => {
    const password = generatePassword();
    expect(password).toMatch(/[A-Z]/); // checks for uppercase letter
    expect(password).toMatch(/[a-z]/); // checks for lowercase letter
    expect(password).toMatch(/[0-9]/); // checks for digit
    expect(password).toMatch(/[\!\@\#\$\%\^\&\*\(\)\_\-\+\=\~\`\[\]\{\}\|\:\<\>\,\.\?\/]/); // checks for symbol
  });
});
