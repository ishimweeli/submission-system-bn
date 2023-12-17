import express from 'express';
import { authenticated } from '../middleware/authenticated';
import { checkInvited } from '../middleware/checkClaimed';
import { UserRole } from '@prisma/client';
import { AssignmentToUserController } from '../controllers';
import { assignmentController } from '../controllers';
import { validateInputs } from '../middleware/validateData';
import assignmentValidations from '../utils/validations/assignmentValidations';
const router = express.Router();

router.post(
  '/lecturer/assignment/publish',
  authenticated([UserRole.LECTURER]),
  checkInvited(true),
  validateInputs(assignmentValidations.createAssignment),
  assignmentController.createAssignmentPublish
);

router.post(
  '/lecturer/assignment/draft',
  authenticated([UserRole.LECTURER]),
  checkInvited(true),
  validateInputs(assignmentValidations.createAssignment),
  assignmentController.createAssignmentDraft
);

router.patch(
  '/lecturer/update/:assignmentId',
  authenticated([UserRole.LECTURER]),
  checkInvited(true),
  validateInputs(assignmentValidations.updateAssignment),
  assignmentController.updateAssignment
);

router.patch(
  '/lecturer/update/isDraft/:assignmentId',
  authenticated([UserRole.LECTURER]),
  assignmentController.draftToPublish
);

router.delete(
  '/lecturer/delete/published/:assignmentId',
  authenticated([UserRole.LECTURER]),
  checkInvited(true),
  validateInputs(assignmentValidations.deleteAssignment),
  assignmentController.deletePublishedAssignment
);

router.delete(
  '/lecturer/delete/draft/:assignmentId',
  authenticated([UserRole.LECTURER]),
  checkInvited(true),
  assignmentController.deleteDraftAssignment
);
router.get(
  '/lecturer/assignments',
  authenticated([UserRole.LECTURER]),
  checkInvited(true),
  validateInputs(assignmentValidations.getAssignments),
  assignmentController.getLecturerAssignments
);
router.post(
  '/lecturer/assign/published',
  authenticated([UserRole.LECTURER]),
  checkInvited(true),
  assignmentController.assignAssignmentToStudent
);
router.get(
  '/student/all/assignments/:userId',
  authenticated([UserRole.STUDENT]),
  checkInvited(true),
  assignmentController.studentGetAssignments
);
router.get(
  '/assignment/student/:assignmentId',
  authenticated([UserRole.LECTURER, UserRole.ADMIN]),
  checkInvited(true),
  AssignmentToUserController.AssignmentIdWithStudents
);
router.get(
  '/lecturer/submissions/',
  authenticated([UserRole.LECTURER, UserRole.ADMIN]),
  assignmentController.getAssignmentsAndSubmissions
);
router.get(
  '/students/:assignmentId',
  authenticated([UserRole.LECTURER, UserRole.ADMIN]),
  assignmentController.getAllAssignedStudents
);
router.get(
  '/lecturer/unAssigned/students/:assignmentId',
  authenticated([UserRole.LECTURER]),
  assignmentController.unassignedStudents
);
export default router;
