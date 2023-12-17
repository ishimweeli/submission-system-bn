/* eslint-disable */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticated = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorizationHeader = req.headers['authorization'];
      let cookieAuth = req.cookies.token;
      let bearerToken = authorizationHeader?.split(' ')[1];

      if (!bearerToken && !cookieAuth) {
        return res.status(401).json({ error: 'Unauthorized. Token missing or invalid format.' });
      }

      const secretKey = process.env.JWT_SECRET_KEY;
      if (!secretKey) {
        return res
          .status(500)
          .json({ error: 'JWT_SECRET_KEY environment variable is not defined.' });
      }

      const decodedToken: any = jwt.verify(bearerToken || cookieAuth, secretKey);
      if (roles.includes(decodedToken.role)) {
        req.user = decodedToken;
        next();
      } else {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      }
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};
