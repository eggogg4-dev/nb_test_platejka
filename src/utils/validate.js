import Joi from 'joi'

export const createOrderSchema = Joi.object({
  amount: Joi.number().integer().min(1).required(),
  currency: Joi.string().uppercase().length(3).default('KZT'),
  merchant_order_id: Joi.string().max(128).required(),
  description: Joi.string().max(255).required(),
  return_url: Joi.string().uri().required(),
  callback_url: Joi.string().uri().required(),
  extra: Joi.object().unknown(true).default({})
})

export const orderStatusSchema = Joi.object({
  order_id: Joi.string().required()
})
