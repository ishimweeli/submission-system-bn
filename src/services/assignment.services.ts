import { Assignment } from '@prisma/client';
import prisma from '../client';
import { BadRequestError, NotFoundError } from '../utils/errorhandler';

const createAssignmentPublish = async (
  title: string,
  description: string,
  deadline: Date,
  assignmentId: string,
  isDraft: boolean,
  authorId: number
): Promise<
  Pick<Assignment, 'title' | 'description' | 'deadline' | 'assignmentId' | 'isDraft' | 'authorId'>
> => {
  const lecturer = await prisma.user.findUnique({ where: { id: authorId } });
  if (!lecturer) {
    throw new NotFoundError('Lecturer not found');
  }

  const assignmentPublish = await prisma.assignment.create({
    data: {
      title,
      description,
      deadline,
      assignmentId,
      isDraft: false,
      authorId: lecturer.id
    },
    include: {
      author: {
        select: {
          id: true,
          staff_id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  return assignmentPublish;
};

const createAssignmentDraft = async (
  title: string,
  description: string,
  deadline: Date,
  assignmentId: string,
  authorId: number
): Promise<
  Pick<Assignment, 'title' | 'description' | 'deadline' | 'isDraft' | 'assignmentId' | 'authorId'>
> => {
  const lecturer = await prisma.user.findUnique({ where: { id: authorId } });

  if (!lecturer) {
    throw new NotFoundError('Lecturer not found');
  }

  const assignmentDraft = await prisma.assignment.create({
    data: {
      title,
      description,
      deadline,
      assignmentId,
      authorId: lecturer.id
    },
    include: {
      author: true
    }
  });

  return assignmentDraft;
};

const changeDraftToPublish = async (assignmentId: string): Promise<Assignment> => {
  const publishedAssignment = await prisma.assignment.update({
    where: {
      assignmentId: assignmentId
    },
    data: { isDraft: false },
    include: {
      author: true
    }
  });

  return publishedAssignment;
};

const findLecturerAssignment = async (assignementCreatorId: number, assignmentId: string) => {
  const lecturerAssignment = await prisma.user.findFirst({
    where: {
      id: Number(assignementCreatorId)
    },
    select: {
      assignments: {
        where: {
          assignmentId: assignmentId
        }
      }
    }
  });
  return lecturerAssignment;
};
const updateAssignmentData = async (assignmentId: string, assignmentBody: Partial<Assignment>) => {
  const updatedAssignment = await prisma.assignment.update({
    where: {
      assignmentId: assignmentId
    },
    data: assignmentBody
  });

  return updatedAssignment;
};

const updateAssignment = async (
  assignmentId: string,
  assignmentBody: Partial<Assignment>,
  assignementCreatorId: number
): Promise<Assignment | null> => {
  // This error will be fixed by validation itself (refactor it ... )
  if (!assignmentId) {
    throw new BadRequestError('AssignmentId is required');
  }
  const lecturerAssignment = await findLecturerAssignment(assignementCreatorId, assignmentId);
  if (!lecturerAssignment) {
    throw new BadRequestError(
      "Assignment does not exist or you't have enough permission to edit assignement"
    );
  }
  const updatedAssignment = await updateAssignmentData(assignmentId, assignmentBody);
  return updatedAssignment;
};

const deletePublishedAssignment = async (assignementId: number, authorId: number) => {
  const deleted = await prisma.assignment.deleteMany({
    where: {
      id: assignementId,
      isDraft: false,
      author: {
        id: authorId
      }
    }
  });
  return deleted;
};

const deleteDraftAssignment = async (assignementId: number, authorId: number) => {
  const draft = await prisma.assignment.deleteMany({
    where: {
      id: assignementId,
      isDraft: true,
      author: {
        id: authorId
      }
    }
  });
  return draft;
};

const getLecturerAssignments = async (authorId, sortBy) => {
  const sortOptions = {
    date: 'createdAt',
    title: 'title'
  };
  const lecturerAssignments = await prisma.assignment.findMany({
    where: {
      author: {
        id: authorId
      }
    },
    include: {
      author: {
        select: {
          id: true,
          staff_id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: {
      [sortOptions[sortBy]]: 'asc'
    }
  });
  return lecturerAssignments;
};

const getAllAssignments = async () => {
  const allAssingments = await prisma.assignment.findMany();
  return allAssingments;
};

const assignAssignmentToStudents = async (assignmentId: string, studentIds: number[]) => {
  const assignment = await prisma.assignment.findUnique({
    where: { assignmentId: assignmentId }
  });

  if (!assignment) {
    throw new BadRequestError('Assignment not found');
  }

  for (const studentId of studentIds) {
    const user = await prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${studentId} doesn't exist or is not a student.`);
    }
  }

  const existingAssignmentToUsers = await prisma.assignmentToUser.findMany({
    where: {
      assignmentId: assignmentId,
      userId: {
        in: studentIds
      }
    }
  });

  const newAssignmentsToUsers = studentIds.map((studentId) => {
    const data = {
      userId: studentId,
      assignmentId: assignmentId
    };

    if (
      existingAssignmentToUsers.some(
        (ass) => ass.userId === studentId && ass.assignmentId === assignmentId
      )
    ) {
      throw new BadRequestError(
        `The user with id: ${studentId} is already assigned to the task with id: ${assignmentId}`
      );
    }
    return data;
  });

  await prisma.assignmentToUser.createMany({
    data: newAssignmentsToUsers
  });
};

const getAssignmentById = async (assignmentId: string) => {
  return prisma.assignment.findUnique({
    where: {
      assignmentId: assignmentId
    },
    select: {
      id: true,
      title: true,
      deadline: true,
      assignmentId: true
    }
  });
};

const getAssignmentsByStudentId = async (userId: number) => {
  return prisma.assignmentToUser.findMany({
    where: {
      userId: userId
    },
    include: {
      assignment: {
        select: {
          id: true,
          title: true,
          deadline: true,
          description: true
        }
      }
    }
  });
};

const getNextAssignmentId = async (): Promise<number> => {
  const lastAssignment = await prisma.assignment.findFirst({
    orderBy: {
      id: 'desc'
    }
  });
  const nextId = lastAssignment ? lastAssignment.id + 1 : 1;
  return nextId;
};

const getUnassignedStudents = async (assignmentId: string) => {
  const assignedUsers = await prisma.assignmentToUser.findMany({
    where: {
      assignmentId: assignmentId
    },
    select: {
      userId: true
    }
  });
  const assignedUserIds = assignedUsers.map((au) => au.userId);
  const unassignedStudents = await prisma.user.findMany({
    where: {
      id: {
        notIn: assignedUserIds
      },
      role: 'STUDENT'
    }
  });

  return unassignedStudents;
};

const getAssignedStudents = async (assignmentId: string) => {
  const assignedUsers = await prisma.assignmentToUser.findMany({
    where: {
      assignmentId: assignmentId
    },
    select: {
      userId: true
    }
  });
  const assignedUserIds = assignedUsers.map((au) => au.userId);
  const assignedStudents = await prisma.user.findMany({
    where: {
      id: {
        in: assignedUserIds
      },
      role: 'STUDENT'
    }
  });

  return assignedStudents;
};

const getAssignmentsAndSubmissions = async (lecturerId: number) => {
  const assignments = await prisma.assignment.findMany({
    where: {
      authorId: lecturerId
    },
    include: {
      submissions: {
        include: {
          student: true,
          snapshots: true
        }
      }
    }
  });

  return assignments;
};

const checkIfStudentsAreInvited = async (studentIds: number[]) => {
  const students = await prisma.user.findMany({
    where: {
      id: {
        in: studentIds
      }
    },
    select: {
      id: true,
      invited: true
    }
  });

  return students;
};

export default {
  createAssignmentDraft,
  getLecturerAssignments,
  createAssignmentPublish,
  updateAssignment,
  deleteDraftAssignment,
  deletePublishedAssignment,
  assignAssignmentToStudents,
  getAssignmentById,
  getAssignmentsByStudentId,
  findLecturerAssignment,
  updateAssignmentData,
  getNextAssignmentId,
  getAllAssignments,
  changeDraftToPublish,
  getUnassignedStudents,
  getAssignedStudents,
  getAssignmentsAndSubmissions,
  checkIfStudentsAreInvited
};
