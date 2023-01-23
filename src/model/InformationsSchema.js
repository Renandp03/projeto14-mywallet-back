import Joi from "joi"

export const dataInformationSchema = Joi.object({
    date:Joi.string().min(5).max(5).required(),
    description:Joi.string().max(20),
    type:Joi.string().valid("green","red"),
    value:Joi.string()
})