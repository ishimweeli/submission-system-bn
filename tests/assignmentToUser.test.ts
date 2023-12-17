import { BadRequestError, NotFoundError } from '../src/utils/errorhandler';
import prisma from '../src/client';
import assignmentsToUser from '../src/services/assignmentsToUser';

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn()
    },
    assignment: {
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn()
    },
    assignmentToUser: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
    submission: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn()
    },
    snapshot: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn()
    }
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

describe('getAssignmentWithUsers', () => {
  it('should return the assignment with users if the assignment exists', async () => {
    const mockAssignmentId = '1';
    const mockAssignment = {
      assignmentId: mockAssignmentId,
      AssignmentToUser: [{ user: { id: 1 } }]
    };

    prisma.assignment.findUnique = jest.fn().mockResolvedValue(mockAssignment);
    const result = await assignmentsToUser.getAssignmentWithUsers(mockAssignmentId);
    expect(prisma.assignment.findUnique).toHaveBeenCalled();
    expect(result).toEqual(mockAssignment);
  });

  it('should throw an error if the assignment does not exist', async () => {
    const mockAssignmentId = '1';

    prisma.assignment.findUnique = jest.fn().mockResolvedValue(null);
    await expect(assignmentsToUser.getAssignmentWithUsers(mockAssignmentId)).rejects.toThrow(
      'assignment with user Error'
    );
    expect(prisma.assignment.findUnique).toHaveBeenCalled();
  });

  it('should throw an error if the database query fails', async () => {
    const mockAssignmentId = '1';

    prisma.assignment.findUnique = jest.fn().mockRejectedValue(new Error('Database query failed'));
    await expect(assignmentsToUser.getAssignmentWithUsers(mockAssignmentId)).rejects.toThrow(
      'assignment with user Error'
    );
    expect(prisma.assignment.findUnique).toHaveBeenCalled();
  });
});
