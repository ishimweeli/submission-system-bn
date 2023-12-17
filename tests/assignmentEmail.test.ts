import { sendEmailTemplateOnAssignment } from '../src/views/emailTemplateAssignment'; // replace 'your-file' with the actual file name

describe('sendEmailTemplateOnAssignment', () => {
  it('should return the correct HTML string', () => {
    const firstname = 'John';
    const lastname = 'Doe';
    const title = 'Test Assignment';
    const deadline = new Date();
    const assignmentCode = '123ABC';
    const frontendUrl = 'http://localhost:3000';

    const result = sendEmailTemplateOnAssignment(
      firstname,
      lastname,
      title,
      deadline,
      assignmentCode,
      frontendUrl
    );

    expect(result).toContain(firstname);
    expect(result).toContain(lastname);
    expect(result).toContain(title);
    expect(result).toContain(deadline.toString());
    expect(result).toContain(assignmentCode);
    expect(result).toContain(frontendUrl);
  });
});
