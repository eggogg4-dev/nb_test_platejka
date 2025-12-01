import { Router } from 'express'
import crypto from 'crypto'

const router = Router()
const WEBHOOK_SECRET = process.env.PAYMTECH_WEBHOOK_SECRET || ''

// Generic webhook endpoint: adjust verification per provider docs.
router.post('/paymtech', (req, res) => {
  const sig = req.get('X-Signature') || ''
  const body = JSON.stringify(req.body || {})

  let verified = false
  if (WEBHOOK_SECRET) {
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex')
    verified = crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(sig || '', 'utf8'))
  }

  // Log event (replace with DB write if needed)
  console.log('Webhook event:', { verified, sig, body: req.body })

  res.status(200).json({ received: true, verified })
})

export default router
