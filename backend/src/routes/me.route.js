import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { myRegistrations } from '../controllers/registrations/getRequests.controller.js'
import { myRewards } from '../controllers/rewards/getRequests.controller.js'
import { applyOrganizer } from '../controllers/me/postRequests.controller.js'

const router = Router()

router.use(authMiddleware)
router.get('/', (req, res) => res.json({ data: req.user }))
router.get('/registrations', myRegistrations)
router.get('/rewards', myRewards)
router.post('/apply-organizer', applyOrganizer)

export default router
