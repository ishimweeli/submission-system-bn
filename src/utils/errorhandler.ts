import httpStatus from 'http-status';
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string | undefined, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(httpStatus.UNAUTHORIZED, message);
    this.name = httpStatus['401_NAME'];
  }
}

export class ForbidenError extends AppError {
  constructor(message: string) {
    super(httpStatus.FORBIDDEN, message);
    this.name = httpStatus['403_NAME'];
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(httpStatus.BAD_REQUEST, message);
    this.name = httpStatus['400_NAME'];
  }
}

export class InternalServerError extends AppError {
  constructor(message: string) {
    super(httpStatus.INTERNAL_SERVER_ERROR, message);
    this.name = httpStatus['500_NAME'];
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(httpStatus.CONFLICT, message);
    this.name = httpStatus['409_NAME'];
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(httpStatus.NOT_FOUND, message);
    this.name = httpStatus['404_NAME'];
  }
}
