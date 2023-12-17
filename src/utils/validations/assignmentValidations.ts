import Joi from 'joi';

const createAssignment = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    deadline: Joi.date().required()
  })
};
const updateAssignment = {
  body: Joi.object().keys({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    deadline: Joi.date().optional()
  }),
  params: Joi.object().keys({
    assignmentId: Joi.string().required()
  })
};
const deleteAssignment = {
  params: Joi.object().keys({
    assignmentId: Joi.string().required()
  })
};
const getAssignments = {
  query: Joi.object({
    sortBy: Joi.string().valid('date', 'title', 'createdAt', 'deadline').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
    isDraft: Joi.boolean().optional(),
    assignmentCode: Joi.string().optional()
  })
};
const assignAssignmentToStudents = {
  params: Joi.object().keys({
    assignmentId: Joi.string().required()
  }),
  studentIds: Joi.array().items().required()
};

export default {
  createAssignment,
  deleteAssignment,
  assignAssignmentToStudents,
  getAssignments,
  updateAssignment
};
