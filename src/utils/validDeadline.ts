import httpStatus from 'http-status';
import { AppError } from './errorhandler';

const validateDeadline = async (deadlineString: string): Promise<Date> => {
  const now = new Date();
  const deadline = new Date(deadlineString);
  if (deadline <= now) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You can not set deadline in the past');
  } else {
    return deadline;
  }
};

export default validateDeadline;
