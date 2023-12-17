import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { assignmentToUser } from '../src/services';
import assignmentToUserController from '../src/controllers/assignmentToUserController';
import { NotFoundError, BadRequestError } from '../src/utils/errorhandler';

// Mocking assignmentToUser.getAssignmentWithUsers
jest.mock('../src/services/assignmentsToUser', () => ({
  getAssignmentWithUsers: jest.fn()
}));

describe('AssignmentIdWithStudents', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = {
      query: {
        assignmentId: '1'
      }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
  });

  it('should return assignment with students if it exists', async () => {
    const mockAssignmentWithStudents = {
      assignmentId: '1',
      AssignmentToUser: [{ user: { id: 1 } }]
    };
    (assignmentToUser.getAssignmentWithUsers as jest.Mock).mockResolvedValue(
      mockAssignmentWithStudents
    );

    await assignmentToUserController.AssignmentIdWithStudents(mockReq, mockRes);

    expect(assignmentToUser.getAssignmentWithUsers).toHaveBeenCalledWith('1');
    expect(mockRes.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      data: mockAssignmentWithStudents
    });
  });

  it('should handle other errors with internal server error', async () => {
    (assignmentToUser.getAssignmentWithUsers as jest.Mock).mockRejectedValue(
      new Error('Some internal error')
    );

    await assignmentToUserController.AssignmentIdWithStudents(mockReq, mockRes);

    expect(assignmentToUser.getAssignmentWithUsers).toHaveBeenCalledWith('1');
    expect(mockRes.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'failed',
      message: expect.objectContaining({
        name: 'Error',
        message: 'Some internal error'
      })
    });
  });
});
