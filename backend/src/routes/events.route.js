import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'
import { getEvent, listEvents, nearbyEvents } from '../controllers/events/getRequests.controller.js'
import { createEvent } from '../controllers/events/postRequests.controller.js'
import { updateEvent, updateEventStatus } from '../controllers/events/updateRequests.controller.js'
import { eventRegistrations } from '../controllers/registrations/getRequests.controller.js'
import { registerForEvent } from '../controllers/registrations/postRequests.controller.js'
import { cancelRegistration } from '../controllers/registrations/deleteRequest.controller.js'

const router = Router()

router.use(authMiddleware)

router.get('/nearby', nearbyEvents)
router.get('/', listEvents)
router.get('/:id', getEvent)
router.post('/', requireRole('organizer'), createEvent)
router.patch('/:id', requireRole('organizer'), updateEvent)
router.patch('/:id/status', requireRole('admin'), updateEventStatus)

router.post('/:id/register', requireRole('user'), registerForEvent)
router.delete('/:id/register', requireRole('user'), cancelRegistration)
router.get('/:id/registrations', requireRole('organizer', 'admin'), eventRegistrations)

export default router
