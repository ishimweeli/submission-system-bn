import { userService } from '../src/services';
import authServices from '../src/services/auth.services';
import prisma from '../src/client';
import nodemailer from 'nodemailer';

import sendEmail from '../src/services/email.service';

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
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

    // Also, check if sendMail function was called with the correct parameters
    const sendMailMock = nodemailer.createTransport().sendMail;
    expect(sendMailMock).toHaveBeenCalledWith({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html: text
    });
  });
});
