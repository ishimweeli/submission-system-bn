import { convertCsvToJson } from '../src/middleware/convertCSVToJSON'; // replace with your file path
import csv from 'csvtojson';
import { validateInputs } from '../src/middleware/validateData';
import { Response, Request, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

jest.mock('csvtojson', () => {
  return jest.fn().mockReturnValue({
    fromString: jest.fn()
  });
});

jest.mock('../src/middleware/validateData', () => ({
  validateInputs: jest
    .fn()
    .mockImplementation(() => (req: Request, res: Response, next: NextFunction) => next())
}));

describe('convertCsvToJson', () => {
  it('should convert csv to json and call next middleware', async () => {
    const req = {
      file: { buffer: Buffer.from('test') },
      body: {}
    } as Partial<Request>;
    const res = {} as Partial<Response>;
    const next = jest.fn() as NextFunction;

    (csv().fromString as jest.Mock).mockResolvedValue([{ test: 'test' }]);
    (validateInputs as jest.Mock).mockImplementation(
      () => (req: Request, res: Response, next: NextFunction) => next()
    );

    await convertCsvToJson('usersBulk', UserRole.ADMIN)(req as Request, res as Response, next);

    expect(req.body.usersBulk).toEqual([{ test: 'test' }]);
    expect(req.body.userRole).toBe(UserRole.ADMIN);
    expect(next).toHaveBeenCalled();
  });
});
