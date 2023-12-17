const generatePassword = () => {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_-+=~`[]{}|:;<>,.?/';

  const getRandomCharacter = (group: string): string => {
    const index = Math.floor(Math.random() * group.length);
    return group[index];
  };

  const length = 8;
  const requiredCharacters = [
    getRandomCharacter(lowercaseChars),
    getRandomCharacter(uppercaseChars),
    getRandomCharacter(numberChars),
    getRandomCharacter(symbolChars)
  ];
  const remainingLengthPerGroup = Math.floor((length - 4) / 4);
  for (let i = 0; i < remainingLengthPerGroup; i++) {
    requiredCharacters.push(getRandomCharacter(lowercaseChars));
    requiredCharacters.push(getRandomCharacter(uppercaseChars));
    requiredCharacters.push(getRandomCharacter(numberChars));
    requiredCharacters.push(getRandomCharacter(symbolChars));
  }
  requiredCharacters.sort(() => Math.random() - 0.5);

  return requiredCharacters.join('');
};

export default generatePassword;
