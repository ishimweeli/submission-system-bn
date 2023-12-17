import { errorMiddleware } from '../src/middleware/errorMiddleware';
import { AppError } from '../src/utils/errorhandler';
import httpStatus from 'http-status';

describe('errorMiddleware', () => {
  it('should handle AppError', () => {
    const err = new AppError(httpStatus.BAD_REQUEST, 'Test error');
    const req = {} as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error',
      message: 'Test error',
      status: 'failed'
    });
  });

  it('should handle generic Error', () => {
    const err = new Error('Test error');
    const req = {} as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      error: httpStatus['500_NAME'],
      message: 'Test error',
      status: 'failed'
    });
  });
});
