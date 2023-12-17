import { Request, Response } from 'express';
import { generateToken } from '../utils/token.utils';
import sendEmail from '../services/email.service';
import { sendEmailTemplate } from '../views/emailTemplate';
import asyncMiddleware from './catchAsync';
import { encryptPassword } from '../utils/passworUtils';
import authServices from '../services/auth.services';
import { UserRole } from '@prisma/client';
import { generateStuffId } from '../utils/generateUniqueIds';
import generatePassword from '../utils/generatePassword';
import { userService, assignmentService, submissionService } from '../services';
import httpStatus from 'http-status';

const adminLogin = asyncMiddleware(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await authServices.loginUser(email, password);
  const { id, role, invited, firstName } = user;
  const token = generateToken({ id, role, invited, firstName, email });
  res.cookie('token', token, { httpOnly: true });
  res.json({
    role: user.role,
    firstName: user.firstName,
    token
  });
});

const createUser = asyncMiddleware(async (req: Request, res: Response) => {
  const { firstName, lastName, email, role } = req.body;
  const exit = await userService.findUserByEmailOrUserId(email);
  if (exit) {
    return res
      .status(httpStatus.CONFLICT)
      .json({ message: 'Email already in use. Choose a different email.' });
  }
  const staff_id = await generateStuffId(role);
  const password = generatePassword();
  const hashedPassword = await encryptPassword(password);
  const student = await userService.createUser(
    email,
    staff_id,
    hashedPassword,
    role,
    firstName,
    lastName
  );
  const claimAcountURL = `${process.env.URL}/api/users/account/claim/${staff_id}`;
  sendEmail(
    email,
    ` ${role} Registration`,
    sendEmailTemplate(password, staff_id, claimAcountURL, role)
  );
  res.status(httpStatus.OK).json(student);
});

const listAllLectures = asyncMiddleware(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const { users, totalCount } = await userService.getUsersByRole(UserRole.LECTURER, page);
  const totalPages = Math.ceil(totalCount / 10);
  return res.status(httpStatus.OK).json({
    status: 'success',
    data: {
      lecturers: users,
      totalPages
    }
  });
});

const listAllStudent = asyncMiddleware(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const { users, totalCount } = await userService.getUsersByRole(UserRole.STUDENT, page);
  const totalPages = Math.ceil(totalCount / 10);
  return res.status(httpStatus.OK).json({
    status: 'success',
    data: {
      lecturers: users,
      totalPages
    }
  });
});

const updateStudentInfo = asyncMiddleware(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { firstName, lastName, email, password, staff_id } = req.body;
  const updatedStudent = await userService.updateStudent(
    id,
    firstName,
    lastName,
    email,
    password,
    staff_id
  );
  res.status(httpStatus.OK).json(updatedStudent);
});

const dashboardInfo = asyncMiddleware(async (req: Request, res: Response) => {
  const lecturers = await userService.getUsersByRoles(UserRole.LECTURER);
  const students = await userService.getUsersByRoles(UserRole.STUDENT);
  const assignments = await assignmentService.getAllAssignments();
  const submissions = await submissionService.getAllSubmissions();

  return res.status(httpStatus.OK).json({
    status: 'success',
    data: {
      lecturers: lecturers.length,
      students: students.length,
      assignments: assignments.length,
      submissions: submissions.length
    }
  });
});

const createBulk = asyncMiddleware(async (req: Request, res: Response) => {
  const { usersBulk, userRole } = req.body;
  const role = userRole;
  if (usersBulk.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: 'failed',
      message: 'The usersBulk array is empty. Please provide user data.'
    });
  }
  for (let i = 0; i < usersBulk.length; i++) {
    const { firstName, lastName, email } = usersBulk[i];

    const staff_id = await generateStuffId(UserRole.STUDENT);
    const password = generatePassword();
    const hashedPassword = await encryptPassword(password);
    await userService.createUser(email, staff_id, hashedPassword, userRole, firstName, lastName);
    const claimAcountURL = `${process.env.URL}/api/users/account/claim/${staff_id}`;
    sendEmail(
      email,
      ` ${role} Registration`,
      sendEmailTemplate(password, staff_id, claimAcountURL, role)
    );
  }
  res
    .status(httpStatus.CREATED)
    .json({ status: 'success', message: `${(userRole as string).toLowerCase()}s created` });
});

const createBulkStudent = asyncMiddleware(async (req: Request, res: Response) => {
  const { usersBulk, userRole } = req.body;
  const role = userRole;
  if (usersBulk.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: 'failed',
      message: 'The usersBulk array is empty. Please provide user data.'
    });
  }
  for (let i = 0; i < usersBulk.length; i++) {
    const { firstName, lastName, email } = usersBulk[i];

    const staff_id = await generateStuffId(UserRole.STUDENT);
    const password = generatePassword();
    const hashedPassword = await encryptPassword(password);
    await userService.createUser(email, staff_id, hashedPassword, userRole, firstName, lastName);
    const claimAcountURL = `${process.env.URL}/api/users/account/claim/${staff_id}`;
    sendEmail(
      email,
      ` ${role} Registration`,
      sendEmailTemplate(password, staff_id, claimAcountURL, role)
    );
  }
  res
    .status(httpStatus.CREATED)
    .json({ status: 'success', message: `${(userRole as string).toLowerCase()}s created` });
});

export default {
  adminLogin,
  createUser,
  listAllLectures,
  listAllStudent,
  updateStudentInfo,
  dashboardInfo,
  createBulk,
  createBulkStudent
};
