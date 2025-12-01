import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import pino from 'pino'

import paymentsRouter from './routes/payments.js'
import webhookRouter from './routes/webhook.js'
import healthRouter from './routes/health.js'

const app = express()
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.use('/api', paymentsRouter)
app.use('/api/webhook', webhookRouter)
app.use('/api/health', healthRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl })
})

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err, 'Unhandled error')
  res.status(err.status || 500).json({ error: err.message || 'Internal error' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  logger.info(`Server listening on http://0.0.0.0:${PORT}`)
})
