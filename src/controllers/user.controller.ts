import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userLogout = (req: Request, res: Response) => {
  try {
    const tokenInCookies = req.cookies.token;

    if (!tokenInCookies) {
      res.status(401).json({ message: 'Login first' });
      return;
    }
    res.clearCookie('token');
    if (req.headers.authorization) {
      delete req.headers.authorization;
    }
    res.status(200).json({ message: 'Logged out successfully. Token expired.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
const updateInvitedStatus = async (staff_id: string): Promise<boolean> => {
  const user = await prisma.user.findFirst({
    where: { staff_id: staff_id }
  });
  if (!user) {
    throw new Error('User not found');
  }
  const updatedUser = await prisma.user.update({
    where: { staff_id: staff_id },
    data: { invited: true }
  });

  if (!updatedUser) {
    Error('Failed to update user');
  }

  return true;
};
const changeInviteStatus = async (req: Request, res: Response) => {
  const staff_id = req.params.staff_id;

  if (!staff_id) {
    return res.status(400).json({ message: 'User ID is missing in the request params.' });
  }

  try {
    const inviteStatusUpdated = await updateInvitedStatus(staff_id);

    if (inviteStatusUpdated) {
      const alertScript =
        '<script>window.onload = function() { alert("Invite status updated successfully."); window.location.href = "https://gitinspired-rw.amalitech-dev.net/"; }</script>';

      return res.send(alertScript);
    } else {
      res.status(400).json({ message: 'Account is already claimed or user is not a lecturer.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};
const resetPassword = async (req: Request, res: Response) => {
  try {
    const newPassword = req.body.newPassword;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const id = req.user.id;
    await prisma.user.update({
      where: { id: id },
      data: { password: hashedPassword }
    });

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default { userLogout, changeInviteStatus, resetPassword, updateInvitedStatus };
