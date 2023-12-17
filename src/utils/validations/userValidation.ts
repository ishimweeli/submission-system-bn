import Joi from 'joi';

const userSchema = Joi.object({
  firstName: Joi.string().required().messages({
    'string.empty': 'First name is required'
  }),
  lastName: Joi.string().required().messages({
    'string.empty': 'Last name is required'
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Invalid email format'
    })
});

const resetPasswordSchema = {
  body: Joi.object({
    newPassword: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
      .required()
      .messages({
        'string.min': 'The password should have a minimum length of {#limit} characters',
        'string.pattern.base':
          'The password must include at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is a required field'
      })
  })
};

const userBulk = {
  body: {
    usersBulk: Joi.array().items(userSchema),
    userRole: Joi.string()
  }
};

const deleteUserSchema = {
  params: Joi.object().keys({
    id: Joi.number().messages({
      'number.empty': 'Provide studentId'
    })
  })
};

const updateUserSchema = {
  body: Joi.object().keys({
    firstname: Joi.string().messages({
      'string.empty': 'First name is required'
    }),
    lastname: Joi.string().messages({
      'string.empty': 'Last name is required'
    }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Invalid email format'
      })
  }),
  params: Joi.object().keys({
    id: Joi.number().messages({
      'number.empty': 'Provide studentId'
    })
  })
};

export default { userBulk, updateUserSchema, deleteUserSchema, resetPasswordSchema };
