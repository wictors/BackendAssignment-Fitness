import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../db/user';

export function authorizeRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.body.user as UserModel;
    if (!roles.includes(user.role)) {
      return res
        .status(403)
        .json({ message: 'You do not have the required permissions' });
    }
    next();
  };
}
