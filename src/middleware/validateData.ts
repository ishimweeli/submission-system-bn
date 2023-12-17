import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errorhandler';
import extractKey from '../utils/keyExtractor';
import httpStatus from 'http-status';
import { BadRequestError } from '../utils/errorhandler';

export const validateInputs =
  (schema: object) => (req: Request, res: Response, next: NextFunction) => {
    const validSchema = extractKey(schema, ['params', 'query', 'body']);
    const obj = extractKey(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(obj);
    if (error) {
      return next(
        new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          `${error.message}, please provide valid input`
        )
      );
    }
    Object.assign(req, value);
    return next();
  };
export const validateFiletype =
  (filetype: string) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError(httpStatus.BAD_REQUEST, 'No file uploaded'));
    }

    if (req.file.mimetype !== filetype) {
      return next(
        new AppError(
          httpStatus.BAD_REQUEST,
          `Invalid file type. Only ${filetype.split('/')[1]} files are allowed`
        )
      );
    }
    next();
  };
// Middleware to validate uploaded zip files
export const validateZipUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files?.length) {
    throw new BadRequestError('No file uploaded.');
  }
  const allowedMimeTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-tar',
    'application/x-gzip',
    'application/x-bzip2',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-compress',
    'application/octet-stream'
  ];
  if (req.file && !allowedMimeTypes.includes(req.file.mimetype)) {
    throw new BadRequestError('Only zip files are allowed.');
  } else {
    for (const file of req.files as Express.Multer.File[]) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestError('Only zip files are allowed.');
      }
    }
  }
  next();
};
