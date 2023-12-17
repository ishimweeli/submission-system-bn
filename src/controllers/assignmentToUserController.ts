import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { assignmentToUser } from '../services';

const AssignmentIdWithStudents = async (req: Request, res: Response) => {
  try {
    const assignmentId = req.query.assignmentId as string;
    const assignmentWithStudents = await assignmentToUser.getAssignmentWithUsers(assignmentId);

    return res.status(httpStatus.OK).json({ status: 'success', data: assignmentWithStudents });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: 'failed', message: error });
  }
};

export default { AssignmentIdWithStudents };
