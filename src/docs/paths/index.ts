import userPaths from './userPaths';
import studentsPaths from './studentsPaths';
import assignmentPaths from '../assignmentPaths';
import submissionPaths from '../submissionPaths';
import bulkPaths from './bulk';

export default {
  ...userPaths,
  ...studentsPaths,
  ...bulkPaths,
  ...assignmentPaths,
  ...submissionPaths
};
