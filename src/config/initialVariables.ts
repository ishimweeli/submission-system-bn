import dotenv from 'dotenv';
import Joi from 'joi';
import { AppError } from '../utils/errorhandler';
import httpStatus from 'http-status';

dotenv.config();

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().required().default('development'),
    PORT: Joi.number().required().default('5000'),
    DATABASE_URL: Joi.string().required(),
    ADMIN_PASSWORD: Joi.string().required(),
    ADMIN_EMAIL: Joi.string().required(),
    JWT_SECRET_KEY: Joi.string().required(),
    GMAIL_USER: Joi.string().required(),
    GMAIL_PASS: Joi.string().required()
  })
  .unknown();

const { value: envVariables, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new AppError(httpStatus.BAD_REQUEST, `Config validation error: ${error.message}`);
}

export default {
  env: envVariables.NODE_ENV,
  port: envVariables.PORT,
  dbUrl: envVariables.DATABASE_URL,
  gmail: {
    user: envVariables.GMAIL_USER,
    pass: envVariables.GMAIL_PASS
  },
  jwt: {
    secret_key: envVariables.JWT_SECRET_KEY
  },
  adminSeeder: {
    email: envVariables.ADMIN_EMAIL,
    pass: envVariables.ADMIN_PASSWORD
  }
};
