import { PrismaClient, Assignment, UserRole } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../utils/errorhandler';

const prisma = new PrismaClient();

interface AssignmentToUserWithUser extends Assignment {
  AssignmentToUser: {
    id: number;
    userId: number;
    assignmentId: string;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      staff_id: string;
      password: string;
      role: UserRole;
      invited: boolean;
    };
  }[];
}

const getAssignmentWithUsers = async (
  assignmentId: string
): Promise<AssignmentToUserWithUser | null> => {
  try {
    const assignmentWithUsers = await prisma.assignment.findUnique({
      where: { assignmentId },
      include: {
        AssignmentToUser: {
          include: {
            user: true
          }
        }
      }
    });

    if (!assignmentWithUsers) {
      throw new NotFoundError('Assignment not found');
    }
    return assignmentWithUsers as AssignmentToUserWithUser;
  } catch (error) {
    throw new BadRequestError('assignment with user Error');
  }
};

export default {
  getAssignmentWithUsers
};
