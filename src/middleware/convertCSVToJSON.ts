import { NextFunction, Request, Response } from 'express';
import csv from 'csvtojson';

import userValidation from '../utils/validations/userValidation';
import { AppError } from '../utils/errorhandler';
import { UserRole } from '@prisma/client';
import httpStatus from 'http-status';
import { validateInputs } from '../middleware/validateData';

export const convertCsvToJson =
  (usersBulk: string, userRole: UserRole) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file!;
    try {
      const data = await csv().fromString(file.buffer.toString());
      req.body[usersBulk] = data;
      req.body['userRole'] = userRole;
      return validateInputs(userValidation.userBulk)(req, res, next);
    } catch (err) {
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Error converting csv to json');
    }
  };
