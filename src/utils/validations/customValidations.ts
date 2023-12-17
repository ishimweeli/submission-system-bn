const passwordValidator = (value: string): boolean => {
  const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~-]).{8,}$/;
  return regex.test(value);
};

export default passwordValidator;
