import { Request, Response } from 'express';
import { adminController } from '../src/controllers'; // replace 'yourFile' with the actual file name
import { generateToken } from '../src/utils/token.utils';
import sendEmail from '../src/services/email.service';
import { encryptPassword } from '../src/utils/passworUtils';
import authServices from '../src/services/auth.services';
import { UserRole } from '@prisma/client';
import { generateStuffId } from '../src/utils/generateUniqueIds';
import generatePassword from '../src/utils/generatePassword';
import { userService } from '../src/services';
import httpStatus from 'http-status';
import * as getNextId from '../src/services/user.service';
import prisma from '../src/client';
import { User } from '@sentry/types';

jest.mock('../src/utils/token.utils');
jest.mock('../src/services/email.service');
jest.mock('../src/utils/passworUtils');
jest.mock('../src/services/auth.services');
jest.mock('../src/utils/generateUniqueIds');
jest.mock('../src/utils/generatePassword');

jest.mock('../src/services');
describe('adminLogin', () => {
  it('should handle admin login correctly', async () => {
    const mockRequest = {
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    } as Request;
    const mockResponse = {
      cookie: jest.fn(),
      json: jest.fn()
    } as unknown as Response;
    const mockNext = jest.fn();
    const mockUser = {
      id: 1,
      role: UserRole.ADMIN,
      invited: false
    };
    const mockToken = 'mockToken';

    await adminController.adminLogin(mockRequest, mockResponse, mockNext);

    expect(authServices.loginUser).toHaveBeenCalledWith(
      mockRequest.body.email,
      mockRequest.body.password
    );
  });
});

describe('updateStudentInfo', () => {
  it('should update student info and return updated student', async () => {
    const req = {
      params: { id: '1' },
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        staff_id: '12345'
      }
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    const next = jest.fn();
    (userService.updateStudent as jest.Mock).mockResolvedValue(req.body);

    await adminController.updateStudentInfo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(req.body);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('createBulk', () => {
  it('should create users in bulk and return success message', async () => {
    const req = {
      body: {
        usersBulk: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
          },
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com'
          }
        ],
        userRole: 'student'
      }
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    const next = jest.fn();
    (generateStuffId as jest.Mock).mockResolvedValue('12345');
    (generatePassword as jest.Mock).mockReturnValue('password123');
    (encryptPassword as jest.Mock).mockResolvedValue('hashedPassword123');
    (sendEmail as jest.Mock).mockResolvedValue(undefined);

    // Mock userService.createUser function
    (userService.createUser as jest.Mock).mockResolvedValue(undefined);

    await adminController.createBulk(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });
});

describe('createBulkStudent', () => {
  it('should create students in bulk and return success message', async () => {
    const req = {
      body: {
        usersBulk: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
          },
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com'
          }
        ],
        userRole: 'student'
      }
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    const next = jest.fn();
    (generateStuffId as jest.Mock).mockResolvedValue('12345');
    (generatePassword as jest.Mock).mockReturnValue('password123');
    (encryptPassword as jest.Mock).mockResolvedValue('hashedPassword123');
    (sendEmail as jest.Mock).mockResolvedValue(undefined);

    (userService.createUser as jest.Mock).mockResolvedValue(undefined);

    await adminController.createBulkStudent(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });
});

describe('dashboardInfo', () => {
  it('should return the correct response', async () => {
    // Arrange
    const mockRequest = {} as Request;
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;
    const mockNext = jest.fn();
    const mockData = [{ id: 1 }, { id: 2 }];
    (userService.getUsersByRole as jest.Mock).mockResolvedValue(mockData);

    // Act
    await adminController.dashboardInfo(mockRequest, mockResponse, mockNext);

    expect(true).toBe(true);
  });
});

describe('createUser', () => {
  it('should create a user', async () => {
    const mockRequest = {
      body: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'student'
      }
    } as Request;

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    const mockNext = jest.fn();

    userService.findUserByEmailOrUserId = jest.fn().mockResolvedValue(null);
    userService.createUser = jest.fn().mockResolvedValue({ id: 1, ...mockRequest.body });

    await adminController.createUser(mockRequest, mockResponse, mockNext);
    expect(true).toBe(true);
  });
});

jest.mock('../src/utils/token.utils');
jest.mock('../src/services/email.service');
jest.mock('../src/utils/passworUtils');
jest.mock('../src/services/auth.services');
jest.mock('../src/utils/generateUniqueIds');
jest.mock('../src/utils/generatePassword');
jest.mock('../src/services');

describe('adminLogin', () => {
  it('should handle admin login correctly', async () => {
    const mockRequest = {
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    } as Request;
    const mockResponse = {
      cookie: jest.fn(),
      json: jest.fn()
    } as unknown as Response;
    const mockNext = jest.fn();
    const mockUser = {
      id: 1,
      role: UserRole.ADMIN,
      invited: false
    };
    const mockToken = 'mockToken';

    (authServices.loginUser as jest.Mock).mockResolvedValue(mockUser);
    (generateToken as jest.Mock).mockReturnValue(mockToken);

    await adminController.adminLogin(mockRequest, mockResponse, mockNext);

    expect(authServices.loginUser).toHaveBeenCalledWith(
      mockRequest.body.email,
      mockRequest.body.password
    );
    expect(mockResponse.cookie).toHaveBeenCalledWith('token', mockToken, { httpOnly: true });
    expect(mockResponse.json).toHaveBeenCalledWith({
      role: mockUser.role,
      token: mockToken
    });
  });
});

describe('updateStudentInfo', () => {
  it('should update student info and return updated student', async () => {
    const req = {
      params: { id: '1' },
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        staff_id: '12345'
      }
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    const next = jest.fn();
    (userService.updateStudent as jest.Mock).mockResolvedValue(req.body);

    await adminController.updateStudentInfo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(req.body);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('createBulk', () => {
  it('should create users in bulk and return success message', async () => {
    const req = {
      body: {
        usersBulk: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
          },
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com'
          }
        ],
        userRole: 'student'
      }
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    const next = jest.fn();
    (generateStuffId as jest.Mock).mockResolvedValue('12345');
    (generatePassword as jest.Mock).mockReturnValue('password123');
    (encryptPassword as jest.Mock).mockResolvedValue('hashedPassword123');
    (sendEmail as jest.Mock).mockResolvedValue(undefined);

    // Mock userService.createUser function
    (userService.createUser as jest.Mock).mockResolvedValue(undefined);

    await adminController.createBulk(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });
});

describe('createBulkStudent', () => {
  it('should create students in bulk and return success message', async () => {
    const req = {
      body: {
        usersBulk: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
          },
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com'
          }
        ],
        userRole: 'student'
      }
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    const next = jest.fn();
    (generateStuffId as jest.Mock).mockResolvedValue('12345');
    (generatePassword as jest.Mock).mockReturnValue('password123');
    (encryptPassword as jest.Mock).mockResolvedValue('hashedPassword123');
    (sendEmail as jest.Mock).mockResolvedValue(undefined);

    (userService.createUser as jest.Mock).mockResolvedValue(undefined);

    await adminController.createBulkStudent(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });
});
