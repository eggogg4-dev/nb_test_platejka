import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import pino from 'pino'

import paymentsRouter from './routes/payments.js'
import webhookRouter from './routes/webhook.js'
import healthRouter from './routes/health.js'
import { createOrder } from './services/paymtech.js'
import { createOrderSchema } from './utils/validate.js'

const app = express()
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.use('/api', paymentsRouter)
app.use('/api/webhook', webhookRouter)
app.use('/api/health', healthRouter)

// Root-level create-payment endpoint for frontend compatibility
app.post('/create-payment', async (req, res, next) => {
  try {
    const { value, error } = createOrderSchema.validate(req.body, { abortEarly: false })
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) })

    const payload = {
      amount: value.amount,
      currency: value.currency,
      merchant_order_id: value.merchant_order_id,
      description: value.description,
      return_url: value.return_url,
      callback_url: value.callback_url,
      extra: value.extra
    }

    const data = await createOrder(payload)
    
    // Extract payment_url from Paymtech response
    // Paymtech typically returns: payment_url, redirect_url, checkout_url, or url
    const payment_url = data.payment_url || data.redirect_url || data.checkout_url || data.url || data.link
    
    if (!payment_url) {
      return res.status(500).json({ 
        error: 'Payment URL not found in provider response',
        provider_response: data 
      })
    }

    res.json({ payment_url })
  } catch (err) {
    next(err)
  }
})

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
