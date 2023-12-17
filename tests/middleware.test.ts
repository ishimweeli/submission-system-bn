import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticated } from '../src/middleware/authenticated';
import csv from 'csvtojson';
import httpStatus from 'http-status';
import { UserRole } from '@prisma/client';
import { convertCsvToJson } from '../src/middleware/convertCSVToJSON';
import { AppError } from '../src/utils/errorhandler';
jest.mock('jsonwebtoken');

describe('authenticated', () => {
  const mockRequest = () => {
    return {
      headers: { authorization: 'Bearer token' },
      cookies: { token: 'token' }
    } as any;
  };

  const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const nextFunction = jest.fn();

  test('returns 401 if no authorization header', () => {
    const req = mockRequest();
    req.headers.authorization = undefined;
    const res = mockResponse();
    authenticated(['role'])(req, res, nextFunction);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'JWT_SECRET_KEY environment variable is not defined.'
    });
  });

  test('returns 500 if no secret key', () => {
    const req = mockRequest();
    const res = mockResponse();
    process.env.JWT_SECRET_KEY = 'secret' || '';
    authenticated(['role'])(req, res, nextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  test('returns 403 if role not included', () => {
    const req = mockRequest();
    const res = mockResponse();
    process.env.JWT_SECRET_KEY = 'secret';
    (jwt.verify as jest.Mock).mockReturnValueOnce({ role: 'wrongRole' });
    authenticated(['role'])(req, res, nextFunction);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. Insufficient permissions.' });
  });

  test('calls next if role included', () => {
    const req = mockRequest();
    const res = mockResponse();
    (jwt.verify as jest.Mock).mockReturnValueOnce({ role: 'role' });
    authenticated(['role'])(req, res, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });
});
