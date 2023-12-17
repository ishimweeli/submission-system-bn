import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { NotFoundError } from '../utils/errorhandler';

dotenv.config();

const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  if (!user || !pass) {
    throw new NotFoundError(
      'Gmail email or password is not provided in the environment variables.'
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user,
      pass
    }
  });

  const mailOptions = {
    from: user,
    to,
    subject,
    html: text
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendEmail;
