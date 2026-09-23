import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { login, register } from '../controllers/auth/postRequests.controller.js'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.get('/me', authMiddleware, (req, res) => res.json({ data: req.user }))

export default router
