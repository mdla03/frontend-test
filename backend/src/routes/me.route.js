import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { myRegistrations } from '../controllers/registrations/getRequests.controller.js'
import { myRewards } from '../controllers/rewards/getRequests.controller.js'

const router = Router()

router.use(authMiddleware)
router.get('/registrations', myRegistrations)
router.get('/rewards', myRewards)

export default router
