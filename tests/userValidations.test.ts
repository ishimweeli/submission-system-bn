import Joi from 'joi';
import schemas from '../src/utils/validations/userValidation';

describe('Joi Schemas', () => {
  describe('userBulk', () => {
    it('should validate correct bulk users', () => {
      const users = {
        usersBulk: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
          },
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com'
          }
        ],
        userRole: 'admin'
      };
      const { error } = schemas.userBulk.body.usersBulk.validate(users.usersBulk);
      expect(error).toBeUndefined();
    });
  });

  describe('deleteUserSchema', () => {
    it('should validate correct id', () => {
      const params = { id: 1 };
      const { error } = schemas.deleteUserSchema.params.validate(params);
      expect(error).toBeUndefined();
    });
  });

  describe('updateUserSchema', () => {
    it('should validate correct user update', () => {
      const body = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com'
      };
      const params = { id: 1 };
      const { error } = schemas.updateUserSchema.body.validate(body);
      expect(error).toBeUndefined();
    });
  });
});
