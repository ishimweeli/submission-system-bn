import assignmentServices from '../services/assignment.services';
import { submissionService, userService } from '../services';

export const generateStuffId = async (entityType: string): Promise<string> => {
  const entityTypeLower = entityType.toLowerCase();
  const prefixMap = {
    student: 'ST',
    lecturer: 'LEC',
    admin: 'AD'
  };
  const prefix = prefixMap[entityTypeLower];
  const id = await userService.getNextId();
  return `${prefix}-${id}`;
};

export const generateAssignmentId = async (): Promise<string> => {
  const id = await assignmentServices.getNextAssignmentId();
  return `ASGN-${id}`;
};

export const generateSubmissionCode = async (): Promise<string> => {
  const id = await submissionService.getNextSubmissionId();
  return `SUB-${id}`;
};
