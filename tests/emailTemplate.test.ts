import { sendEmailTemplate } from '../src/views/emailTemplate'; // replace 'your-file' with the actual file name

describe('sendEmailTemplate', () => {
  it('returns correct HTML string', () => {
    const password = 'testPassword';
    const staff_id = 'testStaffId';
    const url = 'testUrl';
    const role = 'testRole';

    const result = sendEmailTemplate(password, staff_id, url, role);

    expect(result).toContain(password);
    expect(result).toContain(staff_id);
    expect(result).toContain(url);
    expect(result).toContain(role);
  });
});
