import { Router } from 'express'
import { createOrder, getOrderStatus } from '../services/paymtech.js'
import { createOrderSchema, orderStatusSchema } from '../utils/validate.js'

const router = Router()

router.post('/create-order', async (req, res, next) => {
  try {
    const { value, error } = createOrderSchema.validate(req.body, { abortEarly: false })
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) })

    // Map your local payload to Paymtech expected fields as needed:
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
    res.json({ ok: true, provider_response: data })
  } catch (err) {
    next(err)
  }
})

router.get('/status/:order_id', async (req, res, next) => {
  try {
    const { value, error } = orderStatusSchema.validate({ order_id: req.params.order_id })
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) })
    const data = await getOrderStatus(value.order_id)
    res.json({ ok: true, provider_response: data })
  } catch (err) {
    next(err)
  }
})

export default router
