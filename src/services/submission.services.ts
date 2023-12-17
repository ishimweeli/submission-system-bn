import prisma from '../client';
import { Submission, UserRole } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../utils/errorhandler';
import assignmentServices from './assignment.services';

export interface Snapshot {
  id: number;
  name: string;
  filepath: string;
  submissionId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SubmissionWithSnapshots {
  id: number;
  assignmentId: string;
  studentId: number;
  submissionCode: string;
  createdAt: Date;
  updatedAt: Date;
  snapshots: Snapshot[];
}

const getAllSubmissions = async (): Promise<SubmissionWithSnapshots[]> => {
  const allSubmissions = await prisma.submission.findMany({
    include: {
      assignment: true,
      student: true,
      snapshots: true
    }
  });

  return allSubmissions;
};

const getAllStudentSubmission = async (userId: number, role: UserRole) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    let submissions;
    if (role === UserRole.LECTURER) {
      submissions = await prisma.submission.findMany({
        where: {
          assignment: {
            authorId: userId,
          },
        },
        include: {
          assignment: true,
          student: true,
          snapshots: true,
        },
      });
    } else if (role === UserRole.STUDENT) {
      submissions = await prisma.submission.findMany({
        where: {
          studentId: userId,
        },
        include: {
          assignment: true,
          student: true,
          snapshots: true,
        },
      });
    } else {
      throw new Error("Invalid user role");
    }

    return submissions;
  } catch (error) {
    console.error(error);
    throw new Error("Invalid user id or Failed to retrieve submissions");
  }
};


const getAllStudentSubmissionByStudentId = async (userId: number) => {
  
  const allSubmissions = await prisma.submission.findMany({
    where: { 
          studentId: userId 
    },
    include: {
      assignment: true,
      student: true,
      snapshots: true
    }
  });

  return allSubmissions;
};


const createSubmission = async (
  assignmentId: string,
  studentId: number,
  submissionCode: string,
  snapshots: Array<{ name: string; filepath: string }>
): Promise<Pick<Submission, 'assignmentId' | 'createdAt'>> => {
  const assignedAssignment = await assignmentServices.getAssignmentsByStudentId(studentId);
  if (!assignedAssignment) {
    throw new NotFoundError('You are not assigned to any assignment');
  }

  const assignedAssignments = await prisma.assignmentToUser.findMany({
    where: {
      userId: studentId
    }
  });

  const isAssigned = assignedAssignments.some(
    (assignment) => assignment.assignmentId === assignmentId
  );

  if (!isAssigned) {
    throw new BadRequestError('This assignment is not assigned to you');
  }

  const targetAssignement = await assignmentServices.getAssignmentById(assignmentId);
  if (!targetAssignement) {
    throw new BadRequestError('Assignment does not exist');
  }

  if (targetAssignement.deadline < new Date()) {
    throw new BadRequestError(`Can't submit after deadline`);
  }

  const existingSubmission = await prisma.submission.findFirst({
    where: {
      assignment: {
        assignmentId: assignmentId
      },
      studentId: studentId
    },
    include: {
      snapshots: true
    }
  });

  let submission;
  if (existingSubmission) {
    submission = await prisma.submission.update({
      where: { id: existingSubmission.id },
      data: {
        snapshots: {
          create: snapshots.map((snapshot) => ({
            name: snapshot.name,
            filepath: snapshot.filepath
          }))
        }
      },
      include: {
        assignment: true,
        student: true,
        snapshots: true
      }
    });
  } else {
    submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId,
        submissionCode,
        snapshots: {
          create: snapshots.map((snapshot) => ({
            name: snapshot.name,
            filepath: snapshot.filepath
          }))
        }
      },
      include: {
        assignment: true,
        student: true,
        snapshots: true
      }
    });
  }

  await prisma.assignmentToUser.update({
    where: {
      userId_assignmentId: {
        userId: studentId,
        assignmentId: assignmentId
      }
    },
    data: {
      submitted: true
    }
  });
  return submission;
};

const checkSubmissionExist = async (
  assignmentId: string,
  studentId: number
): Promise<Submission | null> => {
  const existingSubmission = await prisma.submission.findFirst({
    where: {
      assignmentId: assignmentId,
      studentId: studentId
    }
  });

  return existingSubmission;
};

const getNextSubmissionId = async (): Promise<string> => {
  const lastSubmission = await prisma.submission.findFirst({
    orderBy: {
      id: 'desc'
    }
  });

  const nextId = lastSubmission ? (Number(lastSubmission.id) + 1).toString() : '1';

  return nextId;
};

async function getAuthorIdBySubmissionId(submissionId: number): Promise<number | null> {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: { assignment: { select: { authorId: true } } }
    });

    if (submission && submission.assignment) {
      return submission.assignment.authorId;
    }

    return null;
  } catch (error) {
    throw new BadRequestError('Failed to retrieve author ID');
  }
}

async function getAssignmentAuthor(submissionId: number) {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: { author: true }
        }
      }
    });

    if (!submission) {
      throw new Error(`Submission with ID ${submissionId} not found`);
    }

    const assignmentAuthor = submission.assignment.author;

    return assignmentAuthor;
  } catch (error) {
    console.error('Error retrieving assignment author:', error);
    throw error;
  }
}

async function getAuthorIdBySnapshotId(snapshotId: number): Promise<number | null> {
  try {
    const snapshot = await prisma.snapshot.findUnique({
      where: { id: snapshotId },
      select: { submissionId: true }
    });

    if (snapshot) {
      const submission = await prisma.submission.findUnique({
        where: { id: snapshot.submissionId },
        select: { assignment: { select: { authorId: true } } }
      });

      if (submission && submission.assignment) {
        return submission.assignment.authorId;
      }
    }

    return null;
  } catch (error) {
    throw new BadRequestError('Failed to retrieve author ID');
  }
}

async function getUserEmailByStaffId(staffId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        staff_id: staffId
      }
    });

    return user?.email || null;
  } catch (error) {
    throw new NotFoundError('Could not  fetch the user');
  } finally {
    await prisma.$disconnect();
  }
}
export default {
  getAllStudentSubmission,
  getAllSubmissions,
  createSubmission,
  getNextSubmissionId,
  getAuthorIdBySubmissionId,
  getUserEmailByStaffId,
  getAuthorIdBySnapshotId,
  checkSubmissionExist,
  getAssignmentAuthor,
  getAllStudentSubmissionByStudentId
};
