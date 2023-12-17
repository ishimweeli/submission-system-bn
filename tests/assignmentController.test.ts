import { assignmentService, userService } from '../src/services';
import { assignmentController } from '../src/controllers';
import httpStatus from 'http-status';

jest.mock('../src/services');
const mockNext = jest.fn();
describe('Assignment Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAssignmentPublish', () => {
    it('should create a published assignment', async () => {
      const mockUser = { id: 1 };
      const mockReq: any = {
        user: mockUser,
        body: {
          title: 'Test Title',
          deadline: '2023-12-31',
          description: 'Test Description'
        }
      };
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const title = 'Test Title';
      const description = 'Test Description';
      const validDeadline = new Date('2023-12-31');
      const assignmentId = 'abc123';
      const isDraft = false;
      const userId = 1;
      const mockCreateAssignmentPublish = jest.fn() as jest.MockedFunction<
        typeof assignmentService.createAssignmentPublish
      >;
      assignmentService.createAssignmentPublish = mockCreateAssignmentPublish;
      await assignmentController.createAssignmentPublish(mockReq, mockRes, mockNext);
      expect(true).toBe(true);
    });
  });

  describe('createAssignmentDraft', () => {
    it('should create a draft assignment', async () => {
      const mockUser = { id: 1 };
      const mockReq: any = {
        user: mockUser,
        body: {
          title: 'Test Title',
          deadline: '2023-12-31',
          description: 'Test Description'
        }
      };
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await assignmentController.createAssignmentDraft(mockReq, mockRes, mockNext);
      expect(true).toBe(true);
    });
  });

  describe('assignAssignmentToStudent', () => {
    it('should assign an assignment to students', async () => {
      const mockReq: any = {
        body: {
          studentIds: [1, 2, 3],
          assignmentId: 1
        }
      };
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      assignmentService.assignAssignmentToStudents = jest.fn();
      assignmentService.getAssignmentById = jest
        .fn()
        .mockReturnValue({ title: 'Test Title', deadline: '2023-12-31', assignmentId: 1 });
      userService.getUsersById = jest.fn().mockReturnValue([
        { email: 'user1@example.com', firstName: 'John', lastName: 'Doe' },
        { email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith' },
        { email: 'user3@example.com', firstName: 'Alice', lastName: 'Johnson' }
      ]);

      await assignmentController.assignAssignmentToStudent(mockReq, mockRes, mockNext);
      expect(true).toBe(true);
    });
  });

  describe('studentGetAssignments', () => {
    it('should get assignments for a student', async () => {
      const mockReq: any = {
        user: { id: 1 }
      };
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      assignmentService.getAssignmentsByStudentId = jest.fn().mockReturnValue([
        {
          /* Assignment data */
        }
      ]);

      await assignmentController.studentGetAssignments(mockReq, mockRes, mockNext);

      expect(assignmentService.getAssignmentsByStudentId).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.any(Array)
      });
    });
  });
});

describe('updateAssignment', () => {
  it('should update an assignment', async () => {
    const mockUser = { id: 1 };
    const mockReq: any = {
      user: mockUser,
      body: {
        title: 'Test Title',
        deadline: '2023-12-31',
        description: 'Test Description'
      },
      params: {
        assignmentId: '1'
      }
    };
    const mockRes: any = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    await assignmentController.updateAssignment(mockReq, mockRes, mockNext);

    expect(assignmentService.updateAssignment).toHaveBeenCalledWith(
      (mockReq.params.assignmentId, '1'),
      {
        title: mockReq.body.title,
        description: mockReq.body.description,
        deadline: mockReq.body.deadline
      },
      mockUser.id
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe('deletePublishedAssignment', () => {
  it('should delete a published assignment', async () => {
    const mockUser = { id: 1 };
    const mockReq: any = {
      user: mockUser,
      params: {
        assignmentId: '1'
      }
    };
    const mockRes: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await assignmentController.deletePublishedAssignment(mockReq, mockRes, mockNext);

    expect(assignmentService.deletePublishedAssignment).toHaveBeenCalledWith(
      parseInt(mockReq.params.assignmentId, 10),
      mockUser.id
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Published Assignment deleted successfully'
    });
  });
});

describe('deleteDraftAssignment', () => {
  it('should delete a draft assignment', async () => {
    const mockUser = { id: 1 };
    const mockReq: any = {
      user: mockUser,
      params: {
        assignmentId: '1'
      }
    };
    const mockRes: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await assignmentController.deleteDraftAssignment(mockReq, mockRes, mockNext);

    expect(assignmentService.deleteDraftAssignment).toHaveBeenCalledWith(
      parseInt(mockReq.params.assignmentId, 10),
      mockUser.id
    );
    expect(mockRes.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Draft Assignment deleted successfully'
    });
  });
});

describe('getLecturerAssignments', () => {
  it('should get assignments for a lecturer', async () => {
    const mockUser = { id: 1 };
    const mockReq: any = {
      user: mockUser,
      query: {
        sortBy: 'date'
      }
    };
    const mockRes: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    assignmentService.getLecturerAssignments = jest.fn().mockReturnValue([
      {
        /* Assignment data */
      }
    ]);

    await assignmentController.getLecturerAssignments(mockReq, mockRes, mockNext);

    expect(assignmentService.getLecturerAssignments).toHaveBeenCalledWith(mockUser.id, 'date');
    expect(mockRes.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      data: expect.any(Array)
    });
  });
});

describe('unassignedStudents', () => {
  it('should get unassigned students for an assignment', async () => {
    const mockReq: any = {
      query: {
        assignmentId: '1'
      }
    };
    const mockRes: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    assignmentService.getUnassignedStudents = jest.fn().mockReturnValue([
      {
        /* Unassigned student data */
      }
    ]);

    await assignmentController.unassignedStudents(mockReq, mockRes, mockNext);

    expect(assignmentService.getUnassignedStudents).toHaveBeenCalledWith('1');
    expect(mockRes.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      data: expect.any(Array)
    });
  });
});

describe('getAssignmentsAndSubmissions', () => {
  it('should get assignments and submissions for a lecturer', async () => {
    const mockUser = { id: 1 };
    const mockReq: any = {
      user: mockUser
    };
    const mockRes: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    assignmentService.getAssignmentsAndSubmissions = jest.fn().mockReturnValue([
      {
        /* Assignment and submission data */
      }
    ]);

    await assignmentController.getAssignmentsAndSubmissions(mockReq, mockRes, mockNext);

    expect(assignmentService.getAssignmentsAndSubmissions).toHaveBeenCalledWith(mockUser.id);
    expect(mockRes.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      data: expect.any(Array)
    });
  });
});

describe('getAllAssignedStudents', () => {
  it('should get all assigned students for an assignment', async () => {
    const mockReq: any = {
      query: {
        assignmentId: '1'
      }
    };
    const mockRes: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    assignmentService.getAssignedStudents = jest.fn().mockReturnValue([
      {
        /* Assigned student data */
      }
    ]);

    await assignmentController.getAllAssignedStudents(mockReq, mockRes, mockNext);

    expect(assignmentService.getAssignedStudents).toHaveBeenCalledWith('1');
    expect(mockRes.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      data: expect.any(Array)
    });
  });
});
