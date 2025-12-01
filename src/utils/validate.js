import Joi from 'joi'

// Optional env-based defaults so фронт может не передавать все поля
const {
  PAYMTECH_RETURN_URL,
  PAYMTECH_CALLBACK_URL
} = process.env

export const createOrderSchema = Joi.object({
  amount: Joi.number().integer().min(1).required(),
  currency: Joi.string().uppercase().length(3).default('KZT'),
  // Если фронт не прислал merchant_order_id — сгенерируем простой id
  merchant_order_id: Joi.string()
    .max(128)
    .default(() => `order-${Date.now()}`)
    .optional(),
  description: Joi.string().max(255).required(),
  // Если фронт не шлёт return_url / callback_url — подставляем дефолты из ENV
  return_url: Joi.string()
    .uri()
    .default(PAYMTECH_RETURN_URL)
    .optional(),
  callback_url: Joi.string()
    .uri()
    .default(PAYMTECH_CALLBACK_URL)
    .optional(),
  extra: Joi.object().unknown(true).default({})
})

export const orderStatusSchema = Joi.object({
  order_id: Joi.string().required()
})
