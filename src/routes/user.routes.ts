import express from 'express';
import { adminController, userController } from '../controllers';
import { authenticated } from '../middleware/authenticated';
import { checkInvited } from '../middleware/checkClaimed';
import { UserRole } from '@prisma/client';
import { convertCsvToJson } from '../middleware/convertCSVToJSON';
import { validateFiletype, validateInputs } from '../middleware/validateData';
import userValidation from '../utils/validations/userValidation';
const router = express.Router();
import multer from 'multer';

const upload = multer();
router.post('/admin/login', adminController.adminLogin);
router.get('/logout', userController.userLogout);
router.post('/admin/create/lecture', authenticated([UserRole.ADMIN]), adminController.createUser);
router.get('/admin/all/lecture', authenticated([UserRole.ADMIN]), adminController.listAllLectures);
router.post('/admin/create/student', authenticated([UserRole.ADMIN]), adminController.createUser);
router.get(
  '/admin/all/student',
  authenticated([UserRole.ADMIN, UserRole.LECTURER]),
  checkInvited(true),
  adminController.listAllStudent
);
router.patch(
  '/admin/edit/student/:id',
  authenticated([UserRole.ADMIN, UserRole.LECTURER, UserRole.STUDENT]),
  checkInvited(true),
  adminController.updateStudentInfo
);
router.get('/admin/dashboard', authenticated([UserRole.ADMIN]), adminController.dashboardInfo);
router.get('/account/claim/:staff_id', userController.changeInviteStatus);
router.post(
  '/reset/password',
  validateInputs(userValidation.resetPasswordSchema),
  authenticated([UserRole.ADMIN, UserRole.LECTURER, UserRole.STUDENT]),
  checkInvited(true),
  userController.resetPassword
);
router.patch(
  '/admin/edit/student/:id',
  authenticated([UserRole.ADMIN, UserRole.LECTURER, UserRole.STUDENT]),
  checkInvited(true),
  adminController.updateStudentInfo
);
router.post(
  '/admin/create/lectures/bulk',
  authenticated([UserRole.ADMIN]),
  upload.single('usersBulk'),
  validateFiletype('text/csv'),
  convertCsvToJson('usersBulk', UserRole.LECTURER),
  adminController.createBulk
);
router.post(
  '/admin/create/students/bulk',
  authenticated([UserRole.ADMIN]),
  upload.single('usersBulk'),
  validateFiletype('text/csv'),
  convertCsvToJson('usersBulk', UserRole.STUDENT),
  adminController.createBulkStudent
);

export default router;
