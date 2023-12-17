import { Request, Response, NextFunction } from 'express';
import { asyncMiddleware } from '../src/controllers/catchAsync'; // replace 'yourFile' with the actual file name

jest.mock('express');

describe('asyncMiddleware', () => {
  it('should handle async function correctly', async () => {
    const mockRequest = {} as Request;
    const mockResponse = {} as Response;
    const mockNextFunction = jest.fn() as NextFunction;
    const mockHandler = jest.fn().mockResolvedValue('mocked value');

    await asyncMiddleware(mockHandler)(mockRequest, mockResponse, mockNextFunction);

    expect(mockHandler).toHaveBeenCalledWith(mockRequest, mockResponse, mockNextFunction);
    expect(mockNextFunction).not.toHaveBeenCalled(); // assuming no error
  });

  it('should pass error to next function if async function throws', async () => {
    const mockRequest = {} as Request;
    const mockResponse = {} as Response;
    const mockNextFunction = jest.fn() as NextFunction;
    const mockError = new Error('mocked error');
    const mockHandler = jest.fn().mockRejectedValue(mockError);

    await asyncMiddleware(mockHandler)(mockRequest, mockResponse, mockNextFunction);

    expect(mockHandler).toHaveBeenCalledWith(mockRequest, mockResponse, mockNextFunction);
    expect(mockNextFunction).toHaveBeenCalledWith(mockError);
  });
});
