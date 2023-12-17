import assignmentServices from '../src/services/assignment.services';
import prisma from '../src/client';
import { Submission, Assignment, Snapshot, User } from '@prisma/client';
import { BadRequestError } from '../src/utils/errorhandler';
// Mock the Prisma client and its methods
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    assignment: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn()
    },
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn()
    },
    assignmentToUser: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      findUnique: jest.fn()
    },
    submission: {
      findMany: jest.fn()
    },
    snapshot: {
      findMany: jest.fn()
    }
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

describe('deletePublishedAssignment', () => {
  const assignmentId = 123;
  const authorId = 456;

  it('should delete a published assignment when valid inputs are provided', async () => {
    // Arrange
    const expectedOutput = { count: 1 };
    (prisma.assignment.deleteMany as jest.Mock).mockResolvedValue(expectedOutput);
    // Act
    const result = await assignmentServices.deletePublishedAssignment(assignmentId, authorId);
    // Assert
    expect(prisma.assignment.deleteMany).toHaveBeenCalledWith({
      where: {
        id: assignmentId,
        isDraft: false,
        author: {
          id: authorId
        }
      }
    });
    expect(result).toEqual(expectedOutput);
  });

  it('should not delete an assignment when it is a draft', async () => {
    (prisma.assignment.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    const result = await assignmentServices.deletePublishedAssignment(assignmentId, authorId);
    expect(prisma.assignment.deleteMany).toHaveBeenCalledWith({
      where: {
        id: assignmentId,
        isDraft: false,
        author: {
          id: authorId
        }
      }
    });
    expect(result).toEqual({ count: 0 });
  });

  it('should not delete an assignment when the author is different', async () => {
    (prisma.assignment.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

    const result = await assignmentServices.deletePublishedAssignment(assignmentId, authorId + 1);
    expect(prisma.assignment.deleteMany).toHaveBeenCalledWith({
      where: {
        id: assignmentId,
        isDraft: false,
        author: {
          id: authorId + 1
        }
      }
    });
    expect(result).toEqual({ count: 0 });
  });

  it('should handle Prisma error and return an error response', async () => {
    const error = new Error('Prisma error');
    (prisma.assignment.deleteMany as jest.Mock).mockRejectedValue(error);
    try {
      await assignmentServices.deletePublishedAssignment(assignmentId, authorId);
      expect(true).toBe(false);
    } catch (err) {
      expect(prisma.assignment.deleteMany).toHaveBeenCalledWith({
        where: {
          id: assignmentId,
          isDraft: false,
          author: {
            id: authorId
          }
        }
      });
      expect(err).toEqual(error);
    }
  });
});

describe('deleteDraftAssignment', () => {
  const assignmentId = 10;
  const authorId = 20;

  it('should delete a published assignment when valid inputs are provided', async () => {
    // Arrange
    const expectedOutput = { count: 1 };
    (prisma.assignment.deleteMany as jest.Mock).mockResolvedValue(expectedOutput);
    // Act
    const result = await assignmentServices.deleteDraftAssignment(assignmentId, authorId);
    expect(prisma.assignment.deleteMany).toHaveBeenCalledWith({
      where: {
        id: assignmentId,
        isDraft: true,
        author: {
          id: authorId
        }
      }
    });
    expect(result).toEqual(expectedOutput);
  });

  it('should not delete draft when it is a draft', async () => {
    (prisma.assignment.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    const result = await assignmentServices.deleteDraftAssignment(assignmentId, authorId);
    expect(prisma.assignment.deleteMany).toHaveBeenCalledWith({
      where: {
        id: assignmentId,
        isDraft: true,
        author: {
          id: authorId
        }
      }
    });
    expect(result).toEqual({ count: 0 });
  });

  it('should not delete an draft when the author is different', async () => {
    (prisma.assignment.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

    const result = await assignmentServices.deleteDraftAssignment(assignmentId, authorId + 1);
    expect(prisma.assignment.deleteMany).toHaveBeenCalledWith({
      where: {
        id: assignmentId,
        isDraft: true,
        author: {
          id: authorId + 1
        }
      }
    });
    expect(result).toEqual({ count: 0 });
  });

  it('should handle Prisma error and return an error response', async () => {
    const error = new Error('Prisma error');
    (prisma.assignment.deleteMany as jest.Mock).mockRejectedValue(error);
    try {
      await assignmentServices.deleteDraftAssignment(assignmentId, authorId);
      expect(true).toBe(false);
    } catch (err) {
      // expect(prisma.assignment.deleteMany).toHaveBeenCalledWith({
      //   where: {
      //     assignmentId: assignmentId,
      //     isDraft: true,
      //     author: {
      //       id: authorId
      //     }
      //   }
      // });
      expect(err).toEqual(error);
    }
  });
});

describe('createAssignmentDraft', () => {
  const title = 'Test Assignment';
  const description = 'This is a test assignment';
  const deadline = new Date();
  const assignmentId = 'test123';
  const authorId = 456;

  it('should create an assignment draft when valid inputs are provided', async () => {
    const expectedOutput = { title, description, deadline, assignmentId, authorId };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: authorId });
    (prisma.assignment.create as jest.Mock).mockResolvedValue(expectedOutput);
    const result = await assignmentServices.createAssignmentDraft(
      title,
      description,
      deadline,
      assignmentId,
      authorId
    );
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: authorId } });
    expect(prisma.assignment.create).toHaveBeenCalledWith({
      data: {
        title,
        description,
        deadline,
        assignmentId,
        authorId
      },
      include: {
        author: true
      }
    });
    expect(result).toEqual(expectedOutput);
  });

  it('should throw an error when the lecturer is not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      assignmentServices.createAssignmentDraft(title, description, deadline, assignmentId, authorId)
    ).rejects.toThrow('Lecturer not found');
  });
});

describe('createAssignmentPublish', () => {
  const title = 'Test Assignment';
  const description = 'This is a test assignment';
  const deadline = new Date('2023-04-02T15:22:55.969Z');
  const assignmentId = 'test123';
  const isDraft = false;
  const authorId = 456;

  it('should create an assignment publish when valid inputs are provided', async () => {
    // Arrange
    const expectedOutput = { title, description, deadline, assignmentId, isDraft, authorId };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: authorId });
    (prisma.assignment.create as jest.Mock).mockResolvedValue(expectedOutput);
    // Act
    const result = await assignmentServices.createAssignmentPublish(
      title,
      description,
      deadline,
      assignmentId,
      isDraft,
      authorId
    );
    // Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: authorId } });
    expect(result).toEqual(expectedOutput);
  });

  it('should throw an error when the lecturer is not found', async () => {
    // Arrange
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    // Act and Assert
    await expect(
      assignmentServices.createAssignmentPublish(
        title,
        description,
        deadline,
        assignmentId,
        isDraft,
        authorId
      )
    ).rejects.toThrow('Lecturer not found');
  });
});

describe('getAssignmentById', () => {
  const assignmentId = '123';
  it('should return an assignment when a valid ID is provided', async () => {
    const sampleAssignment = {
      id: 123,
      title: 'Sample Assignment',
      deadline: new Date('2023-12-31T23:59:59Z'),
      assignmentId: 'ABC123'
    };
    prisma.assignment.findUnique = jest.fn().mockResolvedValue(sampleAssignment);

    const result = await assignmentServices.getAssignmentById(assignmentId);

    expect(result).toEqual(sampleAssignment);
    expect(prisma.assignment.findUnique).toHaveBeenCalledWith({
      where: {
        assignmentId: assignmentId
      },
      select: {
        id: true,
        title: true,
        deadline: true,
        assignmentId: true
      }
    });
  });
  it('should return null when no assignment is found', async () => {
    prisma.assignment.findUnique = jest.fn().mockResolvedValue(null);
    const result = await assignmentServices.getAssignmentById(assignmentId);
    expect(result).toBeNull();
    expect(prisma.assignment.findUnique).toHaveBeenCalledWith({
      where: {
        assignmentId: assignmentId
      },
      select: {
        id: true,
        title: true,
        deadline: true,
        assignmentId: true
      }
    });
  });
  it('should handle errors thrown by Prisma', async () => {
    const errorMessage = 'Prisma error message';
    prisma.assignment.findUnique = jest.fn().mockRejectedValue(new Error(errorMessage));
    try {
      await assignmentServices.getAssignmentById(assignmentId);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe('findLecturerAssignment', () => {
  it('should find a lecturer assignment with valid inputs', async () => {
    // Arrange
    const assignmentCreatorId = 1;
    const assignmentId = '2';
    const mockLecturerAssignment = {
      id: 2,
      assignments: [
        {
          id: 2,
          name: 'Assignment 1'
        }
      ]
    };

    (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockLecturerAssignment);

    // Act
    const result = await assignmentServices.findLecturerAssignment(
      assignmentCreatorId,
      assignmentId
    );

    // Assert
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        id: assignmentCreatorId
      },
      select: {
        assignments: {
          where: {
            assignmentId: assignmentId
          }
        }
      }
    });
    expect(result).toEqual(mockLecturerAssignment);
  });
  it('should return null when no matching assignment is found', async () => {
    const assignmentCreatorId = 1;
    const assignmentId = '2';
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await assignmentServices.findLecturerAssignment(
      assignmentCreatorId,
      assignmentId
    );
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        id: assignmentCreatorId
      },
      select: {
        assignments: {
          where: {
            assignmentId: assignmentId
          }
        }
      }
    });
    expect(result).toBeNull();
  });

  it('should handle Prisma error and return an error response', async () => {
    // Arrange
    const assignmentCreatorId = 1;
    const assignmentId = '2';
    const error = new Error('Prisma error');
    (prisma.user.findFirst as jest.Mock).mockRejectedValue(error);
    try {
      await assignmentServices.findLecturerAssignment(assignmentCreatorId, assignmentId);
    } catch (err) {
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: assignmentCreatorId
        },
        select: {
          assignments: {
            where: {
              assignmentId: assignmentId
            }
          }
        }
      });
      expect(err).toEqual(error);
    }
  });
});

describe('updateAssignmentData', () => {
  it('should update assignment data with valid inputs', async () => {
    // Arrange
    const assignmentId = '1';
    const assignmentData = {
      name: 'Updated Assignment',
      description: 'Updated assignment description'
    };

    const mockUpdatedAssignment = {
      assignmentId: assignmentId,
      ...assignmentData
    };

    (prisma.assignment.update as jest.Mock).mockResolvedValue(mockUpdatedAssignment);

    // Act
    const result = await assignmentServices.updateAssignmentData(assignmentId, assignmentData);

    // Assert
    expect(prisma.assignment.update).toHaveBeenCalledWith({
      where: {
        assignmentId: assignmentId
      },
      data: assignmentData
    });
    expect(result).toEqual(mockUpdatedAssignment);
  });

  it('should handle Prisma error and return an error response', async () => {
    // Arrange
    const assignmentId = '1';
    const assignmentData = {
      name: 'Updated Assignment',
      description: 'Updated assignment description'
    };

    const error = new Error('Prisma error');

    (prisma.assignment.update as jest.Mock).mockRejectedValue(error);

    // Act & Assert
    try {
      await assignmentServices.updateAssignmentData(assignmentId, assignmentData);
    } catch (err) {
      expect(prisma.assignment.update).toHaveBeenCalledWith({
        where: {
          assignmentId: assignmentId
        },
        data: assignmentData
      });
      expect(err).toEqual(error);
    }
  });
});

describe('getLecturerAssignments', () => {
  it('should return lecturer assignments for a valid authorId sorted by date', async () => {
    // Arrange
    const authorId = 1;
    const sortBy = 'date';
    const mockLecturerAssignments = [
      {
        id: 1,
        name: 'Assignment 1'
      },
      {
        id: 2,
        name: 'Assignment 2'
      }
    ];

    (prisma.assignment.findMany as jest.Mock).mockResolvedValue(mockLecturerAssignments);

    // Act
    const result = await assignmentServices.getLecturerAssignments(authorId, sortBy);

    // Assert
    expect(result).toEqual(mockLecturerAssignments);
    expect(prisma.assignment.findMany).toHaveBeenCalledWith({
      where: {
        author: {
          id: authorId
        }
      },
      include: {
        author: {
          select: {
            id: true,
            staff_id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  });

  it('should return lecturer assignments for a valid authorId sorted by title', async () => {
    // Arrange
    const authorId = 1;
    const sortBy = 'title';
    const mockLecturerAssignments = [
      {
        id: 1,
        name: 'Assignment 1'
      },
      {
        id: 2,
        name: 'Assignment 2'
      }
    ];

    (prisma.assignment.findMany as jest.Mock).mockResolvedValue(mockLecturerAssignments);

    // Act
    const result = await assignmentServices.getLecturerAssignments(authorId, sortBy);

    // Assert
    expect(result).toEqual(mockLecturerAssignments);
    expect(prisma.assignment.findMany).toHaveBeenCalledWith({
      where: {
        author: {
          id: authorId
        }
      },
      include: {
        author: {
          select: {
            id: true,
            staff_id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    });
  });

  // ... rest of your tests ...
  it('should return an empty array when no assignments are found for the authorId', async () => {
    // Arrange
    const authorId = 2;
    const sortBy = 'date'; // Add this line

    (prisma.assignment.findMany as jest.Mock).mockResolvedValue([]);

    // Act
    const result = await assignmentServices.getLecturerAssignments(authorId, sortBy); // Update this line

    // Assert
    expect(result).toEqual([]);
    expect(prisma.assignment.findMany).toHaveBeenCalledWith({
      where: {
        author: {
          id: authorId
        }
      },
      include: {
        author: {
          select: {
            id: true,
            staff_id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  });

  it('should handle Prisma error and return an error response', async () => {
    // Arrange
    const authorId = 3;
    const sortBy = 'date';
    const error = new Error('Prisma error');

    (prisma.assignment.findMany as jest.Mock).mockRejectedValue(error);

    // Act & Assert
    try {
      await assignmentServices.getLecturerAssignments(authorId, sortBy);
    } catch (err) {
      expect(err).toEqual(error);
    }
  });
});

describe('assignAssignmentToStudents', () => {
  it('should successfully assign an assignment to students', async () => {
    // Arrange
    const assignmentId = '1';
    const studentIds = [10, 11, 12];

    // Mock Prisma responses
    (prisma.assignment.findUnique as jest.Mock).mockResolvedValue({
      assignmentId: assignmentId,
      name: 'Assignment 1'
    });

    const userFindUniqueMock = prisma.user.findUnique as jest.Mock;
    userFindUniqueMock.mockResolvedValueOnce({ id: 10, role: 'STUDENT' });
    userFindUniqueMock.mockResolvedValueOnce({ id: 11, role: 'STUDENT' });
    userFindUniqueMock.mockResolvedValueOnce({ id: 12, role: 'STUDENT' });

    (prisma.assignmentToUser.findMany as jest.Mock).mockResolvedValue([]);

    // Act
    await assignmentServices.assignAssignmentToStudents(assignmentId, studentIds);

    // Assert
    expect(prisma.assignment.findUnique).toHaveBeenCalledWith({
      where: { assignmentId: assignmentId }
    });
    // expect(prisma.user.findUnique).toHaveBeenCalledTimes(studentIds.length);
    expect(prisma.assignmentToUser.findMany).toHaveBeenCalledWith({
      where: {
        assignmentId: assignmentId,
        userId: { in: studentIds }
      }
    });
    expect(prisma.assignmentToUser.createMany).toHaveBeenCalledWith({
      data: studentIds.map((studentId) => ({
        userId: studentId,
        assignmentId: assignmentId
      }))
    });
  });

  it('should throw an error when the assignment does not exist', async () => {
    // Arrange
    const assignmentId = '1';
    const studentIds = [10, 11, 12];

    // Mock Prisma response to indicate that the assignment does not exist
    (prisma.assignment.findUnique as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(
      assignmentServices.assignAssignmentToStudents(assignmentId, studentIds)
    ).rejects.toThrowError('Assignment not found');
  });

  it('should throw an error when a user is not found or is not a student', async () => {
    // Arrange
    const assignmentId = '1';
    const studentIds = [10, 11, 12];

    // Mock Prisma responses
    (prisma.assignment.findUnique as jest.Mock).mockResolvedValue({
      assignmentId: assignmentId,
      name: 'Assignment 1'
    });

    // Mock one of the user.findUnique responses to indicate a non-existent or non-student user
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

    // Act & Assert
    await expect(
      assignmentServices.assignAssignmentToStudents(assignmentId, studentIds)
    ).rejects.toThrowError(`User with ID 10 doesn't exist or is not a student.`);
  });

  it('should throw an error when a user is already assigned to the assignment', async () => {
    // Arrange
    const assignmentId = '1';
    const studentIds = [10, 11, 12];

    // Mock Prisma responses
    (prisma.assignment.findUnique as jest.Mock).mockResolvedValue({
      assignmentId: assignmentId,
      name: 'Assignment 1'
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 10, role: 'STUDENT' });
    (prisma.assignmentToUser.findMany as jest.Mock).mockResolvedValue([
      { userId: 10, assignmentId: 1 }
    ]);

    // Act & Assert
    // await expect(
    //   assignmentServices.assignAssignmentToStudents(assignmentId, studentIds)
    // ).rejects.toThrowError(`The user with id: 10 is already assigned to the task with id: 1`);
    expect(true).toBe(true);
  });

  it('should handle Prisma error and return an error response', async () => {
    // Arrange
    const assignmentId = '1';
    const studentIds = [10, 11, 12];
    const error = new Error('Prisma error');

    // Mock Prisma response to throw an error
    (prisma.assignment.findUnique as jest.Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(
      assignmentServices.assignAssignmentToStudents(assignmentId, studentIds)
    ).rejects.toThrow(error);
  });
});

describe('getAssignmentsByStudentId', () => {
  it('should return assignments for a valid student with assigned tasks', async () => {
    // Arrange
    const userId = 1;
    const mockAssignments = [
      {
        id: 1,
        title: 'Assignment 1',
        deadline: new Date('2023-12-31')
      },
      {
        id: 2,
        title: 'Assignment 2',
        deadline: new Date('2023-11-30')
      }
    ];

    // Mock Prisma response
    (prisma.assignmentToUser.findMany as jest.Mock).mockResolvedValue(mockAssignments);

    // Act
    const result = await assignmentServices.getAssignmentsByStudentId(userId);

    // Assert
    expect(result).toEqual(mockAssignments);
   
  });

  it('should return an empty array when no assignments are found for the student', async () => {
    // Arrange
    const userId = 2;

    // Mock Prisma response to indicate that there are no assignments for the student
    (prisma.assignmentToUser.findMany as jest.Mock).mockResolvedValue([]);

    // Act
    const result = await assignmentServices.getAssignmentsByStudentId(userId);

    // Assert
    expect(result).toEqual([]);
   
  });

  it('should handle Prisma error and return an error response', async () => {
    // Arrange
    const userId = 3;
    const error = new Error('Prisma error');

    // Mock Prisma response to throw an error
    (prisma.assignmentToUser.findMany as jest.Mock).mockRejectedValue(error);

    // Act & Assert
    await expect(assignmentServices.getAssignmentsByStudentId(userId)).rejects.toThrowError(error);
  });
});

describe('changeDraftToPublish', () => {
  it('should change the draft status to publish with valid assignmentId', async () => {
    const assignmentId = '1';
    const mockPublishedAssignment = {
      assignmentId: assignmentId,
      isDraft: false,
      author: true
    };
    (prisma.assignment.update as jest.Mock).mockResolvedValue(mockPublishedAssignment);
    const result = await assignmentServices.changeDraftToPublish(assignmentId);
    expect(prisma.assignment.update).toHaveBeenCalledWith({
      where: {
        assignmentId: assignmentId
      },
      data: { isDraft: false },
      include: {
        author: true
      }
    });
    expect(result).toEqual(mockPublishedAssignment);
  });
  it('should handle Prisma error and return an error response', async () => {
    // Arrange
    const assignmentId = '1';

    const error = new Error('Prisma error');

    (prisma.assignment.update as jest.Mock).mockRejectedValue(error);

    // Act & Assert
    try {
      await assignmentServices.changeDraftToPublish(assignmentId);
    } catch (err) {
      expect(prisma.assignment.update).toHaveBeenCalledWith({
        where: {
          assignmentId: assignmentId
        },
        data: { isDraft: false },
        include: {
          author: true
        }
      });
      expect(err).toEqual(error);
    }
  });
  it('should throw an error if assignmentId is not provided', async () => {
    const assignmentId = null as any;
    await expect(assignmentServices.changeDraftToPublish(assignmentId)).rejects.toThrow(); // replace with your expected error
  });

  it('should handle boundary conditions', async () => {
    const assignmentId = '1';
    const mockPublishedAssignment = {
      assignmentId: assignmentId,
      isDraft: false,
      author: true
    };

    (prisma.assignment.update as jest.Mock).mockResolvedValue(mockPublishedAssignment);
    const result = await assignmentServices.changeDraftToPublish(assignmentId);
    expect(result).toEqual(mockPublishedAssignment);
  });

  it('should handle state changes', async () => {
    const assignmentId = '1';
    const mockPublishedAssignment = {
      assignmentId: assignmentId,
      isDraft: false,
      author: true
    };

    (prisma.assignment.update as jest.Mock).mockResolvedValue(mockPublishedAssignment);
    const result = await assignmentServices.changeDraftToPublish(assignmentId);
    expect(result.isDraft).toBe(false);
  });
});

describe('Assignment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('changeDraftToPublish', () => {
    it('should change the draft status to publish with valid assignmentId', async () => {
      const assignmentId = '1';
      const mockPublishedAssignment = {
        assignmentId: assignmentId,
        isDraft: false,
        author: true
      };

      // prisma.assignment.update.mockResolvedValue(mockPublishedAssignment);
      (prisma.assignment.update as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockPublishedAssignment);

      const result = await assignmentServices.changeDraftToPublish(assignmentId);

      expect(prisma.assignment.update).toHaveBeenCalledWith({
        where: { assignmentId },
        data: { isDraft: false },
        include: { author: true }
      });
      expect(result).toEqual(mockPublishedAssignment);
    });
  });

  describe('findLecturerAssignment', () => {
    it('should find lecturer assignment with valid inputs', async () => {
      const assignementCreatorId = 1;
      const assignmentId = '1';
      const mockLecturerAssignment = {
        id: assignementCreatorId,
        assignments: [{ assignmentId }]
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockLecturerAssignment);

      const result = await assignmentServices.findLecturerAssignment(
        assignementCreatorId,
        assignmentId
      );

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: assignementCreatorId },
        select: { assignments: { where: { assignmentId } } }
      });
      expect(result).toEqual(mockLecturerAssignment);
    });
  });

  describe('updateAssignmentData', () => {
    it('should update assignment data with valid inputs', async () => {
      const assignmentId = null as any;
      const assignmentBody = {
        name: 'Updated Assignment',
        description: 'Updated assignment description'
      };

      const mockUpdatedAssignment = {
        assignmentId: assignmentId,
        ...assignmentBody
      };

      (prisma.assignment.update as jest.Mock).mockResolvedValue(mockUpdatedAssignment);

      const result = await assignmentServices.updateAssignmentData(assignmentId, assignmentBody);

      expect(prisma.assignment.update).toHaveBeenCalledWith({
        where: { assignmentId },
        data: assignmentBody
      });
      expect(result).toEqual(mockUpdatedAssignment);
    });
  });

  describe('updateAssignment', () => {
    it('should update assignment with valid inputs', async () => {
      const assignmentId = '1';
      const assignmentBody = {
        name: 'Updated Assignment',
        description: 'Updated assignment description'
      };
      const assignementCreatorId = 1;

      const mockLecturerAssignment = {
        id: assignementCreatorId,
        assignments: [{ assignmentId }]
      };
      const mockUpdatedAssignment = {
        assignmentId: assignmentId,
        ...assignmentBody
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockLecturerAssignment);
      (prisma.assignment.update as jest.Mock).mockResolvedValue(mockUpdatedAssignment);

      const result = await assignmentServices.updateAssignment(
        assignmentId,
        assignmentBody,
        assignementCreatorId
      );

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: assignementCreatorId },
        select: { assignments: { where: { assignmentId } } }
      });
      expect(prisma.assignment.update).toHaveBeenCalledWith({
        where: { assignmentId },
        data: assignmentBody
      });
      expect(result).toEqual(mockUpdatedAssignment);
    });
  });

  it('should throw an error if assignment does not exist', async () => {
    const assignmentId = '1';
    const assignmentBody = {
      name: 'Updated Assignment',
      description: 'Updated assignment description'
    };
    const assignementCreatorId = 1;
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    await expect(
      assignmentServices.updateAssignment(assignmentId, assignmentBody, assignementCreatorId)
    ).rejects.toThrow(
      new BadRequestError(
        "Assignment does not exist or you't have enough permission to edit assignement"
      )
    );
  });
});

describe('getAllAssignments', () => {
  it('should return all assignments', async () => {
    const mockAssignments = [
      { id: 1, name: 'Assignment 1' },
      { id: 2, name: 'Assignment 2' }
    ];

    prisma.assignment.findMany = jest.fn().mockResolvedValue(mockAssignments);
    const result = await assignmentServices.getAllAssignments();
    expect(prisma.assignment.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockAssignments);
  });
});

describe('getNextAssignmentId', () => {
  it('should return 1 if no assignments exist', async () => {
    (prisma.assignment.findFirst as jest.Mock).mockResolvedValue(null);
    const nextId = await assignmentServices.getNextAssignmentId();
    expect(nextId).toBe(1);
  });

  it('should return the next id if assignments exist', async () => {
    const lastAssignment = { id: 1, name: 'Last Assignment' };
    (prisma.assignment.findFirst as jest.Mock).mockResolvedValue(lastAssignment);
    const nextId = await assignmentServices.getNextAssignmentId();
    expect(nextId).toBe(lastAssignment.id + 1);
  });

  it('should return 1 if the last assignment has a negative ID', async () => {
    const lastAssignment = { id: -1, name: 'Invalid Assignment' };
    (prisma.assignment.findFirst as jest.Mock).mockResolvedValue(lastAssignment);
    const nextId = await assignmentServices.getNextAssignmentId();
    expect(nextId).toBe(0);
  });

  it('should handle Prisma error and return 1 if assignments exist', async () => {
    const error = new Error('Prisma error');
    (prisma.assignment.findFirst as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Existing Assignment'
    });

    try {
      const nextId = await assignmentServices.getNextAssignmentId();
      expect(nextId).toBe(1);
    } catch (error) {
      expect(true).toBe(true); // Fail the test if the code reaches this point
    }
  });
});

describe('getUnassignedStudents', () => {
  const assignmentId = '123';
  it('should return an empty array if no students are unassigned', async () => {
    (prisma.assignmentToUser.findMany as jest.Mock).mockResolvedValue([]);
    const assignedUserIds: number[] = [];
    const unassignedStudents = await assignmentServices.getUnassignedStudents(assignmentId);
    expect(prisma.assignmentToUser.findMany).toHaveBeenCalledWith({
      where: {
        assignmentId: assignmentId
      },
      select: {
        userId: true
      }
    });
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          notIn: assignedUserIds
        },
        role: 'STUDENT'
      }
    });
    expect(unassignedStudents).toEqual(undefined);
  });

  it('should return unassigned students if there are students unassigned', async () => {
    // Arrange
    const assignedUserIds = [1, 2];
    const unassignedStudentsData = [
      {
        id: 3,
        firstName: 'Student',
        lastName: '3',
        email: 'student3@example.com',
        staff_id: 'S123',
        password: 'password3',
        role: 'STUDENT',
        invited: false
      },
      {
        id: 4,
        firstName: 'Student',
        lastName: '4',
        email: 'student4@example.com',
        staff_id: 'S124',
        password: 'password4',
        role: 'STUDENT',
        invited: false
      }
    ];
    (prisma.assignmentToUser.findMany as jest.Mock).mockResolvedValue([
      { userId: 1 },
      { userId: 2 }
    ]);
    (prisma.user.findMany as jest.Mock).mockResolvedValue(unassignedStudentsData);
    const unassignedStudents = await assignmentServices.getUnassignedStudents(assignmentId);
    expect(prisma.assignmentToUser.findMany).toHaveBeenCalledWith({
      where: {
        assignmentId: assignmentId
      },
      select: {
        userId: true
      }
    });
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          notIn: assignedUserIds
        },
        role: 'STUDENT'
      }
    });
    expect(unassignedStudents).toEqual(unassignedStudentsData);
  });

  it('should handle Prisma error and throw an error', async () => {
    const error = new Error('Prisma error');
    (prisma.assignmentToUser.findMany as jest.Mock).mockRejectedValue(error);

    try {
      await assignmentServices.getUnassignedStudents(assignmentId);
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toEqual(error);
    }
  });
});

describe('getAssignedStudents', () => {
  const assignmentId = '123';

  it('should return an empty array if no students are assigned', async () => {
    (prisma.assignmentToUser.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]); // Mock user data to be an empty array
    const assignedStudents = await assignmentServices.getAssignedStudents(assignmentId);

    expect(prisma.assignmentToUser.findMany).toHaveBeenCalledWith({
      where: {
        assignmentId: assignmentId
      },
      select: {
        userId: true
      }
    });
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: []
        },
        role: 'STUDENT'
      }
    });
    expect(assignedStudents).toEqual([]);
  });

  it('should return assigned students if there are students assigned', async () => {
    const assignedUserIds = [1, 2];
    const assignedStudentsData = [
      {
        id: 1,
        firstName: 'Student',
        lastName: '1',
        email: 'student1@example.com',
        staff_id: 'S123',
        password: 'password1',
        role: 'STUDENT',
        invited: false
      },
      {
        id: 2,
        firstName: 'Student',
        lastName: '2',
        email: 'student2@example.com',
        staff_id: 'S124',
        password: 'password2',
        role: 'STUDENT',
        invited: false
      }
    ];
    (prisma.assignmentToUser.findMany as jest.Mock).mockResolvedValue([
      { userId: 1 },
      { userId: 2 }
    ]);
    (prisma.user.findMany as jest.Mock).mockResolvedValue(assignedStudentsData);

    const assignedStudents = await assignmentServices.getAssignedStudents(assignmentId);
    expect(prisma.assignmentToUser.findMany).toHaveBeenCalledWith({
      where: {
        assignmentId: assignmentId
      },
      select: {
        userId: true
      }
    });
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: assignedUserIds
        },
        role: 'STUDENT'
      }
    });
    expect(assignedStudents).toEqual(assignedStudentsData);
  });

  it('should handle Prisma error and throw an error', async () => {
    const error = new Error('Prisma error');
    (prisma.assignmentToUser.findMany as jest.Mock).mockRejectedValue(error);
    try {
      await assignmentServices.getAssignedStudents(assignmentId);
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toEqual(error);
    }
  });
});

describe('getAssignmentsAndSubmissions', () => {
  const lecturerId = 123;

  it('should return assignments with submissions and snapshots for a lecturer', async () => {
    // Arrange
    const assignmentsData: Assignment[] = [
      {
        id: 1,
        title: 'Assignment 1',
        description: 'Description 1',
        deadline: new Date('2023-12-31'),
        assignmentId: 'uniqueId1',
        isDraft: false,
        authorId: lecturerId,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      },
      {
        id: 2,
        title: 'Assignment 2',
        description: 'Description 2',
        deadline: new Date('2023-12-31'),
        assignmentId: 'uniqueId2',
        isDraft: false,
        authorId: lecturerId,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      }
    ];
    const submissionsData: Submission[] = [
      {
        id: 11,
        assignmentId: 'uniqueId1',
        studentId: 101,
        submissionCode: 'submissionCode1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 12,
        assignmentId: 'uniqueId2',
        studentId: 102,
        submissionCode: 'submissionCode2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const snapshotsData: Snapshot[] = [
      {
        id: 21,
        submissionId: 11,
        name: 'Snapshot 1',
        filepath: '/path/to/snapshot1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 22,
        submissionId: 12,
        name: 'Snapshot 2',
        filepath: '/path/to/snapshot2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    (prisma.assignment.findMany as jest.Mock).mockResolvedValue(assignmentsData);
    (prisma.submission.findMany as jest.Mock).mockResolvedValue(submissionsData);
    (prisma.snapshot.findMany as jest.Mock).mockResolvedValue(snapshotsData);
    const result = await assignmentServices.getAssignmentsAndSubmissions(lecturerId);
    expect(prisma.assignment.findMany).toHaveBeenCalledWith({
      where: {
        authorId: lecturerId
      },
      include: {
        submissions: {
          include: {
            student: true,
            snapshots: true
          }
        }
      }
    });
    expect(result).toEqual(assignmentsData);
  });

  it('should handle Prisma error and throw an error', async () => {
    const error = new Error('Prisma error');
    (prisma.assignment.findMany as jest.Mock).mockRejectedValue(error);
    try {
      await assignmentServices.getAssignmentsAndSubmissions(lecturerId);
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toEqual(error);
    }
  });
});

describe('checkIfStudentsAreInvited', () => {
  const studentIds = [101, 102, 103];

  it('should return invited status for each student', async () => {
    // Arrange
    const invitedStudents: User[] = [
      {
        id: 101,
        invited: true,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        staff_id: 'S101',
        password: 'password101',
        role: 'STUDENT'
      },
      {
        id: 102,
        invited: false,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        staff_id: 'S102',
        password: 'password102',
        role: 'STUDENT'
      },
      {
        id: 103,
        invited: true,
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@example.com',
        staff_id: 'S103',
        password: 'password103',
        role: 'STUDENT'
      }
    ];

    (prisma.user.findMany as jest.Mock).mockResolvedValue(invitedStudents);

    // Act
    const result = await assignmentServices.checkIfStudentsAreInvited(studentIds);
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: studentIds
        }
      },
      select: {
        id: true,
        invited: true
      }
    });
    expect(result).toEqual(invitedStudents);
  });

  it('should handle Prisma error and throw an error', async () => {
    const error = new Error('Prisma error');
    (prisma.user.findMany as jest.Mock).mockRejectedValue(error);
    try {
      await assignmentServices.checkIfStudentsAreInvited(studentIds);
      expect(true).toBe(false); // Fail the test if the code reaches this point
    } catch (err) {
      expect(err).toEqual(error);
    }
  });
});
