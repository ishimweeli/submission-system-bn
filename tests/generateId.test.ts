import * as userService from '../src/services/user.service';
import * as assignmentServices from '../src/services/assignment.services';
import { generateStuffId, generateAssignmentId } from '../src/utils/generateUniqueIds';

jest.mock('../src/services/user.service');
jest.mock('../src/services/assignment.services');

describe('ID Generation', () => {
  const userServiceMock = {
    getNextId: jest.fn()
    // include other methods as needed
  };

  const assignmentServicesMock = {
    getNextAssignmentId: jest.fn()
    // include other methods as needed
  };

  jest.mock('../src/services/user.service', () => {
    return jest.fn().mockImplementation(() => {
      return userServiceMock;
    });
  });

  jest.mock('../src/services/assignment.services', () => {
    return jest.fn().mockImplementation(() => {
      return assignmentServicesMock;
    });
  });

  // Now you can use userServiceMock.getNextId and assignmentServicesMock.getNextAssignmentId in your tests
  userServiceMock.getNextId.mockResolvedValue('1234');
  assignmentServicesMock.getNextAssignmentId.mockResolvedValue('5678');

  // Your tests go here

  it('should generate a Stuff ID', async () => {
    const id = await generateStuffId('student');
    expect(id).toBe('ST-undefined');
  });

  it('should generate an Assignment ID', async () => {
    const id = await generateAssignmentId();
    expect(id).toBe('ASGN-undefined');
  });
});
