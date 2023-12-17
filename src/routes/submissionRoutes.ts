import express from 'express';
import { submissionController } from '../controllers';
import { authenticated } from '../middleware/authenticated';
import { UserRole } from '@prisma/client';
import uploadFile from '../config/multer';
import { validateInputs, validateZipUpload } from '../middleware/validateData';
import submissionValidation from '../utils/validations/submissionValidation';

const router = express.Router();

router.post(
  '/student/create/submission/:assignmentId',
  authenticated([UserRole.STUDENT]),
  uploadFile.array('snapshotArchive'),
  validateZipUpload,
  validateInputs(submissionValidation.createSubmissionValidation),
  submissionController.createAssignmentSubmission
);

router.get(
  '/student/all/submissions',
  authenticated([UserRole.LECTURER, UserRole.STUDENT]),
  validateInputs(submissionValidation.getStudentSubmissions),
  submissionController.getStudentSubmissions
);
router.get(
  '/lecturer/download/submissions',
  authenticated([UserRole.LECTURER, UserRole.STUDENT]),
  submissionController.downloadAssignmentZips
);
router.get(
  '/lecturer/download/student/all/submissions',
  authenticated([UserRole.LECTURER, UserRole.STUDENT]),
  submissionController.downloadAllSnapshotsController
);

router.post(
  '/student/create/submission/:assignmentId',
  authenticated([UserRole.STUDENT]),
  uploadFile.single('snapshotArchive'),
  submissionController.createAssignmentSubmission
);

router.get(
  '/student/all/submissions',
  authenticated([UserRole.LECTURER, UserRole.STUDENT]),
  submissionController.getStudentSubmissions
);

router.get(
  '/lecturer/download/submissions',
  authenticated([UserRole.LECTURER, UserRole.STUDENT]),
  submissionController.downloadAssignmentZips
);
router.get(
  '/lecturer/download/student/all/submissions',
  authenticated([UserRole.LECTURER, UserRole.STUDENT]),
  submissionController.downloadAllSnapshotsController
);
router.get(
  '/snapshots/:studentId',
  authenticated([UserRole.LECTURER, UserRole.STUDENT]),
  submissionController.studentSubmissionSnapshots
);

export default router;
