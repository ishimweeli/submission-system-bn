import express from 'express';
import userRoutes from './user.routes';
import assignmentRoutes from './assignmentRoutes';
import submissionRoutes from './submissionRoutes';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/submissions', submissionRoutes);

export default router;
