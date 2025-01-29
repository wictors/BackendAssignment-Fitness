import { Router, Request, Response, NextFunction } from 'express';

import { models } from '../db';
import { authenticateToken } from '../auth/authorizationToken';
import { authorizeRole } from '../auth/authorizationRole';
import { USER_ROLE } from '../utils/enums';
import { UserModel } from '../db/user';
import { where } from 'sequelize';
import { ExerciseModel } from '../db/exercise';
import { UserExerciseModel } from '../db/user_exercise';

const router: Router = Router();

const { Program } = models;

export default () => {
  router.use(authenticateToken);
  router.use(authorizeRole([USER_ROLE.ADMIN]));

  //not finished yet, missing the logic to get the exercises of a user
  router.get(
    '/user',
    async (_req: Request, res: Response, _next: NextFunction) => {
      try {
        const { id, email } = _req.body;
        if (!id && !email) {
          return res.status(400).json({
            message: 'Email or ID is required',
          });
        }
        let whereClause = {};
        if (id) {
          whereClause = { ...whereClause, id: id };
        }
        if (email) {
          whereClause = { ...whereClause, email: email };
        }
        const user = (await UserModel.findAll({
          where: whereClause,
          include: [{ model: UserModel }],
          attributes: {
            exclude: ['password'],
          },
        })) as UserModel;

        if (!user) {
          return res.status(404).json({
            message: 'User not found',
          });
        }

        res.json({
          data: user,
          message: 'User found',
        });
      } catch (err) {
        return res.status(500).json({
          message: 'Internal server error',
          err: err,
        });
      }
    },
  );

  // Not finished yet
  router.get(
    '/exercise',
    async (_req: Request, res: Response, _next: NextFunction) => {
      const exercises = (await ExerciseModel.findOne({
        include: [{ model: UserModel }],
      })) as ExerciseModel;
    },
  );

  return router;
};
