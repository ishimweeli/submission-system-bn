import submissionServices from '../src/services/submission.services';
import prisma from '../src/client';
import { BadRequestError } from '../src/utils/errorhandler';
import { generateToken, decodeToken } from '../src/utils/token.utils'; // replace with your file path
import jwt from 'jsonwebtoken';
import initialVariables from '../src/config/initialVariables';
import httpStatus from 'http-status';
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

describe('getAllSubmissions', () => {
  it('should return all submissions with their associated assignments, students, and snapshots', async () => {
    const mockSubmissions = [
      {
        id: 1,
        assignment: { id: 1, name: 'Assignment 1' },
        student: { id: 1, name: 'Student 1' },
        snapshots: [{ id: 1, name: 'Snapshot 1' }]
      },
      {
        id: 2,
        assignment: { id: 2, name: 'Assignment 2' },
        student: { id: 2, name: 'Student 2' },
        snapshots: [{ id: 2, name: 'Snapshot 2' }]
      }
    ];

    prisma.submission.findMany = jest.fn().mockResolvedValue(mockSubmissions);
    const result = await submissionServices.getAllSubmissions();
    expect(prisma.submission.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockSubmissions);
  });
  it('should return an empty array when there are no submissions', async () => {
    prisma.submission.findMany = jest.fn().mockResolvedValue([]);
    const result = await submissionServices.getAllSubmissions();
    expect(prisma.submission.findMany).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
  it('should throw an error if the database query fails', async () => {
    prisma.submission.findMany = jest.fn().mockRejectedValue(new Error('Database query failed'));
    await expect(submissionServices.getAllSubmissions()).rejects.toThrow('Database query failed');
    expect(prisma.submission.findMany).toHaveBeenCalled();
  });
});


describe('checkSubmissionExist', () => {
  it('should return the submission if it exists', async () => {
    const mockAssignmentId = '1';
    const mockStudentId = 1;
    const mockSubmission = { id: 1, assignmentId: mockAssignmentId, studentId: mockStudentId };

    prisma.submission.findFirst = jest.fn().mockResolvedValue(mockSubmission);
    const result = await submissionServices.checkSubmissionExist(mockAssignmentId, mockStudentId);
    expect(prisma.submission.findFirst).toHaveBeenCalled();
    expect(result).toEqual(mockSubmission);
  });

  it('should return null if the submission does not exist', async () => {
    const mockAssignmentId = '1';
    const mockStudentId = 1;

    prisma.submission.findFirst = jest.fn().mockResolvedValue(null);
    const result = await submissionServices.checkSubmissionExist(mockAssignmentId, mockStudentId);
    expect(prisma.submission.findFirst).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should throw an error if the database query fails', async () => {
    const mockAssignmentId = '1';
    const mockStudentId = 1;

    prisma.submission.findFirst = jest.fn().mockRejectedValue(new Error('Database query failed'));
    await expect(
      submissionServices.checkSubmissionExist(mockAssignmentId, mockStudentId)
    ).rejects.toThrow('Database query failed');
    expect(prisma.submission.findFirst).toHaveBeenCalled();
  });
});

describe('getNextSubmissionId', () => {
  it('should return the next submission id when there is a last submission', async () => {
    const mockLastSubmission = { id: '1' };

    prisma.submission.findFirst = jest.fn().mockResolvedValue(mockLastSubmission);
    const result = await submissionServices.getNextSubmissionId();
    expect(prisma.submission.findFirst).toHaveBeenCalled();
    expect(result).toEqual('2');
  });
  it('should return "1" when there is no last submission', async () => {
    prisma.submission.findFirst = jest.fn().mockResolvedValue(null);
    const result = await submissionServices.getNextSubmissionId();
    expect(prisma.submission.findFirst).toHaveBeenCalled();
    expect(result).toEqual('1');
  });

  it('should throw an error if the database query fails', async () => {
    prisma.submission.findFirst = jest.fn().mockRejectedValue(new Error('Database query failed'));
    await expect(submissionServices.getNextSubmissionId()).rejects.toThrow('Database query failed');
    expect(prisma.submission.findFirst).toHaveBeenCalled();
  });
});

describe('getAuthorIdBySubmissionId', () => {
  it('should return the author id if the submission exists', async () => {
    const mockSubmissionId = 1;
    const mockAuthorId = 1;
    const mockSubmission = { id: mockSubmissionId, assignment: { authorId: mockAuthorId } };

    prisma.submission.findUnique = jest.fn().mockResolvedValue(mockSubmission);
    const result = await submissionServices.getAuthorIdBySubmissionId(mockSubmissionId);
    expect(prisma.submission.findUnique).toHaveBeenCalled();
    expect(result).toEqual(mockAuthorId);
  });

  it('should return null if the submission does not exist', async () => {
    const mockSubmissionId = 1;

    prisma.submission.findUnique = jest.fn().mockResolvedValue(null);
    const result = await submissionServices.getAuthorIdBySubmissionId(mockSubmissionId);
    expect(prisma.submission.findUnique).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should throw an error if the database query fails', async () => {
    const mockSubmissionId = 1;

    prisma.submission.findUnique = jest.fn().mockRejectedValue(new Error('Database query failed'));
    await expect(submissionServices.getAuthorIdBySubmissionId(mockSubmissionId)).rejects.toThrow(
      'Failed to retrieve author ID'
    );
    expect(prisma.submission.findUnique).toHaveBeenCalled();
  });
});

describe('getAuthorIdBySnapshotId', () => {
  it('should return the author id if the snapshot exists', async () => {
    const mockSnapshotId = 1;
    const mockSubmissionId = 1;
    const mockAuthorId = 1;
    const mockSnapshot = { id: mockSnapshotId, submissionId: mockSubmissionId };
    const mockSubmission = { id: mockSubmissionId, assignment: { authorId: mockAuthorId } };

    prisma.snapshot.findUnique = jest.fn().mockResolvedValue(mockSnapshot);
    prisma.submission.findUnique = jest.fn().mockResolvedValue(mockSubmission);
    const result = await submissionServices.getAuthorIdBySnapshotId(mockSnapshotId);
    expect(prisma.snapshot.findUnique).toHaveBeenCalled();
    expect(prisma.submission.findUnique).toHaveBeenCalled();
    expect(result).toEqual(mockAuthorId);
  });

  it('should return null if the snapshot does not exist', async () => {
    const mockSnapshotId = 1;

    prisma.snapshot.findUnique = jest.fn().mockResolvedValue(null);
    const result = await submissionServices.getAuthorIdBySnapshotId(mockSnapshotId);
    expect(prisma.snapshot.findUnique).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should throw an error if the database query fails', async () => {
    const mockSnapshotId = 1;

    prisma.snapshot.findUnique = jest.fn().mockRejectedValue(new Error('Database query failed'));
    await expect(submissionServices.getAuthorIdBySnapshotId(mockSnapshotId)).rejects.toThrow(
      'Failed to retrieve author ID'
    );
    expect(prisma.snapshot.findUnique).toHaveBeenCalled();
  });
});

describe('getUserEmailByStaffId', () => {
  it('should return the user email if the user exists', async () => {
    const mockStaffId = '1';
    const mockUser = { staff_id: mockStaffId, email: 'user@example.com' };

    prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
    const result = await submissionServices.getUserEmailByStaffId(mockStaffId);
    expect(prisma.user.findUnique).toHaveBeenCalled();
    expect(result).toEqual(mockUser.email);
  });
  it('should return null if the user does not exist', async () => {
    const mockStaffId = '1';

    prisma.user.findUnique = jest.fn().mockResolvedValue(null);
    const result = await submissionServices.getUserEmailByStaffId(mockStaffId);
    expect(prisma.user.findUnique).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should throw an error if the database query fails', async () => {
    const mockStaffId = '1';

    prisma.user.findUnique = jest.fn().mockRejectedValue(new Error('Database query failed'));
    await expect(submissionServices.getUserEmailByStaffId(mockStaffId)).rejects.toThrow(
      'Could not  fetch the user'
    );
    expect(prisma.user.findUnique).toHaveBeenCalled();
  });
});

describe('createSubmission', () => {
  it('should throw an error if the assignment is not assigned to the student', async () => {
    const mockAssignmentId = '1';
    const mockStudentId = 1;
    const mockSubmissionCode = 'code';
    const mockSnapshots = [{ name: 'snapshot1', filepath: 'path1' }];

    prisma.assignmentToUser.findMany = jest.fn().mockResolvedValue([]);

    await expect(
      submissionServices.createSubmission(
        mockAssignmentId,
        mockStudentId,
        mockSubmissionCode,
        mockSnapshots
      )
    ).rejects.toThrow('This assignment is not assigned to you');
  });
});

jest.mock('jsonwebtoken');

describe('Token functions', () => {
  const mockPayload = {
    id: 1,
    role: 'admin',
    invited: true,
    firstName: 'John',
    email: 'a@a.com'
  };

  it('should generate a token', () => {
    const token = '12345';
    (jwt.sign as jest.Mock).mockReturnValue(token);

    const result = generateToken(mockPayload);
    expect(result).toEqual(token);
    expect(jwt.sign).toHaveBeenCalledWith(mockPayload, initialVariables.jwt.secret_key, {
      expiresIn: '1h'
    });
  });

  it('should decode a token', () => {
    (jwt.verify as jest.Mock).mockImplementation((token, secretKey, callback) => {
      callback(null, mockPayload);
    });

    const result = decodeToken('12345');
    expect(jwt.verify).toHaveBeenCalledWith(
      '12345',
      initialVariables.jwt.secret_key,
      expect.any(Function)
    );
  });

  it('should throw an error when decoding a token', () => {
    const errorMessage = 'Invalid token';
    (jwt.verify as jest.Mock).mockImplementation((token, secretKey, callback) => {
      callback(new Error(errorMessage), null);
    });

    try {
      decodeToken('12345');
    } catch (err) {
      const error = err as Error;
      expect(error.message).toEqual(errorMessage);
    }

    expect(jwt.verify).toHaveBeenCalledWith(
      '12345',
      initialVariables.jwt.secret_key,
      expect.any(Function)
    );
  });
});
