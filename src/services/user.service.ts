import { Prisma, PrismaClient, User, UserRole } from '@prisma/client';
import { BadRequestError, ConflictError } from '../utils/errorhandler';

const prisma = new PrismaClient();
/**
 * @param {string} identifier
 * @returns {Promise<User>}
 */
const findUserByEmailOrUserId = async (identifier: string): Promise<User | null> => {
  if (!identifier) {
    throw new BadRequestError('Identifier is required');
  }
  return prisma.user.findFirst({
    where: {
      OR: [
        {
          staff_id: identifier
        },
        {
          email: identifier
        }
      ]
    }
  });
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (
  email: string,
  staff_id: string,
  password: string,
  role: UserRole,
  firstName: string,
  lastName: string
): Promise<User> => {
  if (!email || !staff_id || !password || !role || !firstName || !lastName) {
    throw new BadRequestError('All fields are required');
  }
  try {
    const createdUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        staff_id,
        password,
        role
      }
    });
    return createdUser;
  } catch (error) {
    if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
      throw new ConflictError(`Email "${email}" already exists`);
    }
    throw error;
  }
};

const getUsersByRole = async (role: UserRole, page: number, limit: number = 10) => {
  if (!role || !page || !limit) {
    throw new BadRequestError('Role, page, and limit are required');
  }

  const skip = (page - 1) * limit;
  const totalCount = await prisma.user.count({
    where: {
      role
    }
  });

  const users = await prisma.user.findMany({
    where: {
      role
    },
    skip: skip,
    take: limit
  });

  return {
    users,
    totalCount
  };
};

const getUsersByRoles = async (role: UserRole) => {
  if (!role) {
    throw new BadRequestError('Role is required');
  }
  return prisma.user.findMany({
    where: {
      role
    }
  });
};

const updateStudent = async (
  student_id: number,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  staff_id: string
): Promise<User> => {
  if (!student_id || !firstName || !lastName || !email || !password || !staff_id) {
    throw new BadRequestError('All fields are required');
  }
  return prisma.user.update({
    where: { id: student_id },
    data: {
      firstName,
      lastName,
      email,
      password,
      staff_id
    }
  });
};

const getUsersById = async (userIds: number[]) => {
  if (!userIds || userIds.length === 0) {
    throw new BadRequestError('User IDs are required');
  }
  return prisma.user.findMany({
    where: {
      id: {
        in: userIds
      }
    },
    select: {
      id: true,
      firstName: true,
      email: true,
      lastName: true
    }
  });
};

const getNextId = async (): Promise<number> => {
  const lastUser = await prisma.user.findFirst({
    orderBy: {
      id: 'desc'
    }
  });
  const nextId = lastUser ? lastUser.id + 1 : 1;
  return nextId;
};

const getUserById = async (userId: number) => {
  if (!userId) {
    throw new BadRequestError('User ID is required');
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!user) {
    throw new BadRequestError('User not found');
  }
  return user;
};
export default {
  findUserByEmailOrUserId,
  createUser,
  getUsersByRole,
  updateStudent,
  getUsersById,
  getNextId,
  getUsersByRoles,
  getUserById
};
