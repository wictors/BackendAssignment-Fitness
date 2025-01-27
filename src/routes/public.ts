import {
	Router,
	Request,
	Response,
	NextFunction
} from 'express'

import { models } from '../db'
import { generateAccessToken } from '../auth/authorizationToken'

const router: Router = Router()

const {
	Program, Exercise
} = models

export default () => {
	router.get('/programs', async (_req: Request, res: Response, _next: NextFunction) => {
		const programs = await Program.findAll()
		return res.json({
			data: programs,
			message: 'List of programs'
		})
	})

    router.get('/exercises', async (_req: Request, res: Response, _next: NextFunction) => {
            const exercises = await Exercise.findAll({
                include: [{
                    model: Program,
                    as: 'program'
                }]
            })
    
            return res.json({
                data: exercises,
                message: 'List of exercises'
            })
    })

	router.post('/login', async (req: Request, res: Response, _next: NextFunction) => {
		const token = generateAccessToken()
		return res.json({
			token,
			message: 'Successfully logged in'
		})
	})

	return router
}