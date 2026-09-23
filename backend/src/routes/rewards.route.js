import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { leaderboard } from '../controllers/rewards/getRequests.controller.js'

const router = Router()

router.use(authMiddleware)
router.get('/leaderboard', leaderboard)

export default router
