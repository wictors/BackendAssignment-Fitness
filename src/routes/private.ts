import {
	Router,
	Request,
	Response,
	NextFunction
} from 'express'

import { models } from '../db'
import { authenticateToken } from '../auth/authorizationToken'

const router: Router = Router()

const {
	Program
} = models

export default () => {
    router.use(authenticateToken);
	router.get('/private', async (_req: Request, res: Response, _next: NextFunction) => {
		const programs = await Program.findAll()
		return res.json({
			data: programs,
			message: 'List of private programs'
		})
	})
	return router
}