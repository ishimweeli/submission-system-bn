import httpStatus from 'http-status';
import { AppError } from '../src/utils/errorhandler';
import validateDeadline from '../src/utils/validDeadline';

describe('validateDeadline', () => {
  it('should throw an error if the deadline is in the past', async () => {
    const deadlineString = '2022-11-08T08:50:51.720Z';
    try {
      await validateDeadline(deadlineString);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).statusCode).toBe(httpStatus.BAD_REQUEST);
      expect((error as AppError).message).toBe('You can not set deadline in the past');
    }
  });

  it('should return the deadline if it is valid', async () => {
    const now = new Date();
    const deadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const deadlineString = deadline.toISOString();
    const result = await validateDeadline(deadlineString);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe(deadlineString);
  });
});
