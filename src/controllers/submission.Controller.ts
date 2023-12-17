import { Response, Request } from 'express';
import asyncMiddleware from './catchAsync';
import { submissionService, userService, downloadAssignmentZip } from '../services';
import { generateSubmissionCode } from '../utils/generateUniqueIds';
import httpStatus from 'http-status';
import  {downloadAndUnzip}  from '../utils/unzip';
import cloudinary from '../config/cloudinary.config';
import prisma from '../client';
import sendEmail from '../services/email.service';
import os from 'os';
import path from 'path';
import { sendEmailTemplateSubmission } from '../views/submissionTemplate';
import { sendEmailTemplateSubmissionStudent } from '../views/studentSubmissionTemplate';
import submissionServices from '../services/submission.services';
import { BadRequestError } from '../utils/errorhandler';

const createAssignmentSubmission = asyncMiddleware(async (req: Request, res: Response) => {
  const assignmentId = String(req.params.assignmentId);

  const submissionCode = await generateSubmissionCode();
  const studentId = req.user.id;

  let snapshots: Array<{ name: string; filepath: string }> = [];

  if (Array.isArray(req.files)) {
    snapshots = req.files.map((file) => ({
      name: file.originalname,
      filepath: file.path
    }));
  } else if (req.file) {
    snapshots.push({
      name: req.file.originalname,
      filepath: req.file.path
    });
  } else {
    return res.status(400).json({
      error: 'Invalid file',
      message: 'Please upload a valid file.',
      status: 'failed'
    });
  }

  const cloudinarySnapshots: Array<{ name: string; filepath: string }> = [];

  for (const snapshot of snapshots) {
    const tarFilePath = snapshot.filepath;

    const cloudinaryUpload = await cloudinary.uploader.upload(tarFilePath, {
      folder: snapshot.name,
      resource_type: 'auto',
      access_mode: 'public'
    });

    const cloudinaryFileUrl = cloudinaryUpload.secure_url;

    cloudinarySnapshots.push({
      name: snapshot.name,
      filepath: cloudinaryFileUrl
    });
  }

  const isUpdate = await submissionService.checkSubmissionExist(assignmentId, studentId);
 
  await submissionService.createSubmission(assignmentId, studentId, submissionCode, cloudinarySnapshots);

  const assignmentAuthor = await prisma.assignment.findUnique({
    where: { assignmentId: assignmentId },
    select: {
      author: { select: { email: true, firstName: true, lastName: true } },
      assignmentId: true,
      title: true
    }
  });

  const user = await userService.getUserById(req.user.id);

  if (assignmentAuthor !== null && user !== null) {
    const lecturerFirstName = assignmentAuthor.author.firstName;
    const studentFirstName = user.firstName;
    const studentLastName = user.lastName;
    const title = assignmentAuthor.title;

    const frontendUrl = 'https://gitinspired-rw.amalitech-dev.net/';
    const emailSubject = 'New Assignment submission';
    const emailMessage = sendEmailTemplateSubmission(
      lecturerFirstName,
      studentFirstName,
      studentLastName,
      title,
      frontendUrl
    );
    const userEmail =
      (await submissionServices.getUserEmailByStaffId(req.user.email)) || req.user.email;
    await sendEmail(assignmentAuthor.author.email, emailSubject, emailMessage);

    await sendEmail(
      userEmail,
      emailSubject,
      sendEmailTemplateSubmissionStudent(studentFirstName, studentLastName, title)
    );
    res.status(200).json({
      message: isUpdate
        ? 'Snapshot added to existing submission successfully'
        : 'Submission created successfully'
    });
  }else {
    res.status(httpStatus.BAD_REQUEST)
  }
  res.status(httpStatus.BAD_REQUEST)
});

const getStudentSubmissions = asyncMiddleware(async (req: Request, res: Response) => {
  const studentId = req.user.id;
  const role=req.user.role
  const submissions = await submissionService.getAllStudentSubmission(studentId,role);
  const userHomeDirectory = os.homedir();
  const outputDirectory = path.join(userHomeDirectory, 'Desktop', 'extractedzips');
  const submissionsWithExtractedFiles = await Promise.all(
    submissions.map(async (submission) => {
      const snapshotsWithExtractedFiles = await Promise.all(
        submission.snapshots.map(async (snapshot) => {
          const extractedFiles = await downloadAndUnzip(snapshot.filepath, outputDirectory);
          return {
            id: snapshot.id,
            name: snapshot.name,
            filepath: snapshot.filepath,
            submissionId: snapshot.submissionId,
            createdAt: snapshot.createdAt,
            updatedAt: snapshot.updatedAt,
            extractedFiles: extractedFiles
          };
        })
      );

      return {
        id: submission.id,
        assignmentId: submission.assignmentId,
        studentId: submission.studentId,
        submissionCode: submission.submissionCode,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        assignment: submission.assignmentId,
        student: submission.studentId,
        snapshots: snapshotsWithExtractedFiles
      };
    })
  );

  return res.status(httpStatus.OK).json({ status: 'success', data: submissionsWithExtractedFiles });
});

const downloadAssignmentZips = asyncMiddleware(async (req: Request, res: Response) => {
  const submissionId = Number(req.query.submissionId);
  const snapshotId = Number(req.query.snapshotId);

  const userId = req.user.id;

  const author = await submissionService.getAssignmentAuthor(submissionId);
  const authorId=author.id
  if (userId===authorId) {
    const snapshotFilepath = await downloadAssignmentZip.getSnapshotFilepath(
      submissionId,
      snapshotId
    );
    
    if (snapshotFilepath) {
      await downloadAssignmentZip.downloadAndSaveZipp(snapshotFilepath, res, submissionId, snapshotId);
    }
  } else {
    throw new BadRequestError('You are not authorized to download all snapshots');
  }
});

const downloadAllSnapshotsController = asyncMiddleware(async (req: Request, res: Response) => {
  const submissionId = Number(req.query.submissionId);
  const userId = req.user.id;
  const author= await submissionService.getAssignmentAuthor(submissionId);
  const authorId=author.id

  if (userId==authorId) {
    await downloadAssignmentZip.downloadAllSnapshots(submissionId, res);
  } else {
    throw new BadRequestError('You are not authorized to download all snapshots');
  }
});

const studentSubmissionSnapshots = asyncMiddleware(async (req: Request, res: Response) => {
  const studentId = Number(req.query.studentId);
  const submissions = await submissionService.getAllStudentSubmissionByStudentId(studentId);

  const submissionsWithExtractedFiles = await Promise.all(
    submissions.map(async (submission) => {
      const snapshotsWithExtractedFiles = await Promise.all(
        submission.snapshots.map(async (snapshot) => {
          const outputDirectory = './outputDirectory';

          const extractedFiles = await downloadAndUnzip(snapshot.filepath, outputDirectory);
          return { ...snapshot, extractedFiles };
        })
      );

      return { ...submission, snapshots: snapshotsWithExtractedFiles };
    })
  );

  res.status(httpStatus.OK).json({ status: 'success', data: submissionsWithExtractedFiles });

});


export default {
  createAssignmentSubmission,
  getStudentSubmissions,
  downloadAssignmentZips,
  downloadAllSnapshotsController,
  studentSubmissionSnapshots,
};
