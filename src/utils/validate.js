import Joi from 'joi'

export const createOrderSchema = Joi.object({
  amount: Joi.number().integer().min(1).required(),
  description: Joi.string().max(255).required(),
}).unknown(false) // разрешаем ТОЛЬКО amount и description

export const orderStatusSchema = Joi.object({
  order_id: Joi.string().required()
})
