import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'
import { analytics, listUsers } from '../controllers/admin/getRequests.controller.js'
import { updateUser } from '../controllers/admin/updateRequests.controller.js'

const router = Router()

router.use(authMiddleware, requireRole('admin'))

router.get('/users', listUsers)
router.patch('/users/:id', updateUser)
router.get('/analytics', analytics)

export default router
