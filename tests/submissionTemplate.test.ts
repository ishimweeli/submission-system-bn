import { sendEmailTemplateSubmission } from '../src/views/submissionTemplate'; // replace 'your-file' with the actual file name

describe('sendEmailTemplateSubmission', () => {
  it('should return correct HTML string', () => {
    const lecturerFirstName = 'John';
    const studentFirstName = 'Jane';
    const studentLastName = 'Doe';
    const assignmentTitle = 'Math Assignment';
    const frontendUrl = 'http://localhost:3000';

    const result = sendEmailTemplateSubmission(
      lecturerFirstName,
      studentFirstName,
      studentLastName,
      assignmentTitle,
      frontendUrl
    );

    expect(result).toContain(lecturerFirstName);
    expect(result).toContain(studentFirstName);
    expect(result).toContain(studentLastName);
    expect(result).toContain(assignmentTitle);
    expect(result).toContain(frontendUrl);
  });
});
