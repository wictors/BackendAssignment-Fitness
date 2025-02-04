import { Router, Request, Response, NextFunction } from 'express';

import { models } from '../db';
import { authenticateToken } from '../auth/authorizationToken';
import { authorizeRole } from '../auth/authorizationRole';
import { EXERCISE_DIFFICULTY, USER_ROLE } from '../utils/enums';
import { UserModel } from '../db/user';
import { ExerciseModel } from '../db/exercise';
import { Program } from 'typescript';

const router: Router = Router();

const { Program } = models;

const isDifficultyValid = (difficulty: string) => {
  return Object.values(EXERCISE_DIFFICULTY).includes(
    difficulty as EXERCISE_DIFFICULTY,
  );
};

const checkProgram = async (programId: number) => {
  const program = (await Program.findByPk(programId)) as Program;
  return program ? true : false;
};

const saveExercise = async (_req: Request, res: Response) => {
  try {
    const { id } = _req.params;
    const { name, difficulty, programId } = _req.body;

    if (id) {
      const exercise = (await ExerciseModel.findByPk(id)) as ExerciseModel;
      if (!exercise) {
        return res.status(404).json({
          message: 'Exercise does not exist',
        });
      }

      if (!name && !difficulty && !programId) {
        return res.status(400).json({
          message: 'No changes made',
        });
      }

      let anyUpdate: boolean = false;
      if (name && exercise.name != name) anyUpdate = true;
      if (difficulty && exercise.difficulty != difficulty) anyUpdate = true;
      if (programId && exercise.programID != programId) anyUpdate = true;

      if (anyUpdate) {
        name ? (exercise.name = name) : exercise.name;
        if (difficulty) {
          if (!isDifficultyValid(difficulty)) {
            return res.status(400).json({
              message: 'Invalid difficulty level',
            });
          }
          exercise.difficulty = difficulty;
        }

        if (programId) {
          const programExist = await checkProgram(programId);
          if (!programExist) {
            return res.status(404).json({
              message: 'Program does not exist',
            });
          }
          exercise.programID = programId;
        }

        await exercise.save();
        return res.json({
          data: exercise,
          message: 'Exercise updated',
        });
      } else {
        return res.json({
          message: 'No changes made',
        });
      }
    } else {
      if (!name || !difficulty || !programId) {
        return res.status(400).json({
          message: 'Name, difficulty, programId are required',
        });
      }
    }

    if (!isDifficultyValid(difficulty)) {
      return res.status(400).json({
        message: 'Invalid difficulty level',
      });
    }

    const program = await Program.findByPk(programId);
    if (!program) {
      return res.status(404).json({
        message: 'Program does not exist',
      });
    }

    const exercise = await ExerciseModel.create({
      name,
      difficulty,
      programID: programId,
    });

    res.json({
      data: exercise,
      message: 'Exercise created',
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error',
      err: err,
    });
  }
};

const missingId = (res: Response) => {
  return res.status(400).json({ error: 'Missing required parameter: id' });
};

export default () => {
  router.use(authenticateToken);
  router.use(authorizeRole([USER_ROLE.ADMIN]));

  /** Get all users and boolean flag to include exercises
   * @route GET /all_users
   * @param {boolean} req.body.exercises
   */
  router.get(
    '/all_users',
    async (_req: Request, res: Response, _next: NextFunction) => {
      try {
        const { exercises = false } = _req.body;
        let includeClause = [];

        if (exercises) {
          includeClause.push({
            model: ExerciseModel,
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
            through: { attributes: [] },
          });
        }

        const users = (await UserModel.findAll({
          include: includeClause,
          attributes: {
            exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'],
          },
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

  /**Get user by id or email and boolean flag to include exercises
   * @route GET /user
   * @param {number} req.body.id Required or
   * @param {string} req.body.email Required or
   * @param {boolean} req.body.exercises
   */
  router.get(
    '/user',
    async (_req: Request, res: Response, _next: NextFunction) => {
      try {
        const { id, email, exercises = false } = _req.body;
        if (!id && !email) {
          return res.status(400).json({
            message: 'Email or ID is required',
          });
        }

        let whereClause = {};
        let includeClause = [];

        if (id) {
          whereClause = { ...whereClause, id: id };
        }
        if (email) {
          whereClause = { ...whereClause, email: email };
        }

        if (exercises) {
          includeClause.push({
            model: ExerciseModel,
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
            through: { attributes: [] },
          });
        }

        const user = (await UserModel.findAll({
          where: whereClause,
          include: includeClause,
          attributes: {
            exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'],
          },
        })) as UserModel[];

        if (!user || !user.length) {
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

  /** Create exercise name, difficulty, programId are required
   * @route POST /exercise
   * @param {string} req.body.name Required
   * @param {string} req.body.difficulty Required
   * @param {number} req.body.programId Required
   */
  router.post('/exercise', saveExercise);

  /** 
  * Update exercise by id in params and name, difficulty, programId in body.
  Edit exercise in program if programId is changed. This solution allow many-to-one relationship. 
  Exercise can has only one program and program can have many exercises. 
  * TODO: Change relationship to many-to-many for better flexibility.
    
  * @route PUT /exercise/:id
  * @param {number} req.params.id Required
  * @param {string} req.body.name
  * @param {string} req.body.difficulty
  * @param {number} req.body.programId
  */
  router.put('/exercise/:id/', saveExercise);

  // Handle error for missing id in put request for exercise
  router.put('/exercise', async (_req: Request, res: Response) => {
    return missingId(res);
  });

  /** Delete exercise by id in params
   * @route DELETE /exercise/:id
   * @param {number} req.params.id Required
   */
  router.delete('/exercise/:id/', async (_req: Request, res: Response) => {
    try {
      const { id } = _req.params;
      if (!id) {
        return res.status(400).json({
          message: 'ID is required',
        });
      }

      const exercise = (await ExerciseModel.findByPk(id)) as ExerciseModel;
      if (!exercise) {
        return res.status(404).json({
          message: 'Exercise does not exist',
        });
      }

      await exercise.destroy();

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

  /** Update user role by id in params and name, surname, nickName, age, role in body
   * @route PUT /user/:id
   * @param {number} req.params.id Required
   * @param {string} req.body.name
   * @param {string} req.body.surname
   * @param {string} req.body.nickName
   * @param {number} req.body.age
   * @param {string} req.body.role
   */
  router.put('/user/:id/', async (_req: Request, res: Response) => {
    try {
      const { id } = _req.params;
      if (!id) {
        return res.status(400).json({
          message: 'ID is required',
        });
      }

      const user = (await UserModel.findByPk(id)) as UserModel;
      if (!user) {
        return res.status(404).json({
          message: 'User does not exist',
        });
      }

      const { name, surname, nickName, age, role } = _req.body;
      let anyUpdate: boolean = false;
      if (name && user.name != name) {
        anyUpdate = true;
        user.name = name;
      }
      if (surname && user.surname != surname) {
        anyUpdate = true;
        user.surname = surname;
      }
      if (nickName && user.nickName != nickName) {
        anyUpdate = true;
        user.nickName = nickName;
      }
      if (age && user.age != age) {
        anyUpdate = true;
        user.age = age;
      }
      if (role && user.role != role) {
        if (!Object.values(USER_ROLE).includes(role as USER_ROLE)) {
          return res.status(400).json({
            message: 'Invalid role',
          });
        }
        anyUpdate = true;
        user.role = role;
      }

      if (!anyUpdate) {
        return res.json({
          message: 'No changes made',
        });
      }
      await user.save();

      res.json({
        data: user,
        message: 'User updated',
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal server error',
        err: err,
      });
    }
  });

  // Handle error for missing id in put request for user
  router.put('/user', async (_req: Request, res: Response) => {
    return missingId(res);
  });

  return router;
};
