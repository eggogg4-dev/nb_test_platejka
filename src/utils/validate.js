import Joi from 'joi'

export const createOrderSchema = Joi.object({
  amount: Joi.number().integer().min(1).required(),
  currency: Joi.string().uppercase().length(3).default('KZT'),
  // Если фронт не прислал merchant_order_id — сгенерируем простой id
  merchant_order_id: Joi.string()
    .max(128)
    .default(() => `order-${Date.now()}`)
    .optional(),
  description: Joi.string().max(255).required(),
  // Делаем URL-ы опциональными, без принудительного default()
  return_url: Joi.string()
    .uri()
    .optional(),
  callback_url: Joi.string()
    .uri()
    .optional(),
  extra: Joi.object().unknown(true).default({})
})

export const orderStatusSchema = Joi.object({
  order_id: Joi.string().required()
})
