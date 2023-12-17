import { userService } from '../src/services';
import prisma from '../src/client';
import { BadRequestError, ConflictError } from '../src/utils/errorhandler';
import { User, UserRole } from '@prisma/client';
import nodemailer from 'nodemailer';

import sendEmail from '../src/services/email.service';
import { any } from 'joi';

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn() // Add this line to mock the count function
    }
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

describe('User and Auth Services', () => {
  const testUser = {
    email: 'test@example.com',
    staff_id: '12345',
    password: 'password123',
    role: 'STUDENT',
    firstName: 'John',
    lastName: 'Doe'
  };

  it('should find a user by email or staff ID', async () => {
    const expectedUser = testUser;
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(expectedUser);

    const result = await userService.findUserByEmailOrUserId('test@example.com');

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ staff_id: 'test@example.com' }, { email: 'test@example.com' }]
      }
    });
    expect(result).toEqual(expectedUser);
  });

  it('should create a new user', async () => {
    const expectedUser = testUser;
    (prisma.user.create as jest.Mock).mockResolvedValue(expectedUser);

    const result = await userService.createUser(
      testUser.email,
      testUser.staff_id,
      testUser.password,
      'STUDENT',
      testUser.firstName,
      testUser.lastName
    );

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: testUser
    });
    expect(result).toEqual(expectedUser);
  });

  it('should get users by their role', async () => {
    const role = 'STUDENT';
    const expectedUsers = {
      totalCount: 1, // The expected total count of users with the role 'STUDENT'
      users: [testUser]
    };
    (prisma.user.findMany as jest.Mock).mockResolvedValue([testUser]);
    (prisma.user.count as jest.Mock).mockResolvedValue(1);

    const result = await userService.getUsersByRole(role, 1, 10);

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { role },
      skip: 0,
      take: 10
    });
    expect(prisma.user.count).toHaveBeenCalledWith({
      where: { role }
    });
    expect(result).toEqual(expectedUsers);
  });

  it('should get users by their IDs', async () => {
    const userIds = [1, 2, 3];
    const expectedUsers = [testUser, testUser, testUser];
    (prisma.user.findMany as jest.Mock).mockResolvedValue(expectedUsers);

    const result = await userService.getUsersById(userIds);

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        email: true,
        lastName: true
      }
    });
    expect(result).toEqual(expectedUsers);
  });
});

jest.mock('nodemailer');

describe('Email Service', () => {
  it('should send an email', async () => {
    const to = 'recipient@example.com';
    const subject = 'Test Subject';
    const text = 'Test Email Body';

    nodemailer.createTransport.mockReturnValue({
      sendMail: jest.fn()
    });

    await sendEmail(to, subject, text);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const sendMailMock = nodemailer.createTransport().sendMail;
    expect(sendMailMock).toHaveBeenCalledWith({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html: text
    });
  });
});

describe('userService.createUser', () => {
  const email = 'user@example.com';
  const staffId = 'S123';
  const password = 'password123';
  const role: UserRole = 'STUDENT';
  const firstName = 'John';
  const lastName = 'Doe';

  it('should create a user when valid data is provided', async () => {
    const createdUser: User = {
      id: 1,
      email,
      staff_id: staffId,
      password,
      role,
      firstName,
      lastName,
      invited: false
    };

    (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);
    const result = await userService.createUser(
      email,
      staffId,
      password,
      role,
      firstName,
      lastName
    );
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email,
        staff_id: staffId,
        password,
        role,
        firstName,
        lastName
      }
    });
    expect(result).toEqual(createdUser);
  });

  it('should throw a BadRequestError when any field is missing', async () => {
    try {
      await userService.createUser(email, '', password, role, firstName, lastName);
      expect(true).toBe(false);
    } catch (err: any) {
      // Assert
      expect(err).toBeInstanceOf(BadRequestError);
      expect(err.message).toBe('All fields are required');
    }
  });

  it('should throw a ConflictError when the email already exists', async () => {
    const conflictError = new ConflictError(`Email "${email}" already exists`);
    (prisma.user.create as jest.Mock).mockRejectedValue({
      code: 'P2002'
    });
    try {
      await userService.createUser(email, staffId, password, role, firstName, lastName);
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toEqual(conflictError);
    }
  });

  it('should handle Prisma error and throw an error', async () => {
    const error = new Error('Prisma error');
    (prisma.user.create as jest.Mock).mockRejectedValue(error);

    try {
      await userService.createUser(email, staffId, password, role, firstName, lastName);
      expect(true).toBe(false); // Fail the test if the code reaches this point
    } catch (err) {
      expect(err).toEqual(error);
    }
  });
});

describe('userService.getUsersByRole', () => {
  const role: UserRole = 'STUDENT';
  const validPage = 1;
  const validLimit = 10;

  it('should get users by role when valid data is provided', async () => {
    // Arrange
    const users: User[] = [
      {
        id: 1,
        email: 'user1@example.com',
        staff_id: 'S123',
        password: 'password123',
        role: 'STUDENT',
        firstName: 'John',
        lastName: 'Doe',
        invited: false
      },
      {
        id: 2,
        email: 'user2@example.com',
        staff_id: 'S124',
        password: 'password124',
        role: 'STUDENT',
        firstName: 'Jane',
        lastName: 'Doe',
        invited: true
      }
    ];
    const totalCount = 2; // The expected total count of users with the role 'STUDENT'

    (prisma.user.findMany as jest.Mock).mockResolvedValue(users);
    (prisma.user.count as jest.Mock).mockResolvedValue(totalCount);

    // Act
    const result = await userService.getUsersByRole(role, validPage, validLimit);

    // Assert
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        role
      },
      skip: 0, // Assuming page 1
      take: validLimit
    });
    expect(prisma.user.count).toHaveBeenCalledWith({
      where: {
        role
      }
    });
    expect(result).toEqual({ users, totalCount });
  });

  it('should throw a BadRequestError when any required parameter is missing', async () => {
    // Arrange & Act
    try {
      await userService.getUsersByRole('' as any, validPage, validLimit);
      expect(true).toBe(false); // Fail the test if the code reaches this point
    } catch (err: any) {
      // Assert
      expect(err).toBeInstanceOf(BadRequestError);
      expect(err.message).toBe('Role, page, and limit are required');
    }
  });
});

describe('userService.updateStudent', () => {
  const validStudentId = 1;
  const validFirstName = 'UpdatedFirst';
  const validLastName = 'UpdatedLast';
  const validEmail = 'updated@example.com';
  const validPassword = 'updatedPassword123';
  const validStaffId = 'S456';

  it('should update a student when valid data is provided', async () => {
    // Arrange
    const updatedStudent: User = {
      id: validStudentId,
      firstName: validFirstName,
      lastName: validLastName,
      email: validEmail,
      staff_id: validStaffId,
      password: validPassword,
      role: 'STUDENT',
      invited: false
    };

    (prisma.user.update as jest.Mock).mockResolvedValue(updatedStudent);

    // Act
    const result = await userService.updateStudent(
      validStudentId,
      validFirstName,
      validLastName,
      validEmail,
      validPassword,
      validStaffId
    );

    // Assert
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: validStudentId },
      data: {
        firstName: validFirstName,
        lastName: validLastName,
        email: validEmail,
        password: validPassword,
        staff_id: validStaffId
      }
    });
    expect(result).toEqual(updatedStudent);
  });

  it('should throw a BadRequestError when any field is missing', async () => {
    // Arrange & Act
    try {
      await userService.updateStudent(
        validStudentId,
        '',
        validLastName,
        validEmail,
        validPassword,
        validStaffId
      );
      expect(true).toBe(false); // Fail the test if the code reaches this point
    } catch (err: any) {
      // Assert
      expect(err).toBeInstanceOf(BadRequestError);
      expect(err.message).toBe('All fields are required');
    }
  });
});

describe('userService.getUsersById', () => {
  const validUserIds = [1, 2, 3];

  it('should get users by IDs when valid data is provided', async () => {
    const users: User[] = [
      {
        id: 1,
        firstName: 'User1',
        lastName: 'Last1',
        email: 'user1@example.com',
        staff_id: 'S1',
        password: 'password1',
        role: 'STUDENT',
        invited: true
      },
      {
        id: 2,
        firstName: 'User2',
        lastName: 'Last2',
        email: 'user2@example.com',
        staff_id: 'S2',
        password: 'password2',
        role: 'STUDENT',
        invited: false
      },
      {
        id: 3,
        firstName: 'User3',
        lastName: 'Last3',
        email: 'user3@example.com',
        staff_id: 'S3',
        password: 'password3',
        role: 'STUDENT',
        invited: true
      }
    ];

    (prisma.user.findMany as jest.Mock).mockResolvedValue(users);
    const result = await userService.getUsersById(validUserIds);
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: validUserIds
        }
      },
      select: {
        id: true,
        firstName: true,
        email: true,
        lastName: true
      }
    });
    expect(result).toEqual(users);
  });

  it('should throw a BadRequestError when user IDs are not provided', async () => {
    try {
      await userService.getUsersById([]);
      expect(true).toBe(false); // Fail the test if the code reaches this point
    } catch (err: any) {
      expect(err).toBeInstanceOf(BadRequestError);
      expect(err.message).toBe('User IDs are required');
    }
  });
});
describe('userService.getNextId', () => {
  it('should return 1 if no users exist', async () => {
    // Arrange
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

    // Act
    const nextId = await userService.getNextId();

    // Assert
    expect(nextId).toBe(1);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      orderBy: {
        id: 'desc'
      }
    });
  });

  it('should return the next id if users exist', async () => {
    // Arrange
    const lastUser = { id: 5, firstName: 'Last', lastName: 'User', email: 'lastuser@example.com' };
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(lastUser);

    // Act
    const nextId = await userService.getNextId();

    // Assert
    expect(nextId).toBe(lastUser.id + 1);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      orderBy: {
        id: 'desc'
      }
    });
  });

  it('should handle Prisma error and throw an error', async () => {
    // Arrange
    const error = new Error('Prisma error');
    (prisma.user.findFirst as jest.Mock).mockRejectedValue(error);

    // Act & Assert
    try {
      await userService.getNextId();
      expect(true).toBe(false); // Fail the test if the code reaches this point
    } catch (err) {
      expect(err).toEqual(error);
    }
  });
});

describe('userService.getUserById', () => {
  const validUserId = 1;
  const nonExistingUserId = 2;

  it('should get user by ID when valid data is provided', async () => {
    type User = {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      staff_id: string;
      password: string;
      role: UserRole;
      invited: boolean;
    };

    const user: User = {
      id: validUserId,
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      staff_id: 'someStaffId',
      password: 'somePassword',
      role: 'STUDENT',
      invited: true
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    const result = await userService.getUserById(validUserId);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: validUserId
      }
    });
    expect(result).toEqual(user);
  });

  it('should throw a BadRequestError when user ID is not provided', async () => {
    try {
      await userService.getUserById(undefined as any);
      expect(true).toBe(false);
    } catch (err: any) {
      // Assert
      expect(err).toBeInstanceOf(BadRequestError);
      expect(err.message).toBe('User ID is required');
    }
  });

  it('should throw a BadRequestError when user is not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    try {
      await userService.getUserById(nonExistingUserId);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err).toBeInstanceOf(BadRequestError);
      expect(err.message).toBe(`User not found`);
    }
  });

  it('should handle Prisma error and throw an error', async () => {
    const error = new Error('Prisma error');
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(error);
    try {
      await userService.getUserById(validUserId);
      expect(true).toBe(false); // Fail the test if the code reaches this point
    } catch (err) {
      expect(err).toEqual(error);
    }
  });
});
