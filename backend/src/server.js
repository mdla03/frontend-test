import cors from 'cors'
import express from 'express'
import { ENV } from './config/env.js'
import authRoute from './routes/auth.route.js'
import eventsRoute from './routes/events.route.js'
import meRoute from './routes/me.route.js'
import rewardsRoute from './routes/rewards.route.js'
import adminRoute from './routes/admin.route.js'

const app = express()

app.use(cors({ origin: ENV.CORS_ORIGIN }))
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRoute)
app.use('/api/events', eventsRoute)
app.use('/api/me', meRoute)
app.use('/api', rewardsRoute)
app.use('/api/admin', adminRoute)

app.use((req, res) => res.status(404).json({ error: 'Not found' }))

app.listen(ENV.PORT, () => {
  console.log(`Bayanihan API listening on port ${ENV.PORT}`)
})
