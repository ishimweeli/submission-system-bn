import { sendEmailTemplateSubmissionStudent } from '../src/views/studentSubmissionTemplate'; // replace 'your-file' with the actual file name

describe('sendEmailTemplateSubmissionStudent', () => {
  it('should return correct HTML string', () => {
    const studentFirstName = 'Jane';
    const studentLastName = 'Doe';
    const assignmentTitle = 'Math Assignment';

    const result = sendEmailTemplateSubmissionStudent(
      studentFirstName,
      studentLastName,
      assignmentTitle
    );

    expect(result).toContain(studentFirstName);
    expect(result).toContain(studentLastName);
    expect(result).toContain(assignmentTitle);
  });
});
