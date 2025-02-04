import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';

import { models } from '../db';
import { generateAccessToken } from '../auth/authorizationToken';
import { USER_ROLE } from '../utils/enums';
import { UserModel } from '../db/user';

const router: Router = Router();

const { Program } = models;

const checkRegistration = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password')
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters long'),
  body('role')
    .isIn([USER_ROLE.ADMIN, USER_ROLE.USER])
    .withMessage('Invalid role'),
];

export default () => {
  // Nobody has access to list of programs by requirements, so stay public :)
  router.get(
    '/programs',
    async (_req: Request, res: Response, _next: NextFunction) => {
      const programs = await Program.findAll();
      return res.json({
        data: programs,
        message: 'List of programs',
      });
    },
  );

  router.post(
    '/login',
    async (req: Request, res: Response, _next: NextFunction) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({
            message: 'Email and password are required',
          });
        }

        const user: UserModel = await models.User.findOne({
          where: {
            email,
          },
        });
        if (!user) {
          return res.status(400).json({
            message: 'User not found',
          });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(400).json({
            message: 'Invalid password',
          });
        }

        const token = generateAccessToken(user);
        return res.status(200).json({
          message: 'Successfully logged in',
          token,
          user: { id: user.id, email: user.email, role: user.role },
        });
      } catch (e) {
        return res.status(500).json({
          message: 'Internal server error',
          err: e,
        });
      }
    },
  );

  router.post(
    '/registration',
    checkRegistration,
    async (req: Request, res: Response, _next: NextFunction) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { name, surname, nickName, email, age, role, password } =
          req.body;

        const userExisted = await models.User.findOne({
          where: {
            email,
          },
        });
        if (userExisted) {
          return res.status(400).json({
            message: 'User already exists',
          });
        }

        const newUser = await models.User.create({
          name,
          surname,
          nickName,
          email,
          age,
          role,
          password,
        });

        const response = {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        };

        return res.status(201).json({
          message: 'Successfully registered',
          user: response,
        });
      } catch (e) {
        return res.status(500).json({
          message: 'Internal server error',
          err: e,
        });
      }
    },
  );

  return router;
};
