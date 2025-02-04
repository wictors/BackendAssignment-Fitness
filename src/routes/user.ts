import { Router, Request, Response, NextFunction } from 'express';

import { authenticateToken } from '../auth/authorizationToken';
import { authorizeRole } from '../auth/authorizationRole';
import { USER_ROLE } from '../utils/enums';
import { UserModel } from '../db/user';
import { Op } from 'sequelize';
import { ExerciseModel } from '../db/exercise';
import { UserExerciseModel } from '../db/user_exercise';

const router: Router = Router();

const missingId = (res: Response) => {
  return res.status(400).json({ error: 'Missing required parameter: id' });
};

export default () => {
  router.use(authenticateToken);
  router.use(authorizeRole([USER_ROLE.USER]));

  /**Get all users
   * @route GET /users
   */
  router.get(
    '/users',
    async (_req: Request, res: Response, _next: NextFunction) => {
      try {
        const users = (await UserModel.findAll({
          attributes: ['id', 'nickName'],
        })) as UserModel[];

        if (!users || !users.length) {
          return res.status(404).json({
            message: 'No users exist',
          });
        }

        res.json({
          data: users,
          message: 'List of users',
        });
      } catch (err) {
        return res.status(500).json({
          message: 'Internal server error',
          err: err,
        });
      }
    },
  );

  /**Get user profile with exercises. User id is used from token
   * @route GET /profile
   */
  router.get(
    '/profile',
    async (_req: Request, res: Response, _next: NextFunction) => {
      try {
        const reqUser = _req.body.user as UserModel;

        const user = (await UserModel.findOne({
          where: { id: reqUser.id },
          include: [
            {
              model: ExerciseModel,
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
              through: {
                attributes: ['id', 'completedAt', 'duration'],
              },
            },
          ],
          attributes: {
            exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'],
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

  /**Get all completed exercises for user. User id is used from token
   * @route GET /profile/exercises
   */
  router.get(
    '/profile/exercises',
    async (_req: Request, res: Response, _next: NextFunction) => {
      try {
        const reqUser = _req.body.user as UserModel;
        const completedExercises = (await UserExerciseModel.findAll({
          where: { userId: reqUser.id },
          attributes: ['id', 'completedAt', 'duration'],
          include: [
            {
              model: ExerciseModel,
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
            },
          ],
        })) as UserExerciseModel[];

        if (!completedExercises || !completedExercises.length) {
          return res.status(404).json({
            message: 'No completed exercises',
          });
        }

        res.json({
          data: completedExercises,
          message: 'List of completed exercises',
        });
      } catch (err) {
        return res.status(500).json({
          message: 'Internal server error',
          err: err,
        });
      }
    },
  );

  /**Add exercise to user. User id is used from token. Exercise can be added also without completedAt and duration fields.
   * @route POST /exercise
   * @param {number} req.body.exerciseId Required
   * @param {Date} req.body.completedAt
   * @param {number} req.body.duration
   */
  router.post('/exercise', async (_req: Request, res: Response) => {
    try {
      const reqUser = _req.body.user as UserModel;
      const { exerciseId, completedAt, duration } = _req.body;

      if (!exerciseId) {
        return res.status(400).json({
          message: 'Exercise ID is required',
        });
      }

      const user = (await UserModel.findByPk(reqUser.id)) as UserModel;
      const exercise = (await ExerciseModel.findByPk(
        exerciseId,
      )) as ExerciseModel;
      if (!exercise) {
        return res.status(404).json({
          message: 'Exercise does not exist',
        });
      }

      const result = (await user.addExercise(exercise, {
        through: {
          completedAt,
          duration,
        },
      })) as ExerciseModel;

      res.json({
        data: result,
        message: 'Exercise added',
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Internal server error',
        err: error,
      });
    }
  });

  /**Delete user exercise by id in params. User id is used from token.
   * @route DELETE /exercise/:id
   * @param {number} req.params.id Required
   */
  router.delete('/exercise/:id/', async (_req: Request, res: Response) => {
    try {
      const reqUser = _req.body.user as UserModel;
      const { id } = _req.params;

      const userExercise = (await UserExerciseModel.findOne({
        where: { userId: reqUser.id, id },
      })) as UserExerciseModel;

      if (!userExercise) {
        return res.status(404).json({
          message: 'Wrong exercise !',
        });
      }

      await userExercise.destroy();

      res.json({
        message: 'Exercise deleted',
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal server error',
        err: err,
      });
    }
  });

  // Handle error for missing id in delete request
  router.delete('/exercise', async (_req: Request, res: Response) => {
    return missingId(res);
  });

  return router;
};
