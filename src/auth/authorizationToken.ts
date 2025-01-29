import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserModel } from '../db/user';

dotenv.config();

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers['authorization'];

    if (!token) {
      return res.status(401).json({ message: 'Access Denied' });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY) as UserModel;
    if (verified.role) {
      req.body.user = verified;
      next();
    } else {
      return res.status(401).send('Access Denied');
    }
  } catch (err) {
    return res.status(401).send('Access Denied');
  }
};

export const generateAccessToken = (user: UserModel): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: +process.env.JWT_EXPIRES_IN },
  );
};
