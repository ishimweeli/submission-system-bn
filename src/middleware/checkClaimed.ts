import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const checkInvited = (invited: boolean) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorizationHeader = req.headers['authorization'];
      const cookieAuth = req.cookies.token;
      const bearerToken = authorizationHeader?.split(' ')[1];
      if (!bearerToken && !cookieAuth) {
        return res.status(401).json({ error: 'Unauthorized. Token missing or invalid format.' });
      }

      const secretKey = process.env.JWT_SECRET_KEY;
      if (!secretKey) {
        return res
          .status(500)
          .json({ error: 'JWT_SECRET_KEY environment variable is not defined.' });
      }
      // eslint-disable-next-line
      const decodedToken: any = jwt.verify(bearerToken || cookieAuth, secretKey);

      if (decodedToken.invited === invited) {
        req.user = decodedToken;
        next();
      } else {
        return res
          .status(403)
          .json({ error: 'Please visit your email and claim your account first.' });
      }
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token claim' });
    }
  };
};
