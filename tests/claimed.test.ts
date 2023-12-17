import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { checkInvited } from '../src/middleware/checkClaimed';

jest.mock('jsonwebtoken');

describe('checkInvited', () => {
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
    checkInvited(true)(req, res, nextFunction);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'JWT_SECRET_KEY environment variable is not defined.'
    });
  });

  test('returns 500 if no secret key', () => {
    const req = mockRequest();
    const res = mockResponse();
    process.env.JWT_SECRET_KEY = 'secret' || '';
    checkInvited(true)(req, res, nextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token claim' });
  });

  test('returns 403 if invited status does not match', () => {
    const req = mockRequest();
    const res = mockResponse();
    process.env.JWT_SECRET_KEY = 'secret';
    (jwt.verify as jest.Mock).mockReturnValueOnce({ invited: false });
    checkInvited(true)(req, res, nextFunction);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Please visit your email and claim your account first.'
    });
  });

  test('calls next if invited status matches', () => {
    const req = mockRequest();
    const res = mockResponse();
    (jwt.verify as jest.Mock).mockReturnValueOnce({ invited: true });
    checkInvited(true)(req, res, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });
});
