import httpStatus from 'http-status';
import { Response, Request } from 'express';
import asyncMiddleware from './catchAsync';
import { assignmentService, userService } from '../services';
import { generateAssignmentId } from '../utils/generateUniqueIds';
import validateDeadline from '../utils/validDeadline';
import sendEmail from '../services/email.service';
import { sendEmailTemplateOnAssignment } from '../views/emailTemplateAssignment';
import { BadRequestError } from '../utils/errorhandler';

const createAssignmentPublish = asyncMiddleware(async (req: Request, res: Response) => {
  const user = req.user;
  const isDraft: boolean = false;
  const { title, deadline, description } = req.body;
  const validDeadline = await validateDeadline(deadline);
  const assignmentId = await generateAssignmentId();
  const assignment = await assignmentService.createAssignmentPublish(
    title,
    description,
    validDeadline,
    assignmentId,
    isDraft,
    user.id
  );

  res
    .status(httpStatus.CREATED)
    .json({ status: 'success', message: 'Assignment has been created succesffuly', assignment });
});

const createAssignmentDraft = asyncMiddleware(async (req: Request, res: Response) => {
  const { title, description, deadline } = req.body;
  const validDeadline = await validateDeadline(deadline);
  const assignmentId = await generateAssignmentId();
  const user = req.user;
  const assignmentDraft = await assignmentService.createAssignmentDraft(
    title,
    description,
    validDeadline,
    assignmentId,
    user.id
  );
  res.status(httpStatus.CREATED).json({
    status: 'success',
    message: 'Assign Draft has been saved succesffuly',
    assignmentDraft
  });
});

const draftToPublish = asyncMiddleware(async (req: Request, res: Response) => {
  const assignmentId = req.params.assignmentId;
  const draftToPub = await assignmentService.changeDraftToPublish(assignmentId);
  res
    .status(httpStatus.OK)
    .send({ status: 'success', message: 'Assignment updated successfully', draftToPub });
});

const updateAssignment = asyncMiddleware(async (req: Request, res: Response) => {
  const authorId = req.user?.id as number;
  const assignementId = req.params.assignmentId;
  const { title, description, deadline } = req.body;
  const updatedAssignment = await assignmentService.updateAssignment(
    assignementId,
    {
      title,
      description,
      deadline
    },
    authorId
  );
  res
    .status(httpStatus.OK)
    .send({ status: 'success', message: 'Assignment updated successfully', updatedAssignment });
});

const deletePublishedAssignment = asyncMiddleware(async (req: Request, res: Response) => {
  const lecturerId = req.user?.id as number;
  const assignementId: number = parseInt(req.params.assignmentId, 10);
  await assignmentService.deletePublishedAssignment(assignementId, lecturerId);
  res
    .status(httpStatus.OK)
    .json({ status: 'success', message: 'Published Assignment deleted successfully' });
});

const deleteDraftAssignment = asyncMiddleware(async (req: Request, res: Response) => {
  const lecturerId = req.user?.id as number;
  const assignementId: number = parseInt(req.params.assignmentId, 10);
  await assignmentService.deleteDraftAssignment(assignementId, lecturerId);
  res
    .status(httpStatus.OK)
    .json({ status: 'success', message: 'Draft Assignment deleted successfully' });
});

const getLecturerAssignments = asyncMiddleware(async (req: Request, res: Response) => {
  const user = req.user;
  const sortBy = req.query.sortBy || 'date';
  const assignments = await assignmentService.getLecturerAssignments(user.id, sortBy);
  res.status(httpStatus.OK).json({ status: 'success', data: assignments });
});

const assignAssignmentToStudent = asyncMiddleware(async (req: Request, res: Response) => {
  const studentIds = req.body.studentIds;
  const assignmentId = req.body.assignmentId;
  const students = await assignmentService.checkIfStudentsAreInvited(studentIds);
  const uninvitedStudents = students.filter((student) => student.invited === false);
  if (uninvitedStudents.length > 0) {
    throw new BadRequestError('studentS have not claimed their account');
  }
  await assignmentService.assignAssignmentToStudents(assignmentId, studentIds);
  const assignment = await assignmentService.getAssignmentById(assignmentId);
  const users = await userService.getUsersById(studentIds);

  if (assignment) {
    const title = assignment.title;
    const deadline = assignment.deadline;
    const assignmentId = assignment.assignmentId;
    const frontendUrl = 'https://gitinspired-rw.amalitech-dev.net/';

    await Promise.all(
      users.map(async (user) => {
        const { email, firstName, lastName } = user;
        const emailSubject = 'Assignment Registration';
        const emailMessage = sendEmailTemplateOnAssignment(
          firstName,
          lastName,
          title,
          deadline,
          assignmentId,
          frontendUrl
        );

        await sendEmail(email, emailSubject, emailMessage);
      })
    );

    res.status(httpStatus.OK).json({
      status: 'success',
      message: 'Assignment assigned successfully'
    });
  }
});
const studentGetAssignments = asyncMiddleware(async (req: Request, res: Response) => {
  const userId: number = parseInt(req.user.id);
  const assignments = await assignmentService.getAssignmentsByStudentId(userId);
  res.status(httpStatus.OK).json({ status: 'success', data: assignments });
});

const unassignedStudents = asyncMiddleware(async (req: Request, res: Response) => {
  const assignmentId = req.query.assignmentId;
  const unAssignedStud = await assignmentService.getUnassignedStudents(assignmentId as string);
  res.status(httpStatus.OK).json({ status: 'success', data: unAssignedStud });
});

const getAssignmentsAndSubmissions = asyncMiddleware(async (req: Request, res: Response) => {
  const lecturerId = parseInt(req.user.id);
  const assignments = await assignmentService.getAssignmentsAndSubmissions(lecturerId);
  res.status(httpStatus.OK).json({ status: 'success', data: assignments });
});

const getAllAssignedStudents = asyncMiddleware(async (req: Request, res: Response) => {
  const assignmentId = req.query.assignmentId;
  const assignments = await assignmentService.getAssignedStudents(assignmentId as string);
  res.status(httpStatus.OK).json({ status: 'success', data: assignments });
});

export default {
  createAssignmentPublish,
  createAssignmentDraft,
  updateAssignment,
  deletePublishedAssignment,
  deleteDraftAssignment,
  getLecturerAssignments,
  assignAssignmentToStudent,
  studentGetAssignments,
  draftToPublish,
  unassignedStudents,
  getAllAssignedStudents,
  getAssignmentsAndSubmissions
};
