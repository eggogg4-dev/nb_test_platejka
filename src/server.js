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
    logger.info({ body: req.body }, 'Incoming create-payment request')

    // ВАЖНО: для create-payment не трогаем payload — отправляем в Paymtech "как есть",
    // чтобы соответствовать их ожидаемому формату (amount, currency, description, customer, callbackUrl, returnUrl и т.д.)
    const data = await createOrder(req.body)
    
    // Extract payment_url from Paymtech response (имена полей могут отличаться)
    const payment_url = data.payment_url || data.redirect_url || data.checkout_url || data.url || data.link
    
    if (!payment_url) {
      logger.error({ provider_response: data }, 'Payment URL not found in provider response')
      // Возвращаем весь ответ Paymtech наверх, чтобы фронт мог показать реальную ошибку
      return res.status(502).json({ 
        error: 'Payment URL not found in provider response',
        provider_response: data 
      })
    }

    res.json({ payment_url })
  } catch (err) {
    logger.error(
      { err: err.response?.data || err.message },
      'Unhandled error in /create-payment (provider error)'
    )

    // Если Paymtech вернул 4xx/5xx с телом — пробрасываем статус и тело наверх
    if (err.response) {
      return res
        .status(err.response.status || 502)
        .json({
          error: 'Provider error',
          provider_response: err.response.data
        })
    }

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
