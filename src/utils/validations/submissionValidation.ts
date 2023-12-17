import Joi from 'joi';

const getAllStudentSubmissionValidation = {
  userId: Joi.number().integer().positive().required()
};
const createSubmissionValidation = {
  params: Joi.object().keys({
    assignmentId: Joi.string()
      .regex(/^ASGN-\d+$/)
      .required()
  })
};
const getStudentSubmissions = {
  studentId: Joi.number().integer().positive().required()
};
export default {
  getAllStudentSubmissionValidation,
  createSubmissionValidation,
  getStudentSubmissions
};
