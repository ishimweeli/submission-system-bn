import {
  validateInputs,
  validateFiletype,
  validateZipUpload
} from '../src/middleware/validateData';
import { AppError, BadRequestError } from '../src/utils/errorhandler';
// import { BadRequestError } from '../src/utils/errorhandler';
import httpStatus from 'http-status';
import Joi = require('joi');

describe('validateInputs', () => {
  it('should validate inputs and call next middleware', () => {
    const schema = { body: { test: 'test' } };
    const req = { body: { test: 'test' } } as any;
    const res = {} as any;
    const next = jest.fn();

    validateInputs(schema)(req, res, next);

    expect(req.body.test).toBe('test');
    expect(next).toHaveBeenCalled();
  });

  it('should handle validation error', () => {
    const schema = { body: { test: 'test' } };
    const req = { body: { wrong: 'test' } } as any;
    const res = {} as any;
    const next = jest.fn();

    validateInputs(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `"wrong" is not allowed, please provide valid input`
      )
    );
  });

  it('should handle invalid query parameters', () => {
    const schema = { query: { param: Joi.number().required() } };
    const req = { query: { param: 'invalid' } } as any;
    const res = {} as any;
    const next = jest.fn();

    validateInputs(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `"param" must be a number, please provide valid input`
      )
    );
  });

  it('should handle invalid path parameters', () => {
    const schema = { params: { id: Joi.number().required() } };
    const req = { params: { id: 'invalid' } } as any;
    const res = {} as any;
    const next = jest.fn();

    validateInputs(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `"id" must be a number, please provide valid input`
      )
    );
  });
});

describe('validateFiletype', () => {
  it('should validate filetype and call next middleware', () => {
    const req = { file: { mimetype: 'image/png' } } as any;
    const res = {} as any;
    const next = jest.fn();

    validateFiletype('image/png')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should handle missing file', () => {
    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();

    validateFiletype('image/png')(req, res, next);

    expect(next).toHaveBeenCalledWith(new AppError(httpStatus.BAD_REQUEST, 'No file uploaded'));
  });

  it('should handle invalid filetype', () => {
    const req = { file: { mimetype: 'image/jpeg' } } as any;
    const res = {} as any;
    const next = jest.fn();

    validateFiletype('image/png')(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new AppError(httpStatus.BAD_REQUEST, 'Invalid file type. Only png files are allowed')
    );
  });

  it('should handle multiple files with mixed mime types', () => {
    const req = {
      files: [
        { mimetype: 'application/zip' },
        { mimetype: 'application/x-gzip' },
        { mimetype: 'application/pdf' } // Invalid mime type
      ]
    } as any;
    const res = {} as any;
    const next = jest.fn();

    try {
      validateZipUpload(req, res, next);
      fail('Expected BadRequestError, but no error was thrown.');
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toBe('Only zip files are allowed.');
    }
    expect(next).not.toHaveBeenCalled();
  });
});
